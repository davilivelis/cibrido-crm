import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval necessário para Next.js em dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplica os headers de segurança em todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Força revalidação sem cache na landing page
        source: "/clinica-odontologica",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },

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
