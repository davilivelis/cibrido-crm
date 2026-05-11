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
}[] = [
  {
    icone: <IconeCRM />,
    titulo: "Agenda Organizada",
  },
  {
    icone: <IconeAgente />,
    titulo: "Atendimento Dedicado",
    subtitulo: "ao Seu Negócio",
  },
  {
    icone: <IconePresencial />,
    titulo: "Presença no Bairro",
    subtitulo: "Físico + Digital Integrados",
  },
  {
    icone: <IconeTrafego />,
    titulo: "Engajamento que Impulsiona",
    subtitulo: "Resultados",
  },
];

// Seção 5: Serviços — 4 cards limpos (só ícone + título) + cardápio completo
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
          Cada solução foi desenhada para o dentista que está construindo uma clínica de verdade, não só um consultório.
        </p>

        {/* 4 pilares — cards limpos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {SERVICOS.map((servico) => (
            <div
              key={servico.titulo}
              className="rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1"
              style={{ border: "1.5px solid #E91E7B", boxShadow: "0 4px 20px rgba(30,42,58,0.09)" }}
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
                style={{ color: "#1E2A3A", backgroundColor: "#F0F2F5" }}
              >
                {servico.icone}
              </div>
              <h3 className="font-bold text-lg leading-snug" style={{ color: "#1E2A3A" }}>
                {servico.titulo}
              </h3>
              {servico.subtitulo && (
                <p className="text-sm font-semibold mt-1" style={{ color: "#E91E7B" }}>
                  {servico.subtitulo}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Cardápio completo */}
        <div
          className="rounded-2xl p-8 sm:p-12"
          style={{ backgroundColor: "#1E2A3A" }}
        >
          <p className="text-center text-lg mb-2 font-semibold tracking-widest uppercase" style={{ color: "#F5A623", letterSpacing: "0.18em" }}>
            Monte o seu Sistema
          </p>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: "#A0AEC0" }}>
            Cada clínica tem um momento diferente. Escolha as peças que fazem sentido agora — e expanda conforme crescer.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "CRM — organizar e cuidar do atendimento",
              "Agente virtual — primeiro atendimento",
              "Agente virtual — agendamento",
              "Site",
              "Tráfego pago",
              "Mapeamento da concorrência",
              "Pesquisa mercadológica",
              "Coleta de leads",
              "Prospecção estratégica presencial",
              "Abordagem e encaminhamento para a clínica",
              "Fotógrafo profissional",
              "Impressão gráfica",
              "Propaganda volante",
            ].map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  border: "1px solid rgba(245,166,35,0.25)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
