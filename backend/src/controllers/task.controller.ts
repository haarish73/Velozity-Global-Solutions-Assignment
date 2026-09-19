import { Request, Response } from "express";
import * as taskService from "../services/task.service";

export const createTask = async (req: any, res: Response) => {
  try {
    const task = await taskService.createTask(req.body, req.user);
    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const result = await taskService.updateStatus(
      taskId,
      status,
      req.user
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await taskService.getTasks(req.user, req.query);
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};