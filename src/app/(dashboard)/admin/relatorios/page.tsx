import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { Users, BookOpen, GraduationCap, DollarSign, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Relatórios | CEPI",
  description: "Relatórios gerenciais",
};

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch all required counts
  const totalStudents = await prisma.studentProfile.count();
  const totalTeachers = await prisma.teacherProfile.count();
  const totalClasses = await prisma.class.count();
  const totalSubjects = await prisma.subject.count();

  // Invoice calculations
  const invoices = await prisma.invoice.findMany();
  let totalRevenue = 0;
  let paidCount = 0;
  
  invoices.forEach(inv => {
    if (inv.status === "PAID") {
      totalRevenue += inv.amount;
      paidCount++;
    }
  });
  
  const collectionRate = invoices.length > 0 ? (paidCount / invoices.length) * 100 : 0;
  const now = new Date();
  const timestamp = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const Card = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <div style={{ background: "white", borderRadius: 14, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "20px" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: color }}>
        <Icon size={28} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#64748B", fontWeight: 500 }}>{title}</h3>
        <p style={{ margin: "4px 0 0 0", fontSize: "1.75rem", fontWeight: 700, color: "#1E293B" }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Relatórios Gerenciais</h1>
        <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "4px" }}>Resumo consolidado dos dados do sistema.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <Card title="Total de Alunos" value={totalStudents} icon={GraduationCap} color="#2D5287" />
        <Card title="Total de Professores" value={totalTeachers} icon={Users} color="#1E3A5F" />
        <Card title="Total de Turmas" value={totalClasses} icon={BookOpen} color="#2D7D46" />
        <Card title="Disciplinas Ativas" value={totalSubjects} icon={FileText} color="#C4622D" />
        
        <Card title="Receita (Paga)" value={`R$ ${totalRevenue.toFixed(2).replace('.', ',')}`} icon={DollarSign} color="#2D7D46" />
        <Card title="Faturas Pagas" value={paidCount} icon={FileText} color="#2D5287" />
        <Card title="Taxa de Recebimento" value={`${collectionRate.toFixed(1)}%`} icon={DollarSign} color="#1E3A5F" />
      </div>

      <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "0.75rem", borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
        Relatório exportado automaticamente às {timestamp}
      </div>
    </div>
  );
}
