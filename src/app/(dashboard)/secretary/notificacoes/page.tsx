import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Notificações | Secretaria" }

export default async function NotificacoesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Notificações</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "20px" }}>
        {notifications.length === 0 ? <p style={{ color: "#64748B" }}>Nenhuma notificação encontrada.</p> : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map(n => (
              <li key={n.id} style={{ padding: "16px", border: "1px solid #E2E8F0", borderRadius: 10 }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#1E293B" }}>{n.title}</h4>
                <p style={{ margin: 0, color: "#64748B", fontSize: "0.88rem" }}>{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
