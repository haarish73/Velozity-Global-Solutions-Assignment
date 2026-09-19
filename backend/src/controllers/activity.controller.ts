import { Request, Response } from "express";
import * as activityService from "../services/activity.service";

export const getActivityFeed = async (req: any, res: Response) => {
  try {
    const feed = await activityService.getFeed(req.user);
    res.json({ success: true, data: feed });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};