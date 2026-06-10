import { ReactNode } from "react";

const WPP_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1%2C+gostaria+de+solicitar+um+diagn%C3%B3stico+gratuito+para+minha+cl%C3%ADnica.";

function IconeGlobo() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const CARD_STYLE = {
  border: "1.5px solid #E91E7B",
  boxShadow: "0 4px 20px rgba(30,42,58,0.09)",
};

interface ItemCard {
  nome: string;
  descricao: string;
}

interface DadosCard {
  icone: ReactNode;
  titulo: string;
  subtitulo: string;
  intro: string;
  itens: ItemCard[];
}

const CARDS: DadosCard[] = [
  {
    icone: <IconeGlobo />,
    titulo: "ONLINE",
    subtitulo: "Tecnologia e Automação",
    intro: "Paramos o desperdício de oportunidades e blindamos a sua agenda:",
    itens: [
      {
        nome: "Site de Alta Performance",
        descricao: "Estrutura digital focada em atração e conversão rápida de pacientes.",
      },
      {
        nome: "Robô de Atendimento",
        descricao: "Automação inteligente para confirmações, reduzindo drasticamente as faltas (No-Show).",
      },
      {
        nome: "CRM Próprio Cíbrido",
        descricao:
          "Plataforma exclusiva desenvolvida para a odontologia, que centraliza todo o tratamento de leads e a conversão final de pacientes.",
      },
    ],
  },
  {
    icone: <IconePresencial />,
    titulo: "OFFLINE",
    subtitulo: "Alto Impacto Estratégico",
    intro: "Garantimos a dominância local do seu consultório:",
    itens: [
      {
        nome: "Geomarketing Estratégico",
        descricao: "Mapeamos onde estão os pacientes de maior poder aquisitivo na sua região.",
      },
      {
        nome: "Inteligência de Mercado e Competitiva",
        descricao: "Posicionamos sua clínica acima da guerra de preços das grandes franquias.",
      },
      {
        nome: "Precificação Estratégica",
        descricao: "Protegemos sua margem de lucro com base no cálculo real da sua hora-mocho.",
      },
    ],
  },
];

// Seção: Soluções — nova dobra Cíbrido Odonto
export default function Services() {
  return (
    <section id="solucoes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Título + subtítulo */}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4"
          style={{ color: "#1E2A3A" }}
        >
          Cíbrido Odonto: o braço direito do seu consultório
        </h2>
        <p
          className="text-center mb-14 max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
          style={{ color: "#6B7280" }}
        >
          Conectamos tecnologia e estratégia para a sua clínica escalar. Menos tempo no mocho,
          mais inteligência no balcão — a conexão nota 10 para o seu crescimento.
        </p>

        {/* Label dourado + parágrafo metodologia */}
        <p
          className="text-center text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "#F5A623", letterSpacing: "0.18em" }}
        >
          Por que a Cíbrido Odonto?
        </p>
        <p
          className="text-center max-w-3xl mx-auto mb-12 text-sm sm:text-base leading-relaxed"
          style={{ color: "#1E2A3A" }}
        >
          Esqueça relatórios frios. A Cíbrido Odonto é a consultoria estratégica que assume os
          bastidores do seu negócio através de uma{" "}
          <strong>Metodologia Própria</strong>. Unimos a tecnologia que automatiza ao
          posicionamento tático que domina a sua região.
        </p>

        {/* Três pílulas */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {["Lucro", "Tempo", "Escala"].map((pilar) => (
            <span
              key={pilar}
              className="px-6 py-2 rounded-full text-sm font-semibold"
              style={{ backgroundColor: "#F0F2F5", border: "1.5px solid #E91E7B", color: "#1E2A3A" }}
            >
              {pilar}
            </span>
          ))}
        </div>

        {/* Subtítulo de bloco */}
        <h3
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-8"
          style={{ color: "#1E2A3A" }}
        >
          A Perfeita Integração para o seu Negócio
        </h3>

        {/* Dois cards Online + Offline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CARDS.map((card) => (
            <div
              key={card.titulo}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={CARD_STYLE}
            >
              <div className="flex items-center gap-4">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
                  style={{ color: "#1E2A3A", backgroundColor: "#F0F2F5" }}
                >
                  {card.icone}
                </div>
                <div>
                  <h4 className="font-bold text-lg" style={{ color: "#1E2A3A" }}>
                    {card.titulo}
                  </h4>
                  <p className="text-sm font-semibold" style={{ color: "#E91E7B" }}>
                    {card.subtitulo}
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {card.intro}
              </p>
              <ul className="flex flex-col gap-3">
                {card.itens.map((item) => (
                  <li key={item.nome} className="text-sm leading-relaxed">
                    <span className="font-semibold" style={{ color: "#1E2A3A" }}>
                      {item.nome}
                    </span>
                    {" — "}
                    <span style={{ color: "#6B7280" }}>{item.descricao}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Fecho navy */}
        <div
          className="rounded-2xl p-8 sm:p-12 text-center"
          style={{ backgroundColor: "#1E2A3A" }}
        >
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
            Pronto para construir o futuro sustentável da sua clínica?
          </h3>
          <p className="mb-8 max-w-2xl mx-auto text-sm sm:text-base" style={{ color: "#A0AEC0" }}>
            Garanta a inteligência geográfica e o sistema exclusivo que o seu consultório
            precisa para liderar.
          </p>
          <a
            href={WPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta-landing inline-block text-white font-bold px-8 py-4 rounded-full text-sm sm:text-base"
          >
            QUERO ESCALAR MEU CONSULTÓRIO
          </a>
        </div>

      </div>
    </section>
  );
}
