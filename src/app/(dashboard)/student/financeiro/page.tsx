import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Meu Financeiro | Aluno" }

export default async function StudentFinanceiroPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const student = await prisma.studentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { invoices: { orderBy: { dueDate: "desc" } } }
  })
  
  if (!student) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Meu Financeiro</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>VALOR</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>VENCIMENTO</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {student.invoices.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: i < student.invoices.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>R$ {inv.amount.toFixed(2)}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{new Date(inv.dueDate).toLocaleDateString("pt-BR")}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: inv.status === "PAID" ? "#ECFDF5" : inv.status === "PENDING" ? "#FFF7ED" : "#FEF2F2", color: inv.status === "PAID" ? "#2D7D46" : inv.status === "PENDING" ? "#C4622D" : "#DC2626" }}>{inv.status}</span>
                </td>
              </tr>
            ))}
            {student.invoices.length === 0 && (
              <tr><td colSpan={3} style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B", textAlign: "center" }}>Nenhuma fatura encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
