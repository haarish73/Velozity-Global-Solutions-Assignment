import { prisma } from "../config/prisma";

export const getUserNotifications = async (userId: number) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markRead = async (id: number) => {
  return prisma.notification.update({
    where: { id: Number(id) },
    data: { isRead: true },
  });
};

export const markAll = async (userId: number) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};