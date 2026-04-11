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
      "Identificamos o que está travando o crescimento da sua clínica e as oportunidades que você ainda não enxergou para atrair mais pacientes qualificados.",
  },
  {
    letra: "E",
    titulo: "Estruturação",
    descricao:
      "Organizamos o atendimento, o fluxo de pacientes e a comunicação para que nenhuma oportunidade seja perdida.",
  },
  {
    letra: "P",
    titulo: "Prospecção",
    descricao:
      "Planejamos ações online e presenciais na região da sua clínica para atrair novos pacientes todos os dias — no digital e na rua.",
  },
  {
    letra: "A",
    titulo: "Automação",
    descricao:
      "Seu atendimento funciona 24 horas, mesmo quando a clínica está fechada. Você foca nos pacientes, a tecnologia com acompanhamento humano cuida do resto.",
  },
];

export default function Metodologia() {
  return (
    <section className="py-20" style={{ backgroundColor: "#151F2B" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="text-center mb-16">
          {/* E.M.E.P.A.: tracking reduzido em mobile para não transbordar em 320px */}
          <div
            className="inline-block font-black mb-6 text-3xl sm:text-5xl md:text-7xl tracking-[0.1em] sm:tracking-[0.25em] md:tracking-[0.3em]"
            style={{ color: "#F5A623" }}
          >
            E.M.E.P.A.
          </div>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold">
            O método que transforma clínicas odontológicas
          </h2>
        </div>

        {/* Passos:
            mobile (< 768px): 1 coluna, empilhados
            tablet (768–1023px): 3 colunas → 2 linhas (3+2)
            desktop (1024px+): 5 colunas lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
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
