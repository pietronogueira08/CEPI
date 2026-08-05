import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { FileText, CreditCard, UserCheck, Bell } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Responsável" };

export default async function ParentDashboard() {
  const session = await auth();
  if (!session || (session.user as any).role !== "PARENT") redirect("/login");

  const parentProfile = await prisma.parentProfile.findFirst({
    where: { userId: session.user.id },
    include: {
      children: {
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              enrollments: {
                where: { status: "ACTIVE" },
                include: { class: true },
              },
              invoices: {
                where: { status: { in: ["PENDING", "OVERDUE"] } },
                orderBy: { dueDate: "asc" },
                take: 3,
              },
              grades: {
                include: { subject: true },
                orderBy: { period: "desc" },
                take: 8,
              },
            },
          },
        },
      },
    },
  });

  const currentMonth = new Date().getMonth() + 1;

  if (!parentProfile || parentProfile.children.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Olá, {session.user.name?.split(" ")[0]}!</h1>
          <p className="page-subtitle">Painel do Responsável</p>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: 48, textAlign: "center", border: "1px solid #E2E8F0" }}>
          <p style={{ color: "#64748B" }}>Nenhum aluno vinculado à sua conta.</p>
        </div>
      </div>
    );
  }

  const child = parentProfile.children[0].student;
  const pendingInvoices = child.invoices;
  const currentClass = child.enrollments[0]?.class;
  const recentGrades = child.grades;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Olá, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="page-subtitle">
          Acompanhando: <strong>{child.user.name}</strong>
          {currentClass && ` · ${currentClass.name}`}
        </p>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <QuickCard
          icon={<FileText size={20} color="#1E3A5F" />}
          label="Boletim"
          value={recentGrades.length > 0 ? `${recentGrades.length} notas` : "Ver notas"}
          href={`/parent/boletim`}
          bg="rgba(30,58,95,0.08)"
        />
        <QuickCard
          icon={<CreditCard size={20} color={pendingInvoices.length > 0 ? "#DC2626" : "#2D7D46"} />}
          label="Financeiro"
          value={pendingInvoices.length > 0 ? `${pendingInvoices.length} pendente${pendingInvoices.length > 1 ? "s" : ""}` : "Em dia ✓"}
          href="/parent/financeiro"
          bg={pendingInvoices.length > 0 ? "rgba(220,38,38,0.08)" : "rgba(45,125,70,0.08)"}
          alert={pendingInvoices.length > 0}
        />
        <QuickCard
          icon={<UserCheck size={20} color="#1E3A5F" />}
          label="Frequência"
          value="Ver presença"
          href="/parent/frequencia"
          bg="rgba(30,58,95,0.08)"
        />
        <QuickCard
          icon={<Bell size={20} color="#C4622D" />}
          label="Avisos"
          value="Verificar"
          href="/parent/notificacoes"
          bg="rgba(196,98,45,0.08)"
        />
      </div>

      {/* Pending invoices alert */}
      {pendingInvoices.length > 0 && (
        <div style={{
          background: "rgba(220,38,38,0.05)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <p style={{ fontWeight: 700, color: "#DC2626", marginBottom: 8, fontSize: "0.9rem" }}>
            ⚠️ {pendingInvoices.length} boleto{pendingInvoices.length > 1 ? "s" : ""} pendente{pendingInvoices.length > 1 ? "s" : ""}
          </p>
          {pendingInvoices.map((inv) => (
            <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#64748B", marginTop: 4 }}>
              <span>{inv.description}</span>
              <strong style={{ color: "#DC2626" }}>{formatCurrency(inv.amount)}</strong>
            </div>
          ))}
          <a href="/parent/financeiro" style={{
            display: "inline-block",
            marginTop: 12,
            fontSize: "0.82rem",
            color: "#DC2626",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            Ver boletos →
          </a>
        </div>
      )}

      {/* Recent grades */}
      {recentGrades.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Notas Recentes</h2>
            <a href="/parent/boletim" style={{ fontSize: "0.78rem", color: "#1E3A5F", fontWeight: 600, textDecoration: "none" }}>Boletim completo →</a>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {recentGrades.slice(0, 5).map((grade) => {
              const color = grade.value >= 7 ? "#2D7D46" : grade.value >= 5 ? "#C4622D" : "#DC2626";
              const bg = grade.value >= 7 ? "rgba(45,125,70,0.08)" : grade.value >= 5 ? "rgba(196,98,45,0.08)" : "rgba(220,38,38,0.08)";
              return (
                <div key={grade.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color,
                    fontWeight: 800,
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}>
                    {grade.value.toFixed(1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0F172A" }}>{grade.subject.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{grade.period}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickCard({
  icon, label, value, href, bg, alert = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  bg: string;
  alert?: boolean;
}) {
  return (
    <a href={href} style={{
      background: "white",
      borderRadius: 12,
      padding: "16px",
      border: `1px solid ${alert ? "rgba(220,38,38,0.25)" : "#E2E8F0"}`,
      textDecoration: "none",
      display: "block",
      transition: "all 0.2s ease",
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>{value}</p>
    </a>
  );
}
