import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"
import { BookOpen, Users, Calendar } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard Professor | CEPI" }

export default async function TeacherDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const teacher = await prisma.teacherProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { classes: { include: { class: { include: { enrollments: { include: { student: { include: { user: true } } } } } } } } }
  })
  
  if (!teacher) return <div>Perfil não encontrado</div>

  const totalClasses = teacher.classes.length
  const totalStudents = teacher.classes.reduce((acc, tc) => acc + tc.class.enrollments.length, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Bem-vindo(a), Professor(a)</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2D528715", display: "flex", alignItems: "center", justifyContent: "center", color: "#2D5287" }}><BookOpen size={24} /></div>
          <div><p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500 }}>Minhas Turmas</p><h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{totalClasses}</h3></div>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2D7D4615", display: "flex", alignItems: "center", justifyContent: "center", color: "#2D7D46" }}><Users size={24} /></div>
          <div><p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500 }}>Total de Alunos</p><h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{totalStudents}</h3></div>
        </div>
      </div>
    </div>
  )
}
