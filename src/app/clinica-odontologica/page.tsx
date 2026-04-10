// URL definitiva da landing page — nunca muda (usada em QR codes impressos)
// cibrido.com.br/clinica-odontologica
import type { Metadata } from "next";
import TickerBar     from "@/components/landing/TickerBar";
import Nav           from "@/components/landing/Nav";
import Hero          from "@/components/landing/Hero";
import Numbers       from "@/components/landing/Numbers";
import Services      from "@/components/landing/Services";
import Metodologia   from "@/components/landing/Metodologia";
import Founders      from "@/components/landing/Founders";
import HowToStart    from "@/components/landing/HowToStart";
import Plans         from "@/components/landing/Plans";
import FAQ           from "@/components/landing/FAQ";
import CTAFooter     from "@/components/landing/CTAFooter";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Clínica Odontológica com Agentes de IA — Sistema Cíbrido",
  description:
    "Agentes de IA que atendem, qualificam e agendam pacientes 24h por dia para clínicas odontológicas. Teste gratuito de 10 dias. Atendimento presencial em Diadema e região.",
  openGraph: {
    title: "Faça sua clínica odontológica faturar mais — Sistema Cíbrido",
    description:
      "Agentes de IA que atendem, qualificam e agendam pacientes 24h por dia.",
    url: "https://cibrido.com.br/clinica-odontologica",
    siteName: "Cíbrido",
    images: [
      {
        url: "/images/landing/logo-400.png",
        width: 400,
        height: 400,
        alt: "Sistema Cíbrido — Agentes de IA para clínicas odontológicas",
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
        text: "É um assistente virtual inteligente que atende seus pacientes pelo WhatsApp 24h por dia, qualifica leads e agenda consultas automaticamente — sem precisar de recepcionista disponível o tempo todo.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso ter conhecimento técnico para usar o Sistema Cíbrido?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. O Sistema Cíbrido é configurado pela nossa equipe e funciona de forma totalmente gerenciada. Você só precisa acompanhar os relatórios e os resultados.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o teste gratuito de 10 dias?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Você ativa o sistema sem pagar nada. Durante 10 dias, testamos os agentes na sua clínica odontológica com leads reais. Ao final, você escolhe o plano que faz sentido para o seu volume.",
      },
    },
    {
      "@type": "Question",
      name: "O atendimento é realmente presencial em Diadema?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. A Cíbrido oferece consultoria e suporte presencial para clínicas odontológicas em Diadema e região do Grande ABC.",
      },
    },
    {
      "@type": "Question",
      name: "Posso cancelar a qualquer momento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. Não há fidelidade nem multa. Você cancela quando quiser, sem burocracia.",
      },
    },
    {
      "@type": "Question",
      name: "Como os agentes de IA se integram com meu WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Integramos diretamente com o número de WhatsApp da sua clínica odontológica via API oficial. Os agentes respondem, qualificam e agendam — tudo pelo mesmo número que você já usa.",
      },
    },
  ],
};

export default function ClinicaOdontologica() {
  return (
    <>
      {/* Schema FAQPage para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Smooth scroll para âncoras da nav */}
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <main className="overflow-x-hidden">
        <TickerBar />
        <Nav />
        <Hero />
        <Numbers />
        <Services />
        <Metodologia />
        <Founders />
        <HowToStart />
        <Plans />
        <FAQ />
        <CTAFooter />
        <WhatsAppFloat />
      </main>
    </>
  );
}
