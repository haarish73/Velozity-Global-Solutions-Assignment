import { prisma } from "../config/prisma";
import { TaskStatus } from "@prisma/client";
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
    return prisma.project.findMany({ include: { tasks: true } });
  }

  if (user.role === "PM") {
    return prisma.project.findMany({
      where: { createdById: user.id },
      include: { tasks: true },
    });
  }

  return [];
};
export const createTask = async (data: any, user: any) => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      assignedToId: data.assignedToId,
      dueDate: new Date(data.dueDate),
      priority: data.priority,
    },
  });

  console.log("Task created");

  // 🔥 ADD THIS BLOCK
  await prisma.notification.create({
    data: {
      userId: data.assignedToId, // DEV user
      message: `New task assigned: ${task.title}`,
    },
  });

  console.log("Notifications created")

  const notif = await prisma.notification.create({
  data: {
    userId: data.assignedToId,
    message: `New task assigned: ${task.title}`,
  },
});

  return task;
};

export const updateStatus = async (
  taskId: number,
  newStatus: TaskStatus,
  user: any
) => {
  const task = await prisma.task.findUnique({
    where: { id: Number(taskId) },
  });

  if (!task) throw new Error("Task not found");

  // DEV restriction
  if (user.role === "DEV" && task.assignedToId !== user.id) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.task.update({
    where: { id: Number(taskId) },
    data: { status: newStatus },
  });

  await prisma.activityLog.create({
    data: {
      taskId: task.id,
      userId: user.id,
      oldStatus: task.status,
      newStatus: newStatus,
    },
  });

  // ✅ ADD THIS BLOCK
  if (newStatus === "IN_REVIEW") {
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
    });

    if (project) {
      await prisma.notification.create({
        data: {
          userId: project.createdById,
          message: `Task moved to IN_REVIEW`,
        },
      });
    }
  }

  return updated;
};

export const getTasks = async (user: any, query: any) => {
  const filters: any = {};

  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;

  if (user.role === "DEV") {
    filters.assignedToId = user.id;
  }

  if (user.role === "PM") {
    filters.project = {
      createdById: user.id, // ✅ ONLY THEIR PROJECT TASKS
    };
  }

  return prisma.task.findMany({
    where: filters,
    include: {
      project: true,
    },
  });
};