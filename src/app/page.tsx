// CRM Livelis — aplicação de propósito único (não há site público).
// A raiz sempre leva ao login; o proxy redireciona usuário logado para /dashboard.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
