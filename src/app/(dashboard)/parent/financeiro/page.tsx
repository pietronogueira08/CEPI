import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"

export default async function ParentFinanceiroPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header"><h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Financeiro</h1></div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}><p style={{ color: "#64748B" }}>Módulo de faturas do responsável em construção.</p></div>
    </div>
  )
}
