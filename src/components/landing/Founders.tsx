import Image from "next/image";

// Seção: Quem Faz Acontecer — fundo navy #1E2A3A
// Posição: entre Metodologia e HowToStart
export default function Founders() {
  return (
    <section className="py-20" style={{ backgroundColor: "#1E2A3A" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="text-center mb-14">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: "#F5A623", letterSpacing: "3px", fontSize: "18px" }}
          >
            QUEM FAZ ACONTECER
          </div>
          <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-3">
            Dois especialistas. Uma visão.
          </h2>
          <p style={{ color: "#A0AEC0", fontSize: "1.35rem" }}>
            Fazer sua clínica odontológica crescer no mundo real e no digital.
          </p>
        </div>

        {/* Cards dos fundadores */}
        <div className="flex flex-col sm:flex-row gap-6 mb-14">

          {/* Card — Ricardo Souza */}
          <div
            className="flex-1 rounded-xl p-7 flex flex-col gap-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(245,166,35,0.3)",
            }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0"
                style={{ color: "#F5A623", backgroundColor: "rgba(245,166,35,0.15)" }}
              >
                RS
              </div>
              <div>
                <div className="text-white font-bold text-2xl leading-tight">Ricardo Souza</div>
                <div className="font-semibold text-lg" style={{ color: "#F5A623" }}>
                  Comercial &amp; Estratégia Offline
                </div>
              </div>
            </div>
            <p className="leading-relaxed text-lg" style={{ color: "#A0AEC0" }}>
              Estuda o negócio da sua clínica odontológica, planeja ações com estratégia e constrói
              presença onde ela mais importa: na rua, no bairro, na porta do seu consultório.
              Transforma presença física em pacientes reais.
            </p>
          </div>

          {/* Card — Davi Junior */}
          <div
            className="flex-1 rounded-xl p-7 flex flex-col gap-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(233,30,123,0.3)",
            }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0"
                style={{ color: "#E91E7B", backgroundColor: "rgba(233,30,123,0.15)" }}
              >
                DJ
              </div>
              <div>
                <div className="text-white font-bold text-2xl leading-tight">Davi Junior</div>
                <div className="font-semibold text-lg" style={{ color: "#E91E7B" }}>
                  Projetos &amp; Estratégia Digital
                </div>
              </div>
            </div>
            <p className="leading-relaxed text-lg" style={{ color: "#A0AEC0" }}>
              Arquiteto de soluções digitais com experiência em bastidores de lançamentos,
              automações e tráfego pago que movimentaram milhares de leads. Enxergou a
              oportunidade de levar inteligência artificial e automação para quem mais precisa:
              o empresário local. Projeta sistemas que trabalham 24 horas para sua clínica
              odontológica, transformando tecnologia em agendamentos reais.
            </p>
          </div>
        </div>

        {/* Bloco inferior: manifesto + logo */}
        <div className="flex flex-col sm:flex-row gap-10 items-center">

          {/* Texto manifesto */}
          <div
            className="flex-[1.3] italic leading-relaxed text-lg"
            style={{
              color: "#FFFFFF",
              lineHeight: 1.8,
              borderTop: "1px solid rgba(245,166,35,0.2)",
              paddingTop: "24px",
            }}
          >
            A Cíbrido nasceu da convicção de que o digital sozinho não basta — e o presencial
            sozinho também não. Quando a prospecção na rua alimenta o sistema digital e os
            agentes de IA qualificam quem veio do panfleto, do cartão ou da indicação, o
            resultado é um ciclo que não para. Não é só tecnologia. Não é só presença de rua.
            É os dois trabalhando juntos para sua clínica odontológica faturar mais.
          </div>

          {/* Logo */}
          <div className="flex-[0.5] flex flex-col items-center gap-2">
            <Image
              src="/images/landing/logo-quem-somos.png"
              alt="Cíbrido"
              width={80}
              height={80}
              className="object-contain"
            />
            <div className="text-white font-bold" style={{ fontSize: "24px" }}>Cíbrido</div>
            <div style={{ color: "#A0AEC0", fontSize: "18px" }}>Sistema IA para</div>
            <div style={{ color: "#A0AEC0", fontSize: "18px" }}>Clínica Odontológica</div>
          </div>
        </div>

      </div>
    </section>
  );
}
