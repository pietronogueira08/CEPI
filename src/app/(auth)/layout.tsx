import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-container gradient-hero">
      {children}
    </main>
  );
}
