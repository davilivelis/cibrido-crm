
  // Seção: Quem Faz Acontecer — fundo navy #1E2A3A
  // Posição: entre Metodologia e HowToStart
  export default function Founders() {
    return (
      <section className="py-16" style={{ backgroundColor: "#1E2A3A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cabeçalho */}
          <div className="text-center mb-10">
            <div
              className="uppercase font-bold mb-3"
              style={{ color: "#F5A623", letterSpacing: "3px", fontSize: "16px" }}
            >
              QUEM FAZ ACONTECER
            </div>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">
              Dois especialistas. Uma visão.
            </h2>
            <p className="text-base sm:text-xl" style={{ color: "#A0AEC0" }}>
              Fazer sua clínica odontológica crescer no mundo real e no digital.
            </p>
          </div>

          {/* Cards dos fundadores: empilham vertical no mobile, lado a lado no sm+ */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8 items-stretch">

            {/* Card — Ricardo Souza */}
            <div
              className="flex-1 rounded-xl p-6 sm:p-8 flex flex-col gap-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(245,166,35,0.3)",
              }}
            >
              {/* Avatar com foto */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full shrink-0 overflow-hidden" style={{ border: "2px solid rgba(245,166,35,0.5)" }}>
                  <img
                    src="/images/landing/ricardo-souza.jpg"
                    alt="Ricardo Souza"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-xl sm:text-2xl leading-tight">Ricardo Souza</div>
                  <div className="font-semibold text-base sm:text-lg" style={{ color: "#F5A623" }}>
                    Comercial &amp; Estratégia Offline
                  </div>
                </div>
              </div>
              <p className="leading-relaxed text-base sm:text-xl" style={{ color: "#A0AEC0" }}>
                Estuda o negócio da sua clínica odontológica, planeja ações com estratégia e constrói
                presença onde ela mais importa: na rua, no bairro, na porta do seu consultório.
                Anos de experiência em prospecção presencial e inteligência de mercado.
              </p>
            </div>

            {/* Card — Davi Junior */}
            <div
              className="flex-1 rounded-xl p-6 sm:p-8 flex flex-col gap-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(245,166,35,0.3)",
              }}
            >
              {/* Avatar com foto */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full shrink-0 overflow-hidden" style={{ border: "2px solid rgba(245,166,35,0.5)" }}>
                  <img
                    src="/images/landing/davi-junior.jpg"
                    alt="Davi Junior"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-xl sm:text-2xl leading-tight">Davi Junior</div>
                  <div className="font-semibold text-base sm:text-lg" style={{ color: "#F5A623" }}>
                    Projetos &amp; Estratégia Digital
                  </div>
                </div>
              </div>
              <p className="leading-relaxed text-base sm:text-xl" style={{ color: "#A0AEC0" }}>
                Arquiteto de soluções digitais com experiência em bastidores de lançamentos,
                automações e tráfego pago que movimentaram milhares de leads. Transforma dados
                em crescimento previsível para clínicas odontológicas.
              </p>
            </div>

          </div>


        </div>
      </section>
    );
  }
