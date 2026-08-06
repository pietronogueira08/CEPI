import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Turmas | CEPI",
  description: "Gerenciamento de turmas",
};

export default async function TurmasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { enrollments: true } },
      teachers: {
        include: {
          teacher: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" }
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Turmas</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "4px" }}>Visualize todas as turmas e seus responsáveis.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "#1E3A5F", color: "white", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
          <BookOpen size={18} />
          Nova Turma
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Turma</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Série</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Turno</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Alunos</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Professores</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < classes.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>{c.grade}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>{c.shift}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 500 }}>{c._count.enrollments}</span>
                      <span style={{ color: "#94A3B8" }}>/ {c.maxStudents}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>
                    {c.teachers.length > 0 ? (
                      c.teachers.map(t => t.teacher.user.name).join(", ")
                    ) : (
                      <span style={{ color: "#94A3B8", fontStyle: "italic" }}>Sem professor</span>
                    )}
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#64748B", fontSize: "0.875rem" }}>
                    Nenhuma turma encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
