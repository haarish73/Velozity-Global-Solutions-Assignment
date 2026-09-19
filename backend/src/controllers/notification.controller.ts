import { Request, Response } from "express";
import * as notificationService from "../services/notification.service";

export const getNotifications = async (req: any, res: Response) => {
  try {
    console.log("Logged in user ID:", req.user.id);
    const data = await notificationService.getUserNotifications(req.user.id);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await notificationService.markRead(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const markAllRead = async (req: any, res: Response) => {
  try {
    await notificationService.markAll(req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};