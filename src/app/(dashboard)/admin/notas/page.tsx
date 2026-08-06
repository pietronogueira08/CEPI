import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notas | CEPI",
  description: "Visão geral de notas dos alunos",
};

export default async function NotasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const students = await prisma.studentProfile.findMany({
    include: {
      user: { select: { name: true } },
      grades: { include: { subject: true } },
    },
  });

  const getGradeColor = (value: number) => {
    if (value >= 7) return "#2D7D46"; // Green
    if (value >= 5) return "#C4622D"; // Orange/Yellow
    return "#DC2626"; // Red
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Visão Geral de Notas</h1>
        <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "4px" }}>Acompanhe o desempenho dos alunos por disciplina.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {students.map((student) => {
          // Calculate average per subject
          const subjectGrades: Record<string, { total: number; count: number; name: string }> = {};
          
          student.grades.forEach((g) => {
            if (!subjectGrades[g.subjectId]) {
              subjectGrades[g.subjectId] = { total: 0, count: 0, name: g.subject.name };
            }
            subjectGrades[g.subjectId].total += g.value;
            subjectGrades[g.subjectId].count += 1;
          });

          const averages = Object.values(subjectGrades).map(sg => ({
            name: sg.name,
            average: sg.total / sg.count
          }));

          return (
            <div key={student.id} style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1E293B", margin: "0 0 16px 0" }}>{student.user.name}</h3>
              
              {averages.length > 0 ? (
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {averages.map((avg, i) => (
                    <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "12px 16px", minWidth: "120px" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        {avg.name}
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: getGradeColor(avg.average) }}>
                        {avg.average.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#94A3B8", fontStyle: "italic" }}>Sem notas registradas</p>
              )}
            </div>
          );
        })}

        {students.length === 0 && (
          <div style={{ background: "white", borderRadius: 14, padding: "40px", border: "1px solid #E2E8F0", textAlign: "center", color: "#64748B" }}>
            Nenhum aluno encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
