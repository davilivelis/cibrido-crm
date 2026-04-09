// Seção 8: Planos + Tabela Comparativa
const WA_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1!%20Quero%20agendar%20meu%20diagn%C3%B3stico%20gratuito.";

// Definição dos planos e seus recursos
type PlanFeatures = {
  sdr: boolean;
  agendadora: boolean;
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
  features: PlanFeatures;
}[] = [
  {
    nome: "Cibri-Lite",
    preco: "R$497",
    destaque: false,
    features: {
      sdr: false, agendadora: false, crm: true,  trafego: false,
      relatorios: false, suporte: true, presencial: false, treinamento: false,
    },
  },
  {
    nome: "Cibri-Standard",
    preco: "R$897",
    destaque: true,
    features: {
      sdr: true, agendadora: true, crm: true, trafego: false,
      relatorios: true, suporte: true, presencial: false, treinamento: false,
    },
  },
  {
    nome: "Cibri-Master",
    preco: "R$1.497",
    destaque: false,
    features: {
      sdr: true, agendadora: true, crm: true, trafego: true,
      relatorios: true, suporte: true, presencial: true, treinamento: true,
    },
  },
];

// Labels para a tabela comparativa
const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  sdr:        "Agente SDR (Juliano)",
  agendadora: "Agente Agendadora (Lorena)",
  crm:        "CRM Cíbrido",
  trafego:    "Tráfego Pago (Google + Meta)",
  relatorios: "Relatórios mensais",
  suporte:    "Suporte WhatsApp",
  presencial: "Consultoria presencial",
  treinamento:"Treinamento da equipe",
};

export default function Plans() {
  return (
    <section id="planos" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ color: "#1E2A3A" }}
        >
          Planos para sua clínica odontológica
        </h2>
        <p className="text-gray-500 text-center mb-14">
          Escolha o que faz sentido para o seu momento. Sem fidelidade.
        </p>

        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className="rounded-2xl p-8 flex flex-col gap-6"
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
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
              </div>

              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center font-bold py-3 rounded-full transition-transform hover:scale-105 active:scale-95 mt-auto"
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
                <th className="text-left text-white p-4 font-medium text-sm rounded-tl-2xl">
                  Recurso
                </th>
                {PLANOS.map((plano, i) => (
                  <th
                    key={plano.nome}
                    className={`text-center p-4 font-medium text-sm ${
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
