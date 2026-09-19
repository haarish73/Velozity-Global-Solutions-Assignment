import { Request, Response } from "express";
import * as projectService from "../services/project.service";

export const createProject = async (req: any, res: Response) => {
  try {
    const project = await projectService.createProject(
      req.body,
      req.user.id
    );
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await projectService.getProjects(req.user);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};