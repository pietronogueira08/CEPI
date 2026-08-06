import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard Aluno | CEPI" }

export default async function StudentDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const student = await prisma.studentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { user: true, enrollments: { include: { class: true } } }
  })
  
  if (!student) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Olá, {student.user.name}</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Turma Atual: {student.enrollments[0]?.class.name || "Nenhuma turma"}</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <p style={{ color: "#64748B" }}>Seu dashboard com resumos de médias e faltas será exibido aqui.</p>
      </div>
    </div>
  )
}
