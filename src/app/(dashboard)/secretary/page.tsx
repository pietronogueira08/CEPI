import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"
import { Users, BookOpen, FileText, AlertCircle } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard Secretaria | CEPI", description: "Painel da Secretaria" }

export default async function SecretaryDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const [totalStudents, totalEnrollments, pendingInvoices, overdueInvoices, recentEnrollments] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.enrollment.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { student: { include: { user: true } }, class: true } })
  ])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Dashboard da Secretaria</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Resumo geral acadêmico e financeiro</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        {[ 
          { title: "Total de Alunos", value: totalStudents, icon: Users, color: "#2D5287" },
          { title: "Matrículas Ativas", value: totalEnrollments, icon: BookOpen, color: "#2D7D46" },
          { title: "Faturas Pendentes", value: pendingInvoices, icon: FileText, color: "#C4622D" },
          { title: "Faturas Atrasadas", value: overdueInvoices, icon: AlertCircle, color: "#DC2626" }
        ].map((stat, i) => (
          <div key={i} style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500 }}>{stat.title}</p>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#1E3A5F", marginBottom: "16px" }}>Matrículas Recentes</h2>
        <div style={{ borderRadius: 10, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Aluno</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Turma</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEnrollments.map((enr, i) => (
                <tr key={enr.id} style={{ borderBottom: i < recentEnrollments.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{enr.student.user.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{enr.class.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: enr.status === "ACTIVE" ? "#ECFDF5" : "#FFF7ED", color: enr.status === "ACTIVE" ? "#2D7D46" : "#C4622D" }}>
                      {enr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
