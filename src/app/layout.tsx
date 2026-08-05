import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CEPI — Centro Educacional Pequena Isa",
    template: "%s | CEPI",
  },
  description:
    "Sistema de Gestão Escolar do Centro Educacional Pequena Isa, localizado em Grussaí. Gerencie matrículas, notas, frequência e financeiro com facilidade.",
  keywords: ["escola", "gestão escolar", "CEPI", "Grussaí", "matrícula", "notas"],
  authors: [{ name: "CEPI" }],
  robots: "noindex, nofollow", // Sistema privado
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E3A5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
