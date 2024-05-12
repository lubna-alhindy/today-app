import { config } from "dotenv";

config();

export const Envs = Object.freeze({
  // Auth
  SESSION_SECRET: process.env.SESSION_SECRET || "",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL || "",

  // NodeMailer
  MAILER_EMAIL: process.env.MAILER_EMAIL || "",
  MAILER_PASSWORD: process.env.MAILER_PASSWORD || "",
});
