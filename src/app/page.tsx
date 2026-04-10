// / → redireciona 301 para /clinica-odontologica (URL definitiva da landing)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/clinica-odontologica");
}
