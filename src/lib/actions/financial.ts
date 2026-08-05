"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";

// ==============================
// BOLETOS (INVOICES)
// ==============================

export async function createInvoice(data: {
  studentId: string;
  description: string;
  amount: number;
  dueDate: Date;
  month: number;
  year: number;
  barCode?: string;
  pixCode?: string;
}) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  const invoice = await prisma.invoice.create({ data });
  revalidatePath("/admin");
  revalidatePath("/secretary");
  return { success: true, invoice };
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  receiptUrl?: string
) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
      receiptUrl,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/secretary");
  revalidatePath("/parent");
  revalidatePath("/student");
  return { success: true, invoice };
}

export async function getInvoicesByStudent(studentId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const role = (session.user as any).role;

  // Pais e alunos só veem suas próprias faturas
  if (role === "PARENT" || role === "STUDENT") {
    const userProfile =
      role === "STUDENT"
        ? await prisma.studentProfile.findFirst({ where: { userId: session.user.id } })
        : null;

    if (role === "STUDENT" && userProfile?.id !== studentId) {
      throw new Error("Acesso negado");
    }
  }

  return prisma.invoice.findMany({
    where: { studentId },
    include: { student: { include: { user: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}

export async function getAllInvoices(filters?: {
  status?: InvoiceStatus;
  month?: number;
  year?: number;
}) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  return prisma.invoice.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.month && { month: filters.month }),
      ...(filters?.year && { year: filters.year }),
    },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function generateMonthlyInvoices(data: {
  month: number;
  year: number;
  amount: number;
  dueDay: number;
}) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Apenas administradores podem gerar boletos em lote");
  }

  const activeStudents = await prisma.studentProfile.findMany({
    where: { enrollments: { some: { status: "ACTIVE" } } },
  });

  const dueDate = new Date(data.year, data.month - 1, data.dueDay);
  const description = `Mensalidade ${String(data.month).padStart(2, "0")}/${data.year}`;

  const invoices = await prisma.invoice.createMany({
    data: activeStudents.map((student) => ({
      studentId: student.id,
      description,
      amount: data.amount,
      dueDate,
      month: data.month,
      year: data.year,
      status: "PENDING" as InvoiceStatus,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/admin");
  revalidatePath("/secretary");
  return { success: true, count: invoices.count };
}

// Estatísticas financeiras para dashboard
export async function getFinancialStats(year: number) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  const [paid, pending, overdue, total] = await Promise.all([
    prisma.invoice.aggregate({
      where: { year, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { year, status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { year, status: "OVERDUE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { year },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    paid: { amount: paid._sum.amount || 0, count: paid._count },
    pending: { amount: pending._sum.amount || 0, count: pending._count },
    overdue: { amount: overdue._sum.amount || 0, count: overdue._count },
    total: { amount: total._sum.amount || 0, count: total._count },
  };
}
