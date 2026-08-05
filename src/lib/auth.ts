import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { verifyMfaToken, requiresMfa } from "@/lib/mfa";

class CustomAuthError extends CredentialsSignin {
  code: string;
  constructor(code: string) {
    super();
    this.code = code;
  }
}

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
        if (!credentials?.email || !credentials?.password) {
          throw new CustomAuthError("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.active) {
          throw new CustomAuthError("Usuário não encontrado ou inativo");
        }

        const passwordValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordValid) {
          throw new CustomAuthError("Senha incorreta");
        }

        // Verificação MFA para ADMIN e SECRETARY
        if (requiresMfa(user.role)) {
          if (user.mfaEnabled) {
            if (!credentials.mfaToken) {
              throw new CustomAuthError("MFA_REQUIRED");
            }
            const mfaValid = verifyMfaToken(
              credentials.mfaToken as string,
              user.mfaSecret!
            );
            if (!mfaValid) {
              throw new CustomAuthError("Código MFA inválido ou expirado");
            }
          } else {
            // MFA não configurado ainda — precisa configurar
            throw new CustomAuthError("MFA_SETUP_REQUIRED");
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
      },
    }),
  ],
});
