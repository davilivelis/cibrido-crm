// /clinica-odontologica → redireciona para / (landing page agora é a home)
import { redirect } from "next/navigation";

export default function ClinicaOdontologicaRedirect() {
  redirect("/");
}
