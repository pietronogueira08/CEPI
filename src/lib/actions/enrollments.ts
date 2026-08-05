"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";

// ==============================
// MATRÍCULAS
// ==============================

export async function createEnrollment(data: {
  studentId: string;
  classId: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId: data.studentId, classId: data.classId } },
  });

  if (existing) throw new Error("Aluno já matriculado nesta turma");

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: data.studentId,
      classId: data.classId,
      notes: data.notes,
    },
    include: {
      student: { include: { user: true } },
      class: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/secretary");
  return { success: true, enrollment };
}

export async function cancelEnrollment(enrollmentId: string) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/secretary");
  return { success: true };
}

export async function getEnrollments(classId?: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  return prisma.enrollment.findMany({
    where: classId ? { classId, status: "ACTIVE" } : { status: "ACTIVE" },
    include: {
      student: { include: { user: true } },
      class: { include: { academicYear: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

// ==============================
// USUÁRIOS
// ==============================

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  cpf?: string;
}) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Apenas administradores podem criar usuários");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) throw new Error("Email já cadastrado");

  const passwordHash = await hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      phone: data.phone,
      cpf: data.cpf,
    },
  });

  revalidatePath("/admin");
  return { success: true, userId: user.id };
}

export async function getUsersByRole(role: Role) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  return prisma.user.findMany({
    where: { role, active: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      studentProfile: true,
      teacherProfile: true,
    },
    orderBy: { name: "asc" },
  });
}
