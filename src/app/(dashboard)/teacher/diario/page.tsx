import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { GradeInput } from "@/components/grades/GradeInput";
import { ClipboardList, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Diário de Classe" };

const PERIODS = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];

export default async function TeacherDiaryPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "TEACHER") redirect("/login");

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId: session.user.id },
    include: {
      classes: {
        include: {
          class: {
            include: {
              subjects: true,
              enrollments: {
                where: { status: "ACTIVE" },
                include: {
                  student: {
                    include: {
                      user: { select: { name: true } },
                      grades: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacherProfile) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <ClipboardList size={48} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#64748B" }}>Perfil de professor não encontrado.</p>
      </div>
    );
  }

  const classes = teacherProfile.classes.map((ct) => ct.class);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Diário de Classe</h1>
        <p className="page-subtitle">Lance notas e acompanhe o desempenho dos alunos</p>
      </div>

      {classes.length === 0 ? (
        <div style={{
          background: "white",
          borderRadius: 14,
          padding: 48,
          textAlign: "center",
          border: "1px solid #E2E8F0",
        }}>
          <Users size={48} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B" }}>Nenhuma turma atribuída a você ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {classes.map((cls) => (
            <div key={cls.id} style={{
              background: "white",
              borderRadius: 14,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}>
              {/* Class header */}
              <div style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #1E3A5F, #2D5287)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(244,196,48,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <ClipboardList size={20} color="#F4C430" />
                </div>
                <div>
                  <h2 style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{cls.name}</h2>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
                    {cls.grade} · {cls.shift} · {cls.enrollments.length} alunos
                  </p>
                </div>
              </div>

              {/* Per subject */}
              {cls.subjects.map((subject) => (
                <div key={subject.id} style={{ padding: "20px" }}>
                  <h3 style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#1E3A5F",
                    marginBottom: 16,
                    paddingBottom: 10,
                    borderBottom: "1px solid #F1F5F9",
                  }}>
                    {subject.name}
                  </h3>

                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table" style={{ minWidth: 560 }}>
                      <thead>
                        <tr>
                          <th style={{ width: "40%" }}>Aluno</th>
                          {PERIODS.map((p) => (
                            <th key={p} style={{ textAlign: "center", width: "15%" }}>
                              {p.split(" ")[0]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cls.enrollments.map((enrollment) => {
                          const student = enrollment.student;
                          return (
                            <tr key={enrollment.id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "#1E3A5F",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}>
                                    {student.user.name.charAt(0)}
                                  </div>
                                  <span style={{ fontWeight: 500, fontSize: "0.88rem" }}>
                                    {student.user.name}
                                  </span>
                                </div>
                              </td>
                              {PERIODS.map((period) => {
                                const existing = student.grades.find(
                                  (g) => g.subjectId === subject.id && g.period === period
                                );
                                return (
                                  <td key={period} style={{ textAlign: "center" }}>
                                    <GradeInput
                                      studentId={student.id}
                                      subjectId={subject.id}
                                      period={period}
                                      initialValue={existing?.value ?? null}
                                      studentName={student.user.name}
                                      subjectName={subject.name}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
