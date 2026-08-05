import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { FileText, CreditCard, UserCheck, GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Aluno" };

export default async function StudentDashboard() {
  const session = await auth();
  if (!session || (session.user as any).role !== "STUDENT") redirect("/login");

  const studentProfile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: { class: { include: { subjects: true } } },
      },
      grades: {
        include: { subject: true },
        orderBy: { period: "desc" },
        take: 5,
      },
      invoices: {
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        take: 3,
      },
    },
  });

  const currentClass = studentProfile?.enrollments[0]?.class;
  const pendingInvoices = studentProfile?.invoices || [];
  const recentGrades = studentProfile?.grades || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Olá, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="page-subtitle">
          {currentClass ? `${currentClass.name} · ${currentClass.grade}` : "Bem-vindo ao CEPI"}
        </p>
      </div>

      {/* Pending invoices */}
      {pendingInvoices.length > 0 && (
        <div style={{
          background: "rgba(220,38,38,0.05)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <p style={{ color: "#DC2626", fontWeight: 600, fontSize: "0.88rem" }}>
            {pendingInvoices.length} mensalidade{pendingInvoices.length > 1 ? "s" : ""} em aberto
          </p>
          <a href="/student/financeiro" style={{ color: "#DC2626", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none" }}>
            Ver →
          </a>
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Boletim", icon: FileText, href: "/student/boletim", color: "#1E3A5F", bg: "rgba(30,58,95,0.08)" },
          { label: "Financeiro", icon: CreditCard, href: "/student/financeiro", color: pendingInvoices.length > 0 ? "#DC2626" : "#2D7D46", bg: pendingInvoices.length > 0 ? "rgba(220,38,38,0.08)" : "rgba(45,125,70,0.08)" },
          { label: "Frequência", icon: UserCheck, href: "/student/frequencia", color: "#1E3A5F", bg: "rgba(30,58,95,0.08)" },
          { label: "Disciplinas", icon: GraduationCap, href: "/student/boletim", color: "#C4622D", bg: "rgba(196,98,45,0.08)" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <a key={i} href={item.href} style={{
              background: "white",
              borderRadius: 12,
              padding: 18,
              border: "1px solid #E2E8F0",
              textDecoration: "none",
              display: "block",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={18} color={item.color} />
              </div>
              <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>{item.label}</p>
            </a>
          );
        })}
      </div>

      {/* Recent grades */}
      {recentGrades.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Últimas Notas</h2>
            <a href="/student/boletim" style={{ fontSize: "0.78rem", color: "#1E3A5F", fontWeight: 600, textDecoration: "none" }}>Ver boletim →</a>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {recentGrades.map((grade) => {
              const color = grade.value >= 7 ? "#2D7D46" : grade.value >= 5 ? "#C4622D" : "#DC2626";
              const bg = grade.value >= 7 ? "rgba(45,125,70,0.08)" : grade.value >= 5 ? "rgba(196,98,45,0.08)" : "rgba(220,38,38,0.08)";
              return (
                <div key={grade.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
                    {grade.value.toFixed(1)}
                  </div>
                  <div>
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
