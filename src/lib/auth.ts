import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { verifyMfaToken, requiresMfa } from "@/lib/mfa";

class MFA_REQUIRED extends CredentialsSignin { code = "MFA_REQUIRED"; }
class MFA_SETUP_REQUIRED extends CredentialsSignin { code = "MFA_SETUP_REQUIRED"; }
class CREDENTIALS_INVALID extends CredentialsSignin { code = "CREDENTIALS_INVALID"; }
class USER_NOT_FOUND extends CredentialsSignin { code = "USER_NOT_FOUND"; }
class DATABASE_ERROR extends CredentialsSignin { code = "DATABASE_ERROR"; }

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "cepi-super-secret-key-change-in-production-2024",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.mfaVerified = (user as any).mfaVerified;
        token.mfaEnabled = (user as any).mfaEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).mfaVerified = token.mfaVerified;
        (session.user as any).mfaEnabled = token.mfaEnabled;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        mfaToken: { label: "Código MFA", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new CREDENTIALS_INVALID();
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.active) {
            throw new USER_NOT_FOUND();
          }

          const passwordValid = await compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!passwordValid) {
            throw new CREDENTIALS_INVALID();
          }

          // Verificação MFA para ADMIN e SECRETARY
          if (requiresMfa(user.role)) {
            if (user.mfaEnabled) {
              if (!credentials.mfaToken) {
                throw new MFA_REQUIRED();
              }
              const mfaValid = verifyMfaToken(
                credentials.mfaToken as string,
                user.mfaSecret!
              );
              if (!mfaValid) {
                throw new CREDENTIALS_INVALID();
              }
            } else {
              // MFA não configurado ainda — precisa configurar
              throw new MFA_SETUP_REQUIRED();
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
            mfaVerified: requiresMfa(user.role) ? true : true,
          };
        } catch (e: any) {
          if (e instanceof CredentialsSignin) {
            throw e; // Pass specific NextAuth classes forward
          }
          console.error("Erro interno no authorize:", e);
          throw new DATABASE_ERROR(); // Any other error (like Prisma connection failure)
        }
      },
    }),
  ],
});
