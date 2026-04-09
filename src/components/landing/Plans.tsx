// Seção 8: Planos + Tabela Comparativa
const WA_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1!%20Quero%20agendar%20meu%20diagn%C3%B3stico%20gratuito.";

// Ícone de check para listas dos cards
function Check({ destaque }: { destaque: boolean }) {
  return (
    <span className="font-bold" style={{ color: destaque ? "#F5A623" : "#25D366" }}>
      ✓
    </span>
  );
}

// Definição dos planos e seus recursos
type PlanFeatures = {
  qualificador: boolean;
  agendador: boolean;
  crm: boolean;
  trafego: boolean;
  relatorios: boolean;
  suporte: boolean;
  presencial: boolean;
  treinamento: boolean;
};

const PLANOS: {
  nome: string;
  preco: string;
  destaque: boolean;
  itens: string[]; // lista descritiva nos cards
  features: PlanFeatures;
}[] = [
  {
    nome: "Cibri-Lite",
    preco: "R$497",
    destaque: false,
    itens: [
      "CRM Cíbrido",
      "Suporte WhatsApp",
    ],
    features: {
      qualificador: false, agendador: false, crm: true, trafego: false,
      relatorios: false, suporte: true, presencial: false, treinamento: false,
    },
  },
  {
    nome: "Cibri-Standard",
    preco: "R$897",
    destaque: true,
    itens: [
      "CRM Cíbrido",
      "Agente Qualificador de Pacientes",
      "Agente Agendador de Consultas",
      "Relatórios mensais",
      "Suporte WhatsApp",
    ],
    features: {
      qualificador: true, agendador: true, crm: true, trafego: false,
      relatorios: true, suporte: true, presencial: false, treinamento: false,
    },
  },
  {
    nome: "Cibri-Master",
    preco: "R$1.497",
    destaque: false,
    itens: [
      "Tudo do Standard",
      "Tráfego Pago (Google + Meta)",
      "Consultoria presencial",
      "Treinamento da equipe",
    ],
    features: {
      qualificador: true, agendador: true, crm: true, trafego: true,
      relatorios: true, suporte: true, presencial: true, treinamento: true,
    },
  },
];

// Labels para a tabela comparativa — nomes atualizados
const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  qualificador: "Agente Qualificador de Pacientes",
  agendador:    "Agente Agendador de Consultas",
  crm:          "CRM Cíbrido",
  trafego:      "Tráfego Pago (Google + Meta)",
  relatorios:   "Relatórios mensais",
  suporte:      "Suporte WhatsApp",
  presencial:   "Consultoria presencial",
  treinamento:  "Treinamento da equipe",
};

export default function Plans() {
  return (
    <section id="planos" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-4"
          style={{ color: "#1E2A3A" }}
        >
          Planos para sua clínica odontológica
        </h2>
        <p className="text-center mb-14 text-lg" style={{ color: "#6B7280" }}>
          Escolha o que faz sentido para o seu momento. Sem fidelidade.
        </p>

        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className="rounded-2xl p-8 flex flex-col gap-5"
              style={
                plano.destaque
                  ? { backgroundColor: "#1E2A3A", border: "2px solid #F5A623" }
                  : { backgroundColor: "#F9FAFB", border: "2px solid #E5E7EB" }
              }
            >
              {/* Badge destaque */}
              {plano.destaque && (
                <div
                  className="text-xs font-bold tracking-widest"
                  style={{ color: "#F5A623" }}
                >
                  ★ MAIS ESCOLHIDO
                </div>
              )}

              {/* Nome e preço */}
              <div>
                <h3
                  className="text-2xl font-bold mb-1"
                  style={{ color: plano.destaque ? "#FFFFFF" : "#1E2A3A" }}
                >
                  {plano.nome}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-black"
                    style={{ color: plano.destaque ? "#FFFFFF" : "#1E2A3A" }}
                  >
                    {plano.preco}
                  </span>
                  <span className="text-sm" style={{ color: plano.destaque ? "#9CA3AF" : "#6B7280" }}>
                    /mês
                  </span>
                </div>
              </div>

              {/* Lista de recursos do plano */}
              <ul className="flex flex-col gap-2 flex-1">
                {plano.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-snug"
                    style={{ color: plano.destaque ? "#D1D5DB" : "#374151" }}
                  >
                    <Check destaque={plano.destaque} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center font-bold py-3 rounded-full transition-transform hover:scale-105 active:scale-95"
                style={
                  plano.destaque
                    ? { backgroundColor: "#F5A623", color: "#151F2B" }
                    : { backgroundColor: "#1E2A3A", color: "#FFFFFF" }
                }
              >
                Quero esse
              </a>
            </div>
          ))}
        </div>

        {/* Tabela comparativa */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#1E2A3A" }}>
                <th className="text-left text-white p-4 font-semibold text-sm rounded-tl-2xl">
                  Recurso
                </th>
                {PLANOS.map((plano, i) => (
                  <th
                    key={plano.nome}
                    className={`text-center p-4 font-semibold text-sm ${
                      i === PLANOS.length - 1 ? "rounded-tr-2xl" : ""
                    }`}
                    style={{ color: plano.destaque ? "#F5A623" : "#FFFFFF" }}
                  >
                    {plano.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(FEATURE_LABELS) as (keyof PlanFeatures)[]).map(
                (key, i) => (
                  <tr
                    key={key}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      {FEATURE_LABELS[key]}
                    </td>
                    {PLANOS.map((plano) => (
                      <td key={plano.nome} className="p-4 text-center">
                        {plano.features[key] ? (
                          <span className="text-xl" style={{ color: "#25D366" }}>
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xl">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
