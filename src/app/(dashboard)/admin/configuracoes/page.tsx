import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Shield, Bell, Database, Palette, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configurações — CEPI" };

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  const isAdmin = role === "ADMIN";

  const sections = [
    {
      icon: <Users size={20} color="#1E3A5F" />,
      title: "Perfil da Escola",
      desc: "Nome, endereço, telefone e dados institucionais do CEPI",
      badge: "Centro Educacional Pequena Isa",
      available: isAdmin,
    },
    {
      icon: <Shield size={20} color="#2D7D46" />,
      title: "Segurança e Acesso",
      desc: "Gerenciar senhas, permissões por cargo e autenticação",
      badge: "MFA disponível",
      available: isAdmin,
    },
    {
      icon: <Bell size={20} color="#C4622D" />,
      title: "Notificações",
      desc: "Configurar avisos automáticos de boletos, notas e faltas",
      badge: "Email · Push",
      available: true,
    },
    {
      icon: <Palette size={20} color="#6B46C1" />,
      title: "Aparência",
      desc: "Tema do sistema, cores e preferências visuais",
      badge: "Modo claro",
      available: true,
    },
    {
      icon: <Database size={20} color="#0891B2" />,
      title: "Dados e Backup",
      desc: "Exportar dados, histórico e backups do banco demonstrativo",
      badge: "SQLite · Demo",
      available: isAdmin,
    },
    {
      icon: <Settings size={20} color="#64748B" />,
      title: "Ano Letivo",
      desc: "Configurar datas do calendário escolar, bimestres e feriados",
      badge: "2025 · Ativo",
      available: isAdmin,
    },
  ].filter((s) => s.available);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie as preferências do sistema CEPI</p>
      </div>

      {/* Info banner */}
      <div style={{
        background: "rgba(30,58,95,0.06)",
        border: "1px solid rgba(30,58,95,0.15)",
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <Shield size={18} color="#1E3A5F" />
        <p style={{ fontSize: "0.85rem", color: "#1E3A5F", margin: 0 }}>
          <strong>Modo Demonstrativo:</strong> As configurações abaixo são exibidas para apresentação. Em produção, todas as alterações serão salvas automaticamente.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {sections.map((section, i) => (
          <div key={i} style={{
            background: "white",
            borderRadius: 14,
            padding: "20px 24px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            cursor: "pointer",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
            onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(30,58,95,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "#F8FAFC", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {section.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0F172A" }}>{section.title}</p>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 600,
                    background: "#F1F5F9", color: "#64748B",
                    padding: "2px 8px", borderRadius: 20,
                  }}>{section.badge}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5 }}>{section.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Version info */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
          CEPI Gestão Escolar · Versão 1.0.0 Demo · Grussaí, RJ
        </p>
      </div>
    </div>
  );
}
