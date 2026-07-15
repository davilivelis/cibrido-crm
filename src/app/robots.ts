import { MetadataRoute } from "next";

// CRM privado — não deve ser indexado por buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
