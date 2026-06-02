import Image from "next/image";

const WPP_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1%2C+gostaria+de+solicitar+um+diagn%C3%B3stico+gratuito+para+minha+cl%C3%ADnica.";

function WppIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.885a.5.5 0 00.606.607l6.109-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.053-1.369l-.362-.214-3.754.896.911-3.67-.235-.375A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

// Seção Hero — foto de fundo com overlay, badge, h1, CTA e nota do Juliano
export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[520px] sm:min-h-0">

      {/* DESKTOP (sm+): imagem landscape natural define a altura da seção */}
      <Image
        src="/images/landing/hero-desktop.jpg"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="hidden sm:block w-full h-auto"
        priority
      />

      {/* MOBILE (<640px): crop preciso robô + doutor */}
      <picture className="sm:hidden absolute inset-0 w-full h-full">
        <source media="(max-width: 639px)" srcSet="/images/landing/hero-mobile-v2.jpg" />
        <img
          src="/images/landing/hero-mobile-v2.jpg"
          alt=""
          className="w-full h-full"
          style={{ objectFit: "cover", objectPosition: "54% center" }}
        />
      </picture>

      {/* Overlay navy semi-transparente */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(21,31,43,0.82)" }} />

      {/* Conteúdo sobre a imagem */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-0 text-center">
          <div className="space-y-6 sm:space-y-7">

            {/* Badge */}
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full"
                style={{
                  border: "1px solid rgba(245,166,35,0.45)",
                  backgroundColor: "rgba(245,166,35,0.12)",
                  color: "#F5C842",
                  letterSpacing: "0.1em",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#F5A623", animation: "pulse 2s ease-in-out infinite" }}
                />
                Consultoria para Clínicas Odontológicas
              </span>
            </div>

            {/* H1 */}
            <h1
              className="text-white font-extrabold leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
            >
              Enquanto você cuida dos pacientes,{" "}
              <span className="italic" style={{ color: "#F5C842" }}>
                nós cuidamos do crescimento
              </span>{" "}
              da sua clínica.
            </h1>

            {/* Descrição */}
            <p
              className="text-gray-200 leading-relaxed mx-auto max-w-2xl"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.05rem)", lineHeight: 1.8 }}
            >
              A Cíbrido nasceu da convicção de que o digital sozinho não basta — e o presencial
              sozinho também não. Quando a prospecção na rua alimenta o sistema digital e os
              agentes de IA qualificam quem veio do panfleto, do cartão de visita ou da indicação,
              o resultado é um ciclo que não para.
            </p>

            {/* CTA + nota Juliano */}
            <div className="flex flex-col items-center gap-3">
              <a
                href={WPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto whitespace-nowrap"
                style={{ backgroundColor: "#25D366" }}
              >
                <WppIcon />
                Solicitar Diagnóstico Gratuito
              </a>
              <p className="text-gray-400 text-sm">
                💬 Você será atendido pelo{" "}
                <strong className="text-gray-200">Juliano</strong>, nosso agente virtual — rápido, objetivo e sem enrolação.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
