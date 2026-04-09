import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirect permanente para SEO: /clinica-odontologica → /
  async redirects() {
    return [
      {
        source: "/clinica-odontologica",
        destination: "/",
        permanent: true, // 301 — preserva link juice
      },
    ];
  },
};

export default nextConfig;
