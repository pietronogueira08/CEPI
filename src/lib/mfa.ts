import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = process.env.MFA_ISSUER || "CEPI Gestão Escolar";

/**
 * Gera um segredo MFA para o usuário
 */
export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Gera a URI otpauth para configuração do autenticador
 */
export function generateOtpAuthUri(secret: string, email: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

/**
 * Gera o QR Code como Data URL para ser exibido na tela
 */
export async function generateQRCode(otpAuthUri: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUri, {
    width: 256,
    margin: 2,
    color: {
      dark: "#1E3A5F",
      light: "#FFFFFF",
    },
  });
}

/**
 * Verifica se o token TOTP fornecido pelo usuário é válido
 */
export function verifyMfaToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

/**
 * Verifica se o usuário requer MFA (apenas ADMIN e SECRETARY)
 */
export function requiresMfa(role: string): boolean {
  return role === "ADMIN" || role === "SECRETARY";
}
