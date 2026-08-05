import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LayoutDashboard, CreditCard, Users, ClipboardList, Bell } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Secretaria" };

export default async function SecretaryDashboard() {
  const session = await auth();
  if (!session || (session.user as any).role !== "SECRETARY") redirect("/login");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [totalStudents, pendingInvoices, overdueInvoices, recentStudents] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", active: true } }),
    prisma.invoice.aggregate({
      where: { year: currentYear, status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { year: currentYear, status: "OVERDUE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", active: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Secretaria</h1>
        <p className="page-subtitle">
          {getMonthName(currentMonth)} {currentYear} · {session.user.name}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div className="stat-card primary">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Alunos</p>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(30,58,95,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={16} color="#1E3A5F" />
            </div>
          </div>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.04em", marginBottom: 4 }}>{totalStudents}</p>
          <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>alunos ativos</p>
        </div>

        <div className="stat-card warning">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pendências</p>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(196,98,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={16} color="#C4622D" />
            </div>
          </div>
          <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 4 }}>
            {formatCurrency(pendingInvoices._sum.amount || 0)}
          </p>
          <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{pendingInvoices._count} boletos pendentes</p>
        </div>

        <a href="/secretary/financeiro" style={{
          background: "white",
          borderRadius: 14,
          padding: 20,
          border: "2px dashed #E2E8F0",
          textAlign: "center",
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.2s",
        }}>
          <ClipboardList size={24} color="#1E3A5F" />
          <p style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.85rem" }}>Gerenciar Financeiro</p>
        </a>
      </div>

      {/* Recent students */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Alunos Recentes</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {recentStudents.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ color: "#64748B" }}>{s.email}</td>
                <td style={{ color: "#64748B" }}>
                  {new Intl.DateTimeFormat("pt-BR").format(new Date(s.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
