import os

base_dir = r"c:\Users\hufos\Desktop\CEPI\src\app\(dashboard)"

files = {
    # SECRETARY
    r"secretary\page.tsx": """import { auth } from "@/lib/auth"
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
""",

    r"secretary\alunos\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Alunos | Secretaria" }

export default async function AlunosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const students = await prisma.studentProfile.findMany({ include: { user: true, enrollments: { include: { class: true } } } })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Alunos</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Gestão de alunos</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Nome</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Matrícula</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Turma Atual</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <tr key={student.id} style={{ borderBottom: i < students.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>
                  <div style={{ fontWeight: 500 }}>{student.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{student.user.email}</div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>{student.registration}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{student.enrollments[0]?.class.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",

    r"secretary\matriculas\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Matrículas | Secretaria" }

export default async function MatriculasPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const enrollments = await prisma.enrollment.findMany({ include: { student: { include: { user: true } }, class: true } })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Matrículas</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Gestão de matrículas</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Aluno</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Turma</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enr, i) => (
              <tr key={enr.id} style={{ borderBottom: i < enrollments.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{enr.student.user.name}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{enr.class.name}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: enr.status === "ACTIVE" ? "#ECFDF5" : "#FFF7ED", color: enr.status === "ACTIVE" ? "#2D7D46" : "#C4622D" }}>{enr.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",

    r"secretary\financeiro\page.tsx": """import { auth } from "@/lib/auth"
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
""",

    r"secretary\notificacoes\page.tsx": """import { auth } from "@/lib/auth"
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
""",

    # TEACHER
    r"teacher\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"
import { BookOpen, Users, Calendar } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard Professor | CEPI" }

export default async function TeacherDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const teacher = await prisma.teacherProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { classes: { include: { class: { include: { enrollments: { include: { student: { include: { user: true } } } } } } } } }
  })
  
  if (!teacher) return <div>Perfil não encontrado</div>

  const totalClasses = teacher.classes.length
  const totalStudents = teacher.classes.reduce((acc, tc) => acc + tc.class.enrollments.length, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Bem-vindo(a), Professor(a)</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2D528715", display: "flex", alignItems: "center", justifyContent: "center", color: "#2D5287" }}><BookOpen size={24} /></div>
          <div><p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500 }}>Minhas Turmas</p><h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{totalClasses}</h3></div>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2D7D4615", display: "flex", alignItems: "center", justifyContent: "center", color: "#2D7D46" }}><Users size={24} /></div>
          <div><p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500 }}>Total de Alunos</p><h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{totalStudents}</h3></div>
        </div>
      </div>
    </div>
  )
}
""",

    r"teacher\turmas\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Minhas Turmas | Professor" }

export default async function TeacherTurmasPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const teacher = await prisma.teacherProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { classes: { include: { class: { include: { enrollments: { include: { student: { include: { user: true } } } } } } } } }
  })
  
  if (!teacher) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Minhas Turmas</h1>
      </div>
      {teacher.classes.map((tc, idx) => (
        <div key={idx} style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#1E3A5F", marginBottom: "16px" }}>{tc.class.name}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>ALUNO</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {tc.class.enrollments.map((enr, i) => (
                <tr key={enr.id} style={{ borderBottom: i < tc.class.enrollments.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{enr.student.user.name}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: enr.status === "ACTIVE" ? "#ECFDF5" : "#FFF7ED", color: enr.status === "ACTIVE" ? "#2D7D46" : "#C4622D" }}>{enr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
""",

    r"teacher\diario\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Diário de Classe | Professor" }

export default async function TeacherDiarioPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const teacher = await prisma.teacherProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { classes: { include: { class: { include: { enrollments: true } } } } }
  })
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Diário de Classe</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}>
        <p style={{ color: "#64748B" }}>Selecione uma turma para realizar os registros diários (Conteúdo em construção).</p>
      </div>
    </div>
  )
}
""",

    r"teacher\notas\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Lançamento de Notas | Professor" }

export default async function TeacherNotasPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Lançamento de Notas</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}>
        <p style={{ color: "#64748B" }}>Módulo de lançamento de notas em construção.</p>
      </div>
    </div>
  )
}
""",

    r"teacher\frequencia\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Frequência | Professor" }

export default async function TeacherFrequenciaPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Registro de Frequência</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}>
        <p style={{ color: "#64748B" }}>Módulo de registro de frequência em construção.</p>
      </div>
    </div>
  )
}
""",

    # PARENT
    r"parent\page.tsx": """import { auth } from "@/lib/auth"
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
""",

    r"parent\boletim\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Boletim | Responsável" }

export default async function ParentBoletimPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const parent = await prisma.parentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { students: { include: { student: { include: { user: true, grades: { include: { subject: true } } } } } } }
  })
  
  if (!parent) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Boletim Escolar</h1>
      </div>
      {parent.students.map((ps, idx) => (
        <div key={idx} style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0" }}>
          <h2 style={{ fontSize: "1.12rem", fontWeight: 600, color: "#1E3A5F", marginBottom: "16px" }}>{ps.student.user.name}</h2>
          {ps.student.grades.length === 0 ? <p style={{ color: "#64748B", fontSize: "0.88rem" }}>Sem notas lançadas ainda.</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>DISCIPLINA</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>NOTA</th>
                </tr>
              </thead>
              <tbody>
                {ps.student.grades.map((grade, i) => (
                  <tr key={grade.id} style={{ borderBottom: i < ps.student.grades.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                    <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.subject.name}</td>
                    <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.value.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}
""",

    r"parent\frequencia\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ParentFrequenciaPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header"><h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Frequência</h1></div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}><p style={{ color: "#64748B" }}>Módulo em construção.</p></div>
    </div>
  )
}
""",

    r"parent\financeiro\page.tsx": """import { auth } from "@/lib/auth"
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
""",

    r"parent\notificacoes\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
export default async function ParentNotificacoesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header"><h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Notificações</h1></div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}><p style={{ color: "#64748B" }}>Sem notificações.</p></div>
    </div>
  )
}
""",

    # STUDENT
    r"student\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard Aluno | CEPI" }

export default async function StudentDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const student = await prisma.studentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { user: true, enrollments: { include: { class: true } } }
  })
  
  if (!student) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Olá, {student.user.name}</h1>
        <p className="page-subtitle" style={{ color: "#64748B" }}>Turma Atual: {student.enrollments[0]?.class.name || "Nenhuma turma"}</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <p style={{ color: "#64748B" }}>Seu dashboard com resumos de médias e faltas será exibido aqui.</p>
      </div>
    </div>
  )
}
""",

    r"student\boletim\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Meu Boletim | Aluno" }

export default async function StudentBoletimPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const student = await prisma.studentProfile.findFirst({ 
    where: { userId: session.user.id },
    include: { grades: { include: { subject: true } } }
  })
  
  if (!student) return <div>Perfil não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Meu Boletim</h1>
      </div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>DISCIPLINA</th>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>NOTA</th>
            </tr>
          </thead>
          <tbody>
            {student.grades.map((grade, i) => (
              <tr key={grade.id} style={{ borderBottom: i < student.grades.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.subject.name}</td>
                <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E293B" }}>{grade.value.toFixed(1)}</td>
              </tr>
            ))}
            {student.grades.length === 0 && (
              <tr><td colSpan={2} style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B", textAlign: "center" }}>Nenhuma nota lançada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",

    r"student\frequencia\page.tsx": """import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function StudentFrequenciaPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="page-header"><h1 className="page-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>Minha Frequência</h1></div>
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "24px" }}><p style={{ color: "#64748B" }}>Módulo em construção.</p></div>
    </div>
  )
}
""",

    r"student\financeiro\page.tsx": """import { auth } from "@/lib/auth"
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
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created {rel_path}')
