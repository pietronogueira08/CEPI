import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getGradeColor, calculateAverage } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Boletim Escolar" };

const PERIODS = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];

function GradeCell({ value }: { value: number | null }) {
  if (value === null) return (
    <div style={{
      width: 52,
      height: 44,
      borderRadius: 10,
      background: "#F8FAFC",
      border: "1px solid #E2E8F0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#CBD5E1",
      fontSize: "0.85rem",
    }}>—</div>
  );

  const colorClass = value >= 7 ? "#2D7D46" : value >= 5 ? "#C4622D" : "#DC2626";
  const bg = value >= 7 ? "rgba(45,125,70,0.08)" : value >= 5 ? "rgba(196,98,45,0.08)" : "rgba(220,38,38,0.08)";
  const border = value >= 7 ? "rgba(45,125,70,0.25)" : value >= 5 ? "rgba(196,98,45,0.25)" : "rgba(220,38,38,0.25)";

  return (
    <div style={{
      width: 52,
      height: 44,
      borderRadius: 10,
      background: bg,
      border: `1px solid ${border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: colorClass,
      fontSize: "1.1rem",
      fontWeight: 800,
      letterSpacing: "-0.03em",
    }}>
      {value.toFixed(1)}
    </div>
  );
}

export default async function BoletimPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role;

  // Get student profile based on role
  let studentProfile;
  if (role === "STUDENT") {
    studentProfile = await prisma.studentProfile.findFirst({
      where: { userId: session.user.id },
    });
  } else if (role === "PARENT") {
    // Parents see first enrolled child by default
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { userId: session.user.id },
      include: { children: { include: { student: true } } },
    });
    studentProfile = parentProfile?.children[0]?.student;
  }

  if (!studentProfile) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <FileText size={48} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#64748B" }}>Boletim não disponível.</p>
      </div>
    );
  }

  const grades = await prisma.grade.findMany({
    where: { studentId: studentProfile.id },
    include: { subject: true },
    orderBy: [{ subject: { name: "asc" } }, { period: "asc" }],
  });

  const studentUser = await prisma.user.findUnique({
    where: { id: studentProfile.userId },
    select: { name: true },
  });

  // Group by subject
  const bySubject: Record<string, { subject: string; grades: Record<string, number> }> = {};
  grades.forEach((g) => {
    if (!bySubject[g.subjectId]) {
      bySubject[g.subjectId] = { subject: g.subject.name, grades: {} };
    }
    bySubject[g.subjectId].grades[g.period] = g.value;
  });

  const subjects = Object.values(bySubject);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Boletim Escolar</h1>
        <p className="page-subtitle">{studentUser?.name} · Ano letivo {new Date().getFullYear()}</p>
      </div>

      {subjects.length === 0 ? (
        <div style={{
          background: "white",
          borderRadius: 14,
          padding: 48,
          textAlign: "center",
          border: "1px solid #E2E8F0",
        }}>
          <FileText size={48} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B" }}>Nenhuma nota lançada ainda.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card por disciplina (swipeable feel) */}
          <div className="lg:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subjects.map((sub, idx) => {
              const gradeValues = PERIODS.map((p) => sub.grades[p] ?? null).filter((v) => v !== null) as number[];
              const avg = calculateAverage(gradeValues);
              const avgColor = avg >= 7 ? "#2D7D46" : avg >= 5 ? "#C4622D" : "#DC2626";

              return (
                <div key={idx} style={{
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  animation: `fadeInUp 0.3s ease ${idx * 60}ms both`,
                }}>
                  <div style={{
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #F1F5F9",
                  }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>
                      {sub.subject}
                    </h3>
                    <div style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: avg >= 7 ? "rgba(45,125,70,0.1)" : avg >= 5 ? "rgba(196,98,45,0.1)" : "rgba(220,38,38,0.1)",
                      color: avgColor,
                      fontSize: "0.85rem",
                      fontWeight: 800,
                    }}>
                      Média: {avg > 0 ? avg.toFixed(1) : "—"}
                    </div>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 0,
                    padding: "12px 16px",
                  }}>
                    {PERIODS.map((period) => (
                      <div key={period} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase" }}>
                          {period.split(" ")[0]}
                        </p>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <GradeCell value={sub.grades[period] ?? null} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden lg:block" style={{
            background: "white",
            borderRadius: 14,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  {PERIODS.map((p) => (
                    <th key={p} style={{ textAlign: "center" }}>{p}</th>
                  ))}
                  <th style={{ textAlign: "center" }}>Média</th>
                  <th style={{ textAlign: "center" }}>Situação</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => {
                  const gradeValues = PERIODS.map((p) => sub.grades[p] ?? null).filter((v) => v !== null) as number[];
                  const avg = calculateAverage(gradeValues);
                  const situation = avg >= 7 ? "Aprovado" : avg >= 5 ? "Recuperação" : avg > 0 ? "Reprovado" : "—";
                  const situationColor = avg >= 7 ? "#2D7D46" : avg >= 5 ? "#C4622D" : avg > 0 ? "#DC2626" : "#94A3B8";
                  const situationBg = avg >= 7 ? "rgba(45,125,70,0.1)" : avg >= 5 ? "rgba(196,98,45,0.1)" : avg > 0 ? "rgba(220,38,38,0.1)" : "rgba(148,163,184,0.1)";

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{sub.subject}</td>
                      {PERIODS.map((period) => (
                        <td key={period} style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <GradeCell value={sub.grades[period] ?? null} />
                          </div>
                        </td>
                      ))}
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          color: situationColor,
                          letterSpacing: "-0.02em",
                        }}>
                          {avg > 0 ? avg.toFixed(1) : "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          background: situationBg,
                          color: situationColor,
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}>
                          {situation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
