import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Financeiro | Secretaria" }

export default async function FinanceiroPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const invoices = await prisma.invoice.findMany({ include: { student: { include: { user: true } } }, orderBy: { dueDate: "desc" } })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Financeiro</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Gestão de faturas</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Aluno</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Valor</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Vencimento</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{inv.student.user.name}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>R$ {inv.amount.toFixed(2)}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{new Date(inv.dueDate).toLocaleDateString("pt-BR")}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: inv.status === "PAID" ? "#ECFDF5" : inv.status === "PENDING" ? "#FFF7ED" : "#FEF2F2", color: inv.status === "PAID" ? "#2D7D46" : inv.status === "PENDING" ? "#C4622D" : "#DC2626" }}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
