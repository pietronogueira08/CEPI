import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Boletim | Responsável" }

export default async function ParentBoletimPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const parent = await prisma.parentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { students: { include: { student: { include: { user: true, grades: { include: { subject: true } } } } } } }
  })
  
  if (!parent) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Boletim Escolar</h1>
      </div>
      {parent.students.map((ps, idx) => (
        <div key={idx} style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0" }}>
          <h2 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#1E3A5F", marginBottom: "16px" }}>{ps.student.user.name}</h2>
          {ps.student.grades.length === 0 ? <p style={{ color: "#64748B", fontSize: "0.88rem" }}>Sem notas lançadas ainda.</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>DISCIPLINA</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>NOTA</th>
                </tr>
              </thead>
              <tbody>
                {ps.student.grades.map((grade, i) => (
                  <tr key={grade.id} style={{ borderBottom: i < ps.student.grades.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.subject.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.value.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}
