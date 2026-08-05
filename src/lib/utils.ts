import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getGradeColor(grade: number): string {
  if (grade >= 7) return "text-cepi-success";
  if (grade >= 5) return "text-cepi-warning";
  return "text-red-500";
}

export function getGradeBg(grade: number): string {
  if (grade >= 7) return "bg-cepi-success/10 border-cepi-success/30";
  if (grade >= 5) return "bg-cepi-warning/10 border-cepi-warning/30";
  return "bg-red-500/10 border-red-500/30";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    OVERDUE: "Vencido",
    CANCELLED: "Cancelado",
    ACTIVE: "Ativo",
    PRESENT: "Presente",
    ABSENT: "Ausente",
    LATE: "Atrasado",
    JUSTIFIED: "Justificado",
  };
  return labels[status] || status;
}

export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-cepi-warning/15 text-cepi-warning border-cepi-warning/30",
    PAID: "bg-cepi-success/15 text-cepi-success border-cepi-success/30",
    OVERDUE: "bg-red-500/15 text-red-500 border-red-500/30",
    CANCELLED: "bg-gray-400/15 text-gray-500 border-gray-400/30",
  };
  return colors[status] || "bg-gray-100 text-gray-600 border-gray-200";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Diretor",
    SECRETARY: "Secretário(a)",
    TEACHER: "Professor(a)",
    PARENT: "Responsável",
    STUDENT: "Aluno(a)",
  };
  return labels[role] || role;
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: "bg-cepi-primary text-white",
    SECRETARY: "bg-cepi-secondary text-cepi-primary",
    TEACHER: "bg-blue-100 text-blue-700",
    PARENT: "bg-purple-100 text-purple-700",
    STUDENT: "bg-green-100 text-green-700",
  };
  return colors[role] || "bg-gray-100 text-gray-600";
}

export function calculateAverage(grades: number[]): number {
  if (!grades.length) return 0;
  return grades.reduce((a, b) => a + b, 0) / grades.length;
}

export function getMonthName(month: number): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return months[month - 1] || "";
}
