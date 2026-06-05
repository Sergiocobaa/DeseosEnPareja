import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcrypt", "@libsql/client", "@prisma/adapter-libsql"],
};

export default nextConfig;
