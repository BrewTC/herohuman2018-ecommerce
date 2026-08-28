import dotenv from "dotenv";

export const activeEnvFile = process.env.ECOM_ENV === "prod" ? ".env.prod" : ".env.local";

dotenv.config({
  path: activeEnvFile,
  override: true,
});
