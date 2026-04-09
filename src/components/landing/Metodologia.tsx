// Seção 6: Método E.M.E.P.A. — fundo navy escuro, letras douradas
const PASSOS = [
  {
    letra: "E",
    titulo: "Entendimento",
    descricao:
      "Diagnóstico gratuito da clínica odontológica — mapeamos o momento atual antes de propor qualquer solução.",
  },
  {
    letra: "M",
    titulo: "Mapeamento",
    descricao:
      "Identificamos processos, gargalos e oportunidades de automação específicos da sua operação.",
  },
  {
    letra: "E",
    titulo: "Estruturação",
    descricao:
      "Implementamos CRM + agentes de IA + automações integradas ao WhatsApp da sua clínica odontológica.",
  },
  {
    letra: "P",
    titulo: "Prospecção",
    descricao:
      "Ativamos tráfego pago e SDR ativo para gerar um fluxo constante de leads qualificados.",
  },
  {
    letra: "A",
    titulo: "Automação",
    descricao:
      "Escala com IA. Os agentes trabalham 24/7 enquanto você foca no atendimento clínico.",
  },
];

export default function Metodologia() {
  return (
    <section className="py-20" style={{ backgroundColor: "#151F2B" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <div
            className="inline-block text-5xl md:text-7xl font-black tracking-[0.3em] mb-6"
            style={{ color: "#F5A623" }}
          >
            E.M.E.P.A.
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold">
            O método que transforma clínicas odontológicas
          </h2>
        </div>

        {/* Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {PASSOS.map((passo, i) => (
            <div key={i} className="text-center">
              {/* Círculo com a letra */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl font-black mb-4 border-2"
                style={{ color: "#F5A623", borderColor: "#F5A623" }}
              >
                {passo.letra}
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                {passo.titulo}
              </h3>
              <p className="text-gray-400 leading-relaxed" style={{ fontSize: "0.975rem" }}>
                {passo.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
