import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // cibrido.com.br → landing page (URL definitiva para QR code)
      {
        source: "/",
        has: [{ type: "host", value: "cibrido.com.br" }],
        destination: "/clinica-odontologica",
        permanent: true,
      },
      // crm.cibrido.com.br → CRM login
      {
        source: "/",
        has: [{ type: "host", value: "crm.cibrido.com.br" }],
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
