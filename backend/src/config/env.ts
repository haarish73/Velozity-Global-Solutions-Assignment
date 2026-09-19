import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  NODE_ENV: process.env.NODE_ENV || "development",
};