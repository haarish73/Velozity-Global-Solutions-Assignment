import { prisma } from "../config/prisma";

export const createProject = async (data: any, userId: number) => {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      createdById: userId,
    },
  });
};

export const getProjects = async (user: any) => {
  if (user.role === "ADMIN") {
    return prisma.project.findMany({
      include: { tasks: true },
    });
  }

  if (user.role === "PM") {
    return prisma.project.findMany({
      where: { createdById: user.id }, // ✅ ONLY OWN PROJECTS
      include: { tasks: true },
    });
  }

  return [];
};