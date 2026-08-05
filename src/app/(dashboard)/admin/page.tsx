import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Users, GraduationCap, CreditCard, AlertCircle,
  TrendingUp, CheckCircle, Clock, BookOpen
} from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Admin" };

async function getDashboardData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [
    totalStudents,
    totalTeachers,
    activeEnrollments,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", active: true } }),
    prisma.user.count({ where: { role: "TEACHER", active: true } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.aggregate({
      where: { year: currentYear, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
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
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        class: true,
      },
    }),
  ]);

  return {
    totalStudents,
    totalTeachers,
    activeEnrollments,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    recentEnrollments,
    currentMonth,
    currentYear,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const data = await getDashboardData();

  const stats = [
    {
      label: "Alunos Ativos",
      value: data.totalStudents,
      icon: Users,
      color: "primary",
      sub: `${data.activeEnrollments} matrículas ativas`,
    },
    {
      label: "Professores",
      value: data.totalTeachers,
      icon: BookOpen,
      color: "secondary",
      sub: "Corpo docente",
    },
    {
      label: "Recebido",
      value: formatCurrency(data.paidInvoices._sum.amount || 0),
      icon: CheckCircle,
      color: "success",
      sub: `${data.paidInvoices._count} boletos · ${getMonthName(data.currentMonth)}`,
    },
    {
      label: "Inadimplência",
      value: formatCurrency(data.overdueInvoices._sum.amount || 0),
      icon: AlertCircle,
      color: "warning",
      sub: `${data.overdueInvoices._count} boletos vencidos`,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Visão geral do CEPI · {getMonthName(data.currentMonth)} {data.currentYear}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`stat-card ${stat.color}`} style={{
              animationDelay: `${i * 80}ms`,
              animation: "fadeInUp 0.4s ease forwards",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {stat.label}
                </p>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: stat.color === "primary" ? "rgba(30,58,95,0.1)"
                    : stat.color === "secondary" ? "rgba(244,196,48,0.2)"
                    : stat.color === "success" ? "rgba(45,125,70,0.1)"
                    : "rgba(196,98,45,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon size={18} color={
                    stat.color === "primary" ? "#1E3A5F"
                    : stat.color === "secondary" ? "#C4622D"
                    : stat.color === "success" ? "#2D7D46"
                    : "#C4622D"
                  } />
                </div>
              </div>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 6 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Matrículas Recentes */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
              Matrículas Recentes
            </h2>
            <a href="/admin/matriculas" style={{ fontSize: "0.78rem", color: "#1E3A5F", fontWeight: 600, textDecoration: "none" }}>
              Ver todas →
            </a>
          </div>
          <div>
            {data.recentEnrollments.length === 0 ? (
              <p style={{ padding: 20, color: "#94A3B8", fontSize: "0.85rem", textAlign: "center" }}>
                Nenhuma matrícula recente
              </p>
            ) : (
              data.recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#1E3A5F",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {enrollment.student.user.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {enrollment.student.user.name}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {enrollment.class.name} · {enrollment.class.grade}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#2D7D46", fontWeight: 600, background: "rgba(45,125,70,0.1)", padding: "3px 8px", borderRadius: 20 }}>
                    Ativo
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Situação Financeira */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
              Financeiro {data.currentYear}
            </h2>
            <a href="/admin/financeiro" style={{ fontSize: "0.78rem", color: "#1E3A5F", fontWeight: 600, textDecoration: "none" }}>
              Gerenciar →
            </a>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <FinancialItem
              icon={<CheckCircle size={16} color="#2D7D46" />}
              label="Recebido"
              amount={data.paidInvoices._sum.amount || 0}
              count={data.paidInvoices._count}
              color="#2D7D46"
              bg="rgba(45,125,70,0.08)"
            />
            <FinancialItem
              icon={<Clock size={16} color="#C4622D" />}
              label="Pendente"
              amount={data.pendingInvoices._sum.amount || 0}
              count={data.pendingInvoices._count}
              color="#C4622D"
              bg="rgba(196,98,45,0.08)"
            />
            <FinancialItem
              icon={<AlertCircle size={16} color="#DC2626" />}
              label="Vencido"
              amount={data.overdueInvoices._sum.amount || 0}
              count={data.overdueInvoices._count}
              color="#DC2626"
              bg="rgba(220,38,38,0.08)"
            />

            {/* Barra de progresso de arrecadação */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", color: "#64748B" }}>Taxa de arrecadação</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2D7D46" }}>
                  {data.paidInvoices._count + data.pendingInvoices._count + data.overdueInvoices._count > 0
                    ? Math.round((data.paidInvoices._count / (data.paidInvoices._count + data.pendingInvoices._count + data.overdueInvoices._count)) * 100)
                    : 0}%
                </span>
              </div>
              <div style={{ height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #2D7D46, #3DA85E)",
                  width: `${data.paidInvoices._count + data.pendingInvoices._count + data.overdueInvoices._count > 0
                    ? (data.paidInvoices._count / (data.paidInvoices._count + data.pendingInvoices._count + data.overdueInvoices._count)) * 100
                    : 0}%`,
                  borderRadius: 99,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialItem({
  icon, label, amount, count, color, bg,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: bg,
      borderRadius: 10,
      padding: "12px 14px",
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: "1rem", fontWeight: 800, color, letterSpacing: "-0.02em" }}>
          {formatCurrency(amount)}
        </p>
      </div>
      <span style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>
        {count} bol.
      </span>
    </div>
  );
}
