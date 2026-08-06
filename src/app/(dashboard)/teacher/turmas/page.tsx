import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Minhas Turmas | Professor" }

export default async function TeacherTurmasPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const teacher = await prisma.teacherProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { classes: { include: { class: { include: { enrollments: { include: { student: { include: { user: true } } } } } } } } }
  })
  
  if (!teacher) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Minhas Turmas</h1>
      </div>
      {teacher.classes.map((tc, idx) => (
        <div key={idx} style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#1E3A5F", marginBottom: "16px" }}>{tc.class.name}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>ALUNO</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {tc.class.enrollments.map((enr, i) => (
                <tr key={enr.id} style={{ borderBottom: i < tc.class.enrollments.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{enr.student.user.name}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: enr.status === "ACTIVE" ? "#ECFDF5" : "#FFF7ED", color: enr.status === "ACTIVE" ? "#2D7D46" : "#C4622D" }}>{enr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
