import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Notificações | CEPI",
  description: "Central de notificações",
};

export default async function NotificacoesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "INFO": return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#EFF6FF", color: "#2563EB" }}>Info</span>;
      case "WARNING": return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#FFF7ED", color: "#C4622D" }}>Aviso</span>;
      case "URGENT": return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#FEF2F2", color: "#DC2626" }}>Urgente</span>;
      default: return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#F1F5F9", color: "#64748B" }}>{type}</span>;
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E3A5F" }}>
          <Bell size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Notificações</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "4px" }}>Acompanhe os avisos e alertas do sistema.</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <Bell size={40} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "1.125rem", color: "#1E293B", margin: "0 0 8px 0" }}>Nenhuma notificação</h3>
            <p style={{ fontSize: "0.875rem", color: "#64748B", margin: 0 }}>Você está em dia com todos os avisos do sistema.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notifications.map((notif, i) => (
              <div 
                key={notif.id} 
                style={{ 
                  padding: "20px 24px", 
                  borderBottom: i < notifications.length - 1 ? "1px solid #F1F5F9" : "none",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start"
                }}
              >
                <div style={{ marginTop: "4px" }}>
                  {getTypeBadge(notif.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: 600, color: "#1E293B" }}>
                    {notif.title}
                  </h4>
                  <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                    {notif.message || notif.body || "Sem conteúdo"}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(notif.createdAt))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
