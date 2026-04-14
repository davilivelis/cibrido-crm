import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/clinica-odontologica",
        disallow: ["/", "/dashboard", "/leads", "/pipeline", "/agenda", "/conversas", "/trafego", "/recalls", "/configuracoes", "/onboarding", "/perfil", "/api/"],
      },
    ],
    sitemap: "https://cibrido.com.br/sitemap.xml",
  };
}
