// Seção 8: Planos + Tabela Comparativa
const WA_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1!%20Quero%20agendar%20meu%20diagn%C3%B3stico%20gratuito.";

// Feature pode ser booleano ou texto (ex: "10 dias grátis")
type ValorFeature = boolean | string;

type PlanFeatures = {
  qualificador: ValorFeature;
  agendador: ValorFeature;
  confirmacao: ValorFeature;
  crm: ValorFeature;
  relatorios: ValorFeature;
  mensagens: ValorFeature;
  suporteDedicado: ValorFeature;
};

const PLANOS: {
  nome: string;
  preco: string;
  slogan: string;
  paraQuem: string;
  destaque: boolean;
  itens: string[];
  features: PlanFeatures;
}[] = [
  {
    nome: "Cibri-Lite",
    preco: "R$497",
    slogan: "Nunca mais perca um paciente",
    paraQuem: "Dentista solo ou clínica odontológica pequena sem secretária",
    destaque: false,
    itens: [
      "Agente faz o primeiro contato com novos pacientes",
      "WhatsApp sem revelar seu número particular",
      "Qualificação automática de leads",
      "Leads organizados no Cíbrido",
    ],
    features: {
      qualificador: true,
      agendador: false,
      confirmacao: false,
      crm: false,
      relatorios: false,
      mensagens: false,
      suporteDedicado: false,
    },
  },
  {
    nome: "Cibri-Standard",
    preco: "R$897",
    slogan: "Agenda sempre cheia",
    paraQuem: "Clínica odontológica com secretária que quer escalar",
    destaque: true,
    itens: [
      "Tudo do Cibri-Lite",
      "Agente Agendador automático de consultas",
      "Confirmação + lembrete automático",
      "Redução de no-shows",
      "10 dias grátis do CRM incluídos",
    ],
    features: {
      qualificador: true,
      agendador: true,
      confirmacao: true,
      crm: "10 dias grátis",
      relatorios: false,
      mensagens: false,
      suporteDedicado: false,
    },
  },
  {
    nome: "Cibri-Master",
    preco: "R$1.497",
    slogan: "Gestão completa com IA",
    paraQuem: "Clínica odontológica estruturada que quer escalar",
    destaque: false,
    itens: [
      "Tudo do Cibri-Standard",
      "10 dias grátis do CRM incluídos",
      "CRM completo (pipeline, dashboard, relatórios)",
      "Visão completa da operação",
      "Mensagens automatizadas",
      "Integração com sistemas",
      "Atendimento dedicado",
    ],
    features: {
      qualificador: true,
      agendador: true,
      confirmacao: true,
      crm: true,
      relatorios: true,
      mensagens: true,
      suporteDedicado: true,
    },
  },
];

const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  qualificador:     "Agente Qualificador de Pacientes",
  agendador:        "Agente Agendador de Consultas",
  confirmacao:      "Confirmação + lembrete automático",
  crm:              "CRM Cíbrido",
  relatorios:       "Dashboard + relatórios",
  mensagens:        "Mensagens automatizadas",
  suporteDedicado:  "Atendimento dedicado",
};

function CelulaFeature({ valor, destaque }: { valor: ValorFeature; destaque: boolean }) {
  if (valor === false) return <span className="text-gray-300 text-xl">—</span>;
  if (valor === true)  return <span className="text-xl" style={{ color: "#25D366" }}>✓</span>;
  // Texto (ex: "10 dias grátis")
  return (
    <span className="text-xs font-semibold" style={{ color: destaque ? "#F5A623" : "#E91E7B" }}>
      {valor}
    </span>
  );
}

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
              className="rounded-2xl p-8 flex flex-col gap-4"
              style={
                plano.destaque
                  ? { backgroundColor: "#1E2A3A", border: "2px solid #F5A623" }
                  : { backgroundColor: "#F9FAFB", border: "2px solid #E5E7EB" }
              }
            >
              {/* Badge destaque */}
              {plano.destaque && (
                <div className="text-xs font-bold tracking-widest" style={{ color: "#F5A623" }}>
                  ★ MAIS ESCOLHIDO
                </div>
              )}

              {/* Nome, slogan e preço */}
              <div>
                <h3
                  className="text-2xl font-bold mb-1"
                  style={{ color: plano.destaque ? "#FFFFFF" : "#1E2A3A" }}
                >
                  {plano.nome}
                </h3>
                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: plano.destaque ? "#F5A623" : "#E91E7B" }}
                >
                  {plano.slogan}
                </p>
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

              {/* Para quem é */}
              <p
                className="text-xs leading-snug italic border-l-2 pl-3"
                style={{
                  color: plano.destaque ? "#9CA3AF" : "#6B7280",
                  borderColor: plano.destaque ? "#F5A623" : "#E91E7B",
                }}
              >
                Para quem é: {plano.paraQuem}
              </p>

              {/* Lista de recursos */}
              <ul className="flex flex-col gap-2 flex-1">
                {plano.itens.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-snug"
                    style={{ color: plano.destaque ? "#D1D5DB" : "#374151" }}
                  >
                    <span
                      className="font-bold mt-0.5 shrink-0"
                      style={{ color: plano.destaque ? "#F5A623" : "#25D366" }}
                    >
                      ✓
                    </span>
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

        {/* Tabela comparativa — overflow-x-auto garante scroll horizontal no mobile */}
        <div className="overflow-x-auto rounded-2xl -mx-4 sm:mx-0 px-4 sm:px-0" style={{ border: "2px solid #E5E7EB", boxShadow: "0 8px 30px rgba(30,42,58,0.15)" }}>
          <table className="w-full border-collapse" style={{ minWidth: "520px" }}>
            <thead>
              <tr style={{ backgroundColor: "#1E2A3A" }}>
                {/* Coluna "Recurso" sticky — fica fixada ao scrollar horizontalmente no mobile */}
                <th
                  className="text-left text-white p-4 font-semibold text-sm rounded-tl-2xl"
                  style={{ position: "sticky", left: 0, zIndex: 10, backgroundColor: "#1E2A3A" }}
                >
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
              {(Object.keys(FEATURE_LABELS) as (keyof PlanFeatures)[]).map((key, i) => (
                <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {/* Célula sticky acompanha a cor de fundo da linha */}
                  <td
                    className="p-4 text-sm text-gray-700 font-medium"
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                    }}
                  >
                    {FEATURE_LABELS[key]}
                  </td>
                  {PLANOS.map((plano) => (
                    <td key={plano.nome} className="p-4 text-center">
                      <CelulaFeature valor={plano.features[key]} destaque={plano.destaque} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
