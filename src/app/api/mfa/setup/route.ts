import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateMfaSecret, generateOtpAuthUri, generateQRCode } from "@/lib/mfa";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const secret = generateMfaSecret();
  const otpUri = generateOtpAuthUri(secret, email);
  const qrCode = await generateQRCode(otpUri);

  // Salva o segredo temporário (não ativo ainda)
  await prisma.user.update({
    where: { email },
    data: { mfaSecret: secret },
  });

  return NextResponse.json({ qrCode, secret });
}
