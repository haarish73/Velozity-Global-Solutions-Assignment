import { prisma } from "../config/prisma";

export const getFeed = async (user: any) => {
  if (user.role === "ADMIN") {
    return prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: true, task: true },
    });
  }

  if (user.role === "PM") {
    const projects = await prisma.project.findMany({
      where: { createdById: user.id },
      select: { id: true },
    });

    return prisma.activityLog.findMany({
      where: {
        task: {
          projectId: { in: projects.map((p) => p.id) },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "DEV") {
    return prisma.activityLog.findMany({
      where: {
        task: {
          assignedToId: user.id,
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });
  }
};