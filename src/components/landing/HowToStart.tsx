// Seção 7: Como Começar — 3 passos simples, visual clean
const PASSOS = [
  {
    numero: "01",
    titulo: "Teste gratuito de 10 dias",
    descricao:
      "Ativamos os agentes de IA na sua clínica odontológica sem custo. Você vê funcionando com leads reais antes de pagar qualquer coisa.",
  },
  {
    numero: "02",
    titulo: "Visita consultiva presencial",
    descricao:
      "Nossa equipe vai até sua clínica em Diadema e região para entender sua operação e configurar tudo do jeito certo.",
  },
  {
    numero: "03",
    titulo: "Escolha o seu plano",
    descricao:
      "Após o teste, você escolhe o plano ideal para o volume e os objetivos da sua clínica odontológica. Sem fidelidade.",
  },
];

export default function HowToStart() {
  return (
    <section className="py-20" style={{ backgroundColor: "#F5F5F5" }}>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PASSOS.map((passo, i) => (
            <div key={i} className="relative">
              {/* Linha conectora entre cards (desktop) */}
              {i < PASSOS.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-full w-full h-px -translate-x-1/2 z-0"
                  style={{ backgroundColor: "#E91E7B", opacity: 0.25 }}
                />
              )}

              <div className="relative z-10 bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 h-full">
                {/* Número grande decorativo */}
                <div
                  className="text-6xl font-black mb-4 leading-none"
                  style={{ color: "#E91E7B" }}
                >
                  {passo.numero}
                </div>
                <h3 className="font-bold text-2xl mb-3" style={{ color: "#1E2A3A" }}>
                  {passo.titulo}
                </h3>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: "1rem" }}>
                  {passo.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
