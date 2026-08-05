import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BookOpen, ClipboardList, FileText, UserCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Professor" };

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session || (session.user as any).role !== "TEACHER") redirect("/login");

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId: session.user.id },
    include: {
      classes: { include: { class: { include: { enrollments: { where: { status: "ACTIVE" } } } } } },
    },
  });

  const classes = teacherProfile?.classes.map((ct) => ct.class) || [];
  const totalStudents = classes.reduce((acc, c) => acc + c.enrollments.length, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Olá, {session.user.name?.split(" ")[0]}!</h1>
        <p className="page-subtitle">Painel do Professor · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Minhas Turmas", value: classes.length, icon: BookOpen, color: "#1E3A5F", bg: "rgba(30,58,95,0.08)" },
          { label: "Alunos", value: totalStudents, icon: UserCheck, color: "#2D7D46", bg: "rgba(45,125,70,0.08)" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #E2E8F0" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={18} color={s.color} />
              </div>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.04em" }}>{s.value}</p>
              <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { label: "Diário de Classe", desc: "Lançar notas e frequência", icon: ClipboardList, href: "/teacher/diario" },
          { label: "Minhas Turmas", desc: "Ver alunos matriculados", icon: BookOpen, href: "/teacher/turmas" },
          { label: "Notas", desc: "Relatório de notas", icon: FileText, href: "/teacher/notas" },
          { label: "Frequência", desc: "Controle de presença", icon: UserCheck, href: "/teacher/frequencia" },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <a key={i} href={action.href} style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #E2E8F0",
              textDecoration: "none",
              display: "block",
              transition: "all 0.2s ease",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(30,58,95,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={20} color="#1E3A5F" />
              </div>
              <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", marginBottom: 4 }}>{action.label}</p>
              <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{action.desc}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
