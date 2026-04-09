// Seção 4: Números + Prova Social — card navy premium, números dourados
const STATS = [
  { valor: "93%",  descricao: "Taxa de resposta dos agentes"             },
  { valor: "24/7", descricao: "Atendimento ininterrupto"                 },
  { valor: "3x",   descricao: "Mais agendamentos no primeiro mês"        },
  { valor: "10",   descricao: "Minutos para primeira resposta ao lead"   },
];

const CHECKS = [
  "Sistema Cíbrido",
  "Leads qualificados",
  "Atendimento presencial Diadema",
  "Suporte humano + IA",
];

export default function Numbers() {
  return (
    <section className="py-16" style={{ backgroundColor: "#0F1A28" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl p-8 md:p-14 border"
          style={{ backgroundColor: "#1E2A3A", borderColor: "rgba(245,166,35,0.25)" }}
        >
          {/* Grid de métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {STATS.map((stat) => (
              <div key={stat.valor} className="text-center">
                <div
                  className="text-5xl md:text-6xl font-black mb-2 tabular-nums"
                  style={{ color: "#F5A623" }}
                >
                  {stat.valor}
                </div>
                <div className="text-gray-400 leading-snug" style={{ fontSize: "0.95rem" }}>
                  {stat.descricao}
                </div>
              </div>
            ))}
          </div>

          {/* Linha de checks */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-6 border-t border-white/10">
            {CHECKS.map((check) => (
              <div key={check} className="flex items-center gap-2">
                <span className="font-bold text-xl" style={{ color: "#F5A623" }}>
                  ✓
                </span>
                <span className="text-white font-medium" style={{ fontSize: "1rem" }}>{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
