import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { Search, UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Usuários | CEPI",
  description: "Gerenciamento de usuários do sistema",
};

export default async function UsuariosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return { bg: "#1E3A5F", text: "white" };
      case "TEACHER": return { bg: "#2D5287", text: "white" };
      case "SECRETARY": return { bg: "#C4622D", text: "white" };
      case "STUDENT": return { bg: "#2D7D46", text: "white" };
      case "PARENT": return { bg: "#6B7280", text: "white" };
      default: return { bg: "#E2E8F0", text: "#1E293B" };
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Usuários</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "4px" }}>Gerencie os acessos ao sistema escolar.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "#1E3A5F", color: "white", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "12px" }}>
          <Search size={18} color="#94A3B8" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            style={{ border: "none", outline: "none", width: "100%", fontSize: "0.875rem", color: "#1E293B" }}
            disabled
          />
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nome</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Função</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const roleColors = getRoleColor(user.role);
                return (
                  <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B", fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>{user.email}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: roleColors.bg, color: roleColors.text }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {user.active ? (
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#ECFDF5", color: "#2D7D46" }}>Ativo</span>
                      ) : (
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#FEE2E2", color: "#DC2626" }}>Inativo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#64748B", fontSize: "0.875rem" }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
