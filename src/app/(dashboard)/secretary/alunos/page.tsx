import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Alunos | Secretaria" }

export default async function AlunosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const students = await prisma.studentProfile.findMany({ include: { user: true, enrollments: { include: { class: true } } } })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Alunos</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Gestão de alunos</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Nome</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Matrícula</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Turma Atual</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <tr key={student.id} style={{ borderBottom: i < students.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>
                  <div style={{ fontWeight: 500 }}>{student.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{student.user.email}</div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>{student.registration}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{student.enrollments[0]?.class.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
