"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { NotificationType, NotificationChannel } from "@prisma/client";

// ==============================
// INTERFACE MODULAR (Preparada para IA/Chatbot)
// ==============================

export interface INotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipientIds: string[];
  metadata?: Record<string, unknown>; // Dados extras para integração futura com IA
}

// Provider abstrato — permite injeção de qualquer implementação futura
export interface INotificationProvider {
  send(payload: INotificationPayload): Promise<{ success: boolean; count: number }>;
}

// Implementação padrão (in-app)
class InAppNotificationProvider implements INotificationProvider {
  async send(payload: INotificationPayload) {
    const session = await auth();
    
    const notification = await prisma.notification.create({
      data: {
        title: payload.title,
        message: payload.message,
        type: payload.type,
        channel: "IN_APP",
        senderId: session?.user?.id,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        recipients: {
          create: payload.recipientIds.map((userId) => ({ userId })),
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/parent");
    revalidatePath("/student");
    return { success: true, count: payload.recipientIds.length };
  }
}

// Singleton do serviço — fácil troca de provider sem alterar código de chamada
let notificationProvider: INotificationProvider = new InAppNotificationProvider();

export function setNotificationProvider(provider: INotificationProvider) {
  notificationProvider = provider;
}

// ==============================
// SERVER ACTIONS DE NOTIFICAÇÕES
// ==============================

export async function sendNotification(payload: INotificationPayload) {
  const session = await auth();
  if (!session || !["ADMIN", "SECRETARY", "TEACHER"].includes((session.user as any).role)) {
    throw new Error("Não autorizado");
  }
  return notificationProvider.send(payload);
}

export async function sendClassNotification(classId: string, data: {
  title: string;
  message: string;
  type?: NotificationType;
}) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  // Busca todos os responsáveis dos alunos matriculados na turma
  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
    include: {
      student: {
        include: {
          parents: {
            include: { parent: { include: { user: true } } },
          },
          user: true,
        },
      },
    },
  });

  const recipientIds = [
    ...new Set(
      enrollments.flatMap((e) => [
        e.student.user.id,
        ...e.student.parents.map((p) => p.parent.user.id),
      ])
    ),
  ];

  return sendNotification({
    title: data.title,
    message: data.message,
    type: data.type || "INFO",
    channel: "IN_APP",
    recipientIds,
  });
}

export async function getUserNotifications(userId?: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const targetUserId = userId || session.user.id;

  return prisma.userNotification.findMany({
    where: { userId: targetUserId },
    include: { notification: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  await prisma.userNotification.updateMany({
    where: { userId: session.user.id, notificationId },
    data: { readAt: new Date() },
  });

  revalidatePath("/");
  return { success: true };
}
