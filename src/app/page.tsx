// Roteamento por domínio:
// cibrido.com.br     → /clinica-odontologica (landing page — URL definitiva QR code)
// crm.cibrido.com.br → /login (CRM)
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host.includes("crm.")) {
    redirect("/login");
  }

  redirect("/clinica-odontologica");
}
