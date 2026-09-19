import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } =
      await authService.login(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({ success: true, accessToken, user });
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    const accessToken = await authService.refresh(token);
    res.json({ success: true, accessToken });
  } catch (err: any) {
    res.status(403).json({ success: false, message: err.message });
  }
};