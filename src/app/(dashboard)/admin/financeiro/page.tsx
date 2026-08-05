import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { InvoiceCard } from "@/components/financial/InvoiceCard";
import { CreditCard, TrendingUp, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Financeiro" };

export default async function FinancialPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  const canManage = ["ADMIN", "SECRETARY"].includes(role);

  const currentYear = new Date().getFullYear();

  const invoices = await prisma.invoice.findMany({
    where: canManage ? { year: currentYear } : undefined,
    include: { student: { include: { user: { select: { name: true } } } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    take: canManage ? undefined : 20,
  });

  const paid = invoices.filter((i) => i.status === "PAID");
  const pending = invoices.filter((i) => i.status === "PENDING");
  const overdue = invoices.filter((i) => i.status === "OVERDUE");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Financeiro</h1>
        <p className="page-subtitle">Gestão de boletos e mensalidades · {currentYear}</p>
      </div>

      {/* Stats */}
      {canManage && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}>
          <StatPill icon={<CheckCircle size={16} />} label="Pagos" count={paid.length}
            amount={paid.reduce((s, i) => s + i.amount, 0)} color="#2D7D46" />
          <StatPill icon={<Clock size={16} />} label="Pendentes" count={pending.length}
            amount={pending.reduce((s, i) => s + i.amount, 0)} color="#C4622D" />
          <StatPill icon={<AlertCircle size={16} />} label="Vencidos" count={overdue.length}
            amount={overdue.reduce((s, i) => s + i.amount, 0)} color="#DC2626" />
          <StatPill icon={<TrendingUp size={16} />} label="Total" count={invoices.length}
            amount={invoices.reduce((s, i) => s + i.amount, 0)} color="#1E3A5F" />
        </div>
      )}

      {/* Invoice list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {invoices.length === 0 ? (
          <div style={{
            background: "white",
            borderRadius: 14,
            padding: 48,
            textAlign: "center",
            border: "1px solid #E2E8F0",
          }}>
            <CreditCard size={48} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#64748B", fontWeight: 500 }}>Nenhum boleto encontrado</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice as any}
              canManage={canManage}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon, label, count, amount, color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  amount: number;
  color: string;
}) {
  return (
    <div style={{
      background: "white",
      borderRadius: 12,
      padding: "14px 16px",
      border: "1px solid #E2E8F0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color }}>
        {icon}
        <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
        {formatCurrency(amount)}
      </p>
      <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 2 }}>{count} boletos</p>
    </div>
  );
}
