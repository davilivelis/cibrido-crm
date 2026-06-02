import type { Metadata } from "next";
import PixelEvents from "@/components/landing/PixelEvents";

export const metadata: Metadata = {
  title: "Cíbrido — Consultoria para Clínicas Odontológicas",
  description:
    "Consultoria de marketing odontológico estratégico para clínicas que querem crescer. Diagnóstico gratuito, presencial em Diadema e região. Sem fidelidade.",
  openGraph: {
    title: "Cíbrido — Consultoria para Clínicas Odontológicas",
    description:
      "Consultoria de marketing odontológico estratégico. Diagnóstico gratuito, sem compromisso.",
    url: "https://cibrido.com.br/clinica-odontologica",
    siteName: "Cíbrido",
    images: [
      {
        url: "/images/landing/logo-400.png",
        width: 400,
        height: 400,
        alt: "Cíbrido — Consultoria para Clínicas Odontológicas",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/images/landing/favicon-32.png",
    apple: "/images/landing/favicon-192.png",
  },
  alternates: {
    canonical: "https://cibrido.com.br/clinica-odontologica",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é um agente de IA para clínica odontológica?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "É um assistente virtual que atende seus pacientes pelo WhatsApp 24 horas por dia. Qualifica quem entrou em contato, filtra leads com real interesse e organiza os agendamentos — sem precisar de uma secretária disponível em tempo integral.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso ter conhecimento técnico para usar as soluções da Cíbrido?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. Nossa equipe cuida de toda a configuração, implantação e acompanhamento. Você foca no que sabe fazer: cuidar dos seus pacientes.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o Diagnóstico Gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nossa equipe vai até sua clínica, entende o momento atual, mapeia o que está travando o crescimento e apresenta o que faz sentido para o seu cenário. Sem custo. Sem compromisso de continuidade.",
      },
    },
    {
      "@type": "Question",
      name: "O atendimento presencial é só para determinadas regiões?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Atendemos clínicas e consultórios na Grande São Paulo e região. Se você está fora desse perímetro, fale com o Juliano — avaliamos juntos a melhor forma de chegar até você.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o processo depois do Diagnóstico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Após o diagnóstico, apresentamos um plano personalizado com base no que encontramos na sua clínica. A partir daí, você decide o que faz sentido — sem pressão e sem fidelidade forçada.",
      },
    },
    {
      "@type": "Question",
      name: "Como os agentes de IA se integram com meu WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Por meio de uma conexão segura ao número da sua clínica. O agente atende como um funcionário seu, com o nome e a personalidade que você definir. Pacientes não percebem a diferença — e quem percebe, aprecia a agilidade.",
      },
    },
  ],
};

export default function ClinicaOdontologicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        .btn-cta-landing {
          background-color: #25D366 !important;
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease !important;
        }
        .btn-cta-landing:hover {
          background-color: #C1272D !important;
          box-shadow: 0 8px 28px rgba(193,39,45,0.35) !important;
          transform: translateY(-1px) !important;
        }
        .btn-cta-landing:active {
          background-color: #9e1f24 !important;
          transform: translateY(0) !important;
        }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PixelEvents />
      {children}
    </>
  );
}
