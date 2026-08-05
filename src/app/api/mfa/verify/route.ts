import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMfaToken } from "@/lib/mfa";

export async function POST(req: NextRequest) {
  const { email, token, secret } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const isValid = verifyMfaToken(token, secret || user.mfaSecret || "");

  if (!isValid) {
    return NextResponse.json({ success: false, error: "Token inválido" });
  }

  // Ativa o MFA na conta do usuário
  await prisma.user.update({
    where: { email },
    data: { mfaEnabled: true, mfaVerified: true, mfaSecret: secret || user.mfaSecret },
  });

  return NextResponse.json({ success: true });
}
