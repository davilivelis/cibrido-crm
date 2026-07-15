// Identidade do produto — fonte única de verdade (white-label).
// Para personalizar por cliente: trocar as env vars no deploy, sem tocar em código.
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "CRM Livelis";
export const APP_COMPANY = process.env.NEXT_PUBLIC_APP_COMPANY ?? "Livelis";
export const APP_URL = process.env.NEXT_PUBLIC_CRM_URL ?? "https://crm.livelis.com.br";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
  "Gestão de leads, agenda e rastreamento de campanhas";
