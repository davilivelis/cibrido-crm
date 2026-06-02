// Seção: Como Começar — 2 etapas (v2: Visita Presencial + Diagnóstico)
const PASSOS = [
  {
    numero: "01",
    titulo: "Visita Consultiva Presencial",
    descricao:
      "Nossa equipe vai até sua clínica e região para entender sua operação, identificar oportunidades e apresentar o que faz sentido para o seu negócio. Sem pitch de vendas — com escuta de verdade.",
    badge: null,
  },
  {
    numero: "02",
    titulo: "Diagnóstico Completo da Clínica",
    descricao:
      "Fazemos o levantamento completo — entendemos o momento atual, mapeamos o que está travando o crescimento e identificamos as oportunidades que você ainda não está enxergando. Com base nisso, apresentamos o que pode ser feito.",
    badge: "Gratuito. Sem compromisso.",
  },
];

export default function HowToStart() {
  return (
    <section id="como-comecar" className="py-20" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-4"
          style={{ color: "#1E2A3A" }}
        >
          Como começar
        </h2>
        <p className="text-center mb-14 text-lg" style={{ color: "#6B7280" }}>
          Simples. Sem complicação. Sem fidelidade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PASSOS.map((passo, i) => (
            <div key={i} className="relative">
              {i < PASSOS.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-full w-full h-px -translate-x-1/2 z-0"
                  style={{ backgroundColor: "#E91E7B", opacity: 0.25 }}
                />
              )}

              <div className="relative z-10 bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 h-full flex flex-col">
                <div
                  className="text-6xl font-black mb-4 leading-none"
                  style={{ color: "#E91E7B" }}
                >
                  {passo.numero}
                </div>
                <h3 className="font-bold text-2xl mb-3" style={{ color: "#1E2A3A" }}>
                  {passo.titulo}
                </h3>
                <p className="text-gray-500 leading-relaxed flex-1" style={{ fontSize: "1rem" }}>
                  {passo.descricao}
                </p>
                {passo.badge && (
                  <div
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-bold mx-auto"
                    style={{ backgroundColor: "rgba(37,211,102,0.12)", color: "#1a8a44", border: "1px solid rgba(37,211,102,0.3)" }}
                  >
                    ✓ {passo.badge}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
