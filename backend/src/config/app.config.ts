import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const config = {
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_PATH: process.env.BASE_PATH || "/api/v1",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "",
  FRONTEND_INTEGRATION_URL: process.env.FRONTEND_INTEGRATION_URL || "",
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@calendario.com",
  },
};
