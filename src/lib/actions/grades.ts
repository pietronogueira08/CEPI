"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

// ==============================
// NOTAS
// ==============================

export async function createOrUpdateGrade(data: {
  studentId: string;
  subjectId: string;
  period: string;
  value: number;
  type?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId: session.user.id },
  });

  if (!teacherProfile && (session.user as any).role === "TEACHER") {
    throw new Error("Perfil de professor não encontrado");
  }

  const teacherId = teacherProfile?.id || "admin";

  const existing = await prisma.grade.findFirst({
    where: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      period: data.period,
      type: data.type || "BIMESTRAL",
    },
  });

  let grade;
  if (existing) {
    grade = await prisma.grade.update({
      where: { id: existing.id },
      data: { value: data.value, notes: data.notes },
    });
  } else {
    grade = await prisma.grade.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        teacherId,
        period: data.period,
        value: data.value,
        type: data.type || "BIMESTRAL",
        notes: data.notes,
      },
    });
  }

  revalidatePath("/teacher");
  revalidatePath("/student");
  revalidatePath("/parent");
  return { success: true, grade };
}

export async function getGradesByStudent(studentId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  return prisma.grade.findMany({
    where: { studentId },
    include: {
      subject: true,
      teacher: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ period: "asc" }, { subject: { name: "asc" } }],
  });
}

export async function getGradesByClass(classId: string) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY", "TEACHER"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  return prisma.grade.findMany({
    where: { subject: { classId } },
    include: {
      student: { include: { user: { select: { name: true } } } },
      subject: true,
    },
    orderBy: [{ student: { user: { name: "asc" } } }, { period: "asc" }],
  });
}

// ==============================
// FREQUÊNCIA / PRESENÇA
// ==============================

export async function registerAttendance(data: {
  studentId: string;
  subjectId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId: session.user.id },
  });

  const teacherId = teacherProfile?.id || "admin";

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_subjectId_date: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        date: data.date,
      },
    },
    update: { status: data.status, notes: data.notes },
    create: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      teacherId,
      date: data.date,
      status: data.status,
      notes: data.notes,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/student");
  revalidatePath("/parent");
  return { success: true, attendance };
}

export async function getAttendanceByStudent(
  studentId: string,
  subjectId?: string
) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  return prisma.attendance.findMany({
    where: {
      studentId,
      ...(subjectId && { subjectId }),
    },
    include: { subject: true },
    orderBy: { date: "desc" },
  });
}
