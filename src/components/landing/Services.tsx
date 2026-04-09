import { ReactNode } from "react";

// Ícones SVG monocromáticos para cada serviço
function IconeAgente() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}
function IconeCRM() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}
function IconeTrafego() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}
function IconePresencial() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const SERVICOS: {
  icone: ReactNode;
  titulo: string;
  subtitulo?: string;
  descricao: string;
}[] = [
  {
    icone: <IconeAgente />,
    titulo: "Agentes de IA",
    subtitulo: "Qualificador + Agendador",
    descricao:
      "Atendimento automático 24h. O Agente Qualificador de Pacientes e o Agente Agendador de Consultas trabalham juntos no WhatsApp da sua clínica odontológica.",
  },
  {
    icone: <IconeCRM />,
    titulo: "CRM Inteligente",
    descricao:
      "Gestão completa de leads e pacientes. Acompanhe toda a jornada, do primeiro contato ao agendamento confirmado.",
  },
  {
    icone: <IconeTrafego />,
    titulo: "Tráfego Pago",
    subtitulo: "Google Ads + Meta Ads",
    descricao:
      "Campanhas especializadas para clínicas odontológicas. Leads qualificados que chegam prontos para agendar.",
  },
  {
    icone: <IconePresencial />,
    titulo: "Atendimento Presencial",
    descricao:
      "Consultoria e suporte presencial em Diadema e região. Nossa equipe vai até a sua clínica odontológica.",
  },
];

// Seção 5: Serviços — 4 cards com ícones navy, fundo branco
export default function Services() {
  return (
    <section id="solucoes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-4"
          style={{ color: "#1E2A3A" }}
        >
          Soluções para sua clínica odontológica
        </h2>
        <p className="text-center mb-14 max-w-2xl mx-auto text-lg" style={{ color: "#6B7280" }}>
          Digital e presencial. Tudo integrado para você atender mais e melhor.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICOS.map((servico) => (
            <div
              key={servico.titulo}
              className="rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Ícone */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
                style={{ color: "#1E2A3A", backgroundColor: "#F0F2F5" }}
              >
                {servico.icone}
              </div>

              <h3 className="font-bold text-xl mb-1" style={{ color: "#1E2A3A" }}>
                {servico.titulo}
              </h3>

              {servico.subtitulo && (
                <p className="text-sm font-semibold mb-2" style={{ color: "#E91E7B" }}>
                  {servico.subtitulo}
                </p>
              )}

              <p className="leading-relaxed" style={{ color: "#6B7280", fontSize: "0.975rem" }}>
                {servico.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
