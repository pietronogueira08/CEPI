import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Meu Boletim | Aluno" }

export default async function StudentBoletimPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const student = await prisma.studentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { grades: { include: { subject: true } } }
  })
  
  if (!student) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Meu Boletim</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>DISCIPLINA</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>NOTA</th>
            </tr>
          </thead>
          <tbody>
            {student.grades.map((grade, i) => (
              <tr key={grade.id} style={{ borderBottom: i < student.grades.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.subject.name}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.value.toFixed(1)}</td>
              </tr>
            ))}
            {student.grades.length === 0 && (
              <tr><td colSpan={2} style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B", textAlign: "center" }}>Nenhuma nota lançada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
