"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GraduationCap, LayoutDashboard, Users, BookOpen, CreditCard,
  FileText, Bell, Settings, LogOut, Menu, X, ChevronRight,
  ClipboardList, BarChart3, UserCheck
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SidebarProps {
  role: string;
  userName: string;
  userInitials: string;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/turmas", label: "Turmas", icon: BookOpen },
    { href: "/admin/matriculas", label: "Matrículas", icon: ClipboardList },
    { href: "/admin/financeiro", label: "Financeiro", icon: CreditCard },
    { href: "/admin/notas", label: "Notas", icon: FileText },
    { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/admin/notificacoes", label: "Notificações", icon: Bell },
  ],
  SECRETARY: [
    { href: "/secretary", label: "Dashboard", icon: LayoutDashboard },
    { href: "/secretary/alunos", label: "Alunos", icon: Users },
    { href: "/secretary/matriculas", label: "Matrículas", icon: ClipboardList },
    { href: "/secretary/financeiro", label: "Financeiro", icon: CreditCard },
    { href: "/secretary/notificacoes", label: "Notificações", icon: Bell },
  ],
  TEACHER: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/turmas", label: "Minhas Turmas", icon: BookOpen },
    { href: "/teacher/diario", label: "Diário de Classe", icon: ClipboardList },
    { href: "/teacher/notas", label: "Lançar Notas", icon: FileText },
    { href: "/teacher/frequencia", label: "Frequência", icon: UserCheck },
  ],
  PARENT: [
    { href: "/parent", label: "Início", icon: LayoutDashboard },
    { href: "/parent/boletim", label: "Boletim", icon: FileText },
    { href: "/parent/frequencia", label: "Frequência", icon: UserCheck },
    { href: "/parent/financeiro", label: "Financeiro", icon: CreditCard },
    { href: "/parent/notificacoes", label: "Avisos", icon: Bell },
  ],
  STUDENT: [
    { href: "/student", label: "Início", icon: LayoutDashboard },
    { href: "/student/boletim", label: "Boletim", icon: FileText },
    { href: "/student/frequencia", label: "Frequência", icon: UserCheck },
    { href: "/student/financeiro", label: "Financeiro", icon: CreditCard },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Diretor",
  SECRETARY: "Secretaria",
  TEACHER: "Professor(a)",
  PARENT: "Responsável",
  STUDENT: "Aluno(a)",
};

export function Sidebar({ role, userName, userInitials }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_ITEMS[role] || [];

  const SidebarContent = () => (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden"
          }}>
            <Image src="/logo.png" alt="CEPI Logo" width={40} height={40} style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div className="cepi-logo-text">CEPI</div>
            <div className="cepi-logo-sub">Pequena Isa</div>
          </div>
        </div>
      </div>

      {/* Perfil do usuário */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: "0.85rem" }}>
            {userInitials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{
              color: "white",
              fontSize: "0.85rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {userName}
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>
              {ROLE_LABELS[role]}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-nav-item", isActive && "active")}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "12px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}>
        <Link
          href="/configuracoes"
          className="sidebar-nav-item"
          style={{ marginBottom: 2 }}
        >
          <Settings size={18} />
          Configurações
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-nav-item"
          style={{
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,100,100,0.8)",
          }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "#1E3A5F",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="CEPI Logo" width={32} height={32} style={{ background: "white", borderRadius: 8, padding: 2 }} />
          <span className="cepi-logo-text" style={{ fontSize: "1.1rem" }}>CEPI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 4 }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 45,
            }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden" style={{ zIndex: 50 }}>
            <SidebarContent />
            <style>{`.sidebar { transform: translateX(0) !important; }`}</style>
          </div>
        </>
      )}
    </>
  );
}
