import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessToken = (user: any) => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user: any) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

export const register = async (data: any) => {
  const { name, email, password, role } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { name, email, password: hashed, role },
  });
};

export const login = async ({ email, password }: any) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const payload = { id: user.id, role: user.role };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user,
  };
};

export const refresh = async (token: string) => {
  const decoded: any = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!
  );

  return generateAccessToken({ id: decoded.id, role: decoded.role });
};