import dotenv from "dotenv";

const envFile = process.env.ECOM_ENV === "prod" ? ".env.prod" : ".env.local";
dotenv.config({ path: envFile, override: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
