import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirect permanente para SEO: / → /clinica-odontologica (URL definitiva para QR code)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/clinica-odontologica",
        permanent: true, // 301 — preserva link juice
      },
    ];
  },
};

export default nextConfig;
