import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["mongodb", "bcryptjs"],
};

export default nextConfig;
