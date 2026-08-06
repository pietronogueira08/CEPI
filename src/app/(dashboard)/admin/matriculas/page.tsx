import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matrículas | CEPI",
  description: "Lista de matrículas",
};

export default async function MatriculasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      class: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#ECFDF5", color: "#2D7D46" }}>Ativo</span>;
      case "CANCELLED": return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#FEE2E2", color: "#DC2626" }}>Cancelado</span>;
      case "TRANSFERRED": return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#FFF7ED", color: "#C4622D" }}>Transferido</span>;
      default: return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#F1F5F9", color: "#64748B" }}>{status}</span>;
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Matrículas</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: "4px" }}>Acompanhe as matrículas dos alunos nas turmas.</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aluno</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Turma</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Data da Matrícula</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr, i) => (
                <tr key={enr.id} style={{ borderBottom: i < enrollments.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem" }}>
                    <div style={{ fontWeight: 500, color: "#1E293B" }}>{enr.student.user.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{enr.student.user.email}</div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#1E3A5F", fontWeight: 500 }}>{enr.class.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: "0.88rem", color: "#64748B" }}>
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(enr.enrolledAt))}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    {getStatusBadge(enr.status)}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#64748B", fontSize: "0.875rem" }}>
                    Nenhuma matrícula encontrada.
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
