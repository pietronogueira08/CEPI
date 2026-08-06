import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"
import { Users, FileText } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard Responsável | CEPI" }

export default async function ParentDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const parent = await prisma.parentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { students: { include: { student: { include: { user: true, enrollments: { include: { class: true } } } } } } }
  })
  
  if (!parent) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Dashboard do Responsável</h1>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2D528715", display: "flex", alignItems: "center", justifyContent: "center", color: "#2D5287" }}><Users size={24} /></div>
          <div><p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500 }}>Filhos Vinculados</p><h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{parent.students.length}</h3></div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#1E3A5F", marginBottom: "16px" }}>Meus Filhos</h2>
        <div style={{ borderRadius: 10, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>NOME</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>TURMA ATUAL</th>
              </tr>
            </thead>
            <tbody>
              {parent.students.map((ps, i) => (
                <tr key={ps.id} style={{ borderBottom: i < parent.students.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{ps.student.user.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{ps.student.enrollments[0]?.class.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
