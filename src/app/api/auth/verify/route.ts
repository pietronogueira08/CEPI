import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { verifyMfaToken, requiresMfa } from "@/lib/mfa";

export async function POST(req: NextRequest) {
  try {
    const { email, password, mfaToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 401 });
    }

    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });
    }

    // Verificação MFA
    if (requiresMfa(user.role)) {
      if (!user.mfaEnabled) {
        return NextResponse.json({ error: "MFA_SETUP_REQUIRED" }, { status: 200 });
      }
      if (!mfaToken) {
        return NextResponse.json({ error: "MFA_REQUIRED" }, { status: 200 });
      }
      const mfaValid = verifyMfaToken(mfaToken, user.mfaSecret!);
      if (!mfaValid) {
        return NextResponse.json({ error: "MFA_INVALID" }, { status: 401 });
      }
    }

    // Credenciais OK — cliente pode chamar signIn()
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Erro no verify:", e);
    return NextResponse.json({ error: "SERVER_ERROR", message: e.message }, { status: 500 });
  }
}
