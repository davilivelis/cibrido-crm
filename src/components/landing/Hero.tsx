import Image from "next/image";

// Seção 3: Hero
//
// IMAGENS:
//   hero-mobile-v2.jpg (800×550) — crop do original 1920×1045:
//     left=400, top=0, width=1520, height=1045
//     Robô em x=237px (30%), Doutor em x=632px (79%)
//     object-position: 54% center → centra entre os dois personagens
//     Margem: ~36px robô / ~32px doutor em 412px; ~18px/~13px em 375px
//   hero-desktop.jpg (1920×1045) — imagem landscape original para sm+
//
// ESTRUTURA:
//   mobile  (<640px): <picture> com hero-mobile-v2.jpg, absolute, object-cover
//   desktop (≥640px): Next.js <Image> natural (define altura da seção)
//
// BOTÃO: w-full + whitespace-nowrap + text-sm → linha única garantida em 320px
export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[480px] sm:min-h-0">

      {/* ── DESKTOP (sm+): imagem landscape natural define a altura da seção ── */}
      <Image
        src="/images/landing/hero-desktop.jpg"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="hidden sm:block w-full h-auto"
        priority
      />

      {/* ── MOBILE (<640px): <picture> com crop preciso robô + doutor ──
          hero-mobile-v2.jpg: 800×550, crop left=400 da imagem 1920×1045
          object-position 54% centra entre robô (30%) e doutor (79%)        */}
      <picture className="sm:hidden absolute inset-0 w-full h-full">
        <source
          media="(max-width: 639px)"
          srcSet="/images/landing/hero-mobile-v2.jpg"
        />
        {/* fallback para browsers que não suportam picture */}
        <img
          src="/images/landing/hero-mobile-v2.jpg"
          alt=""
          className="w-full h-full"
          style={{ objectFit: "cover", objectPosition: "54% center" }}
        />
      </picture>

      {/* Overlay navy semi-transparente */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(21,31,43,0.78)" }}
      />

      {/* Conteúdo sobre a imagem */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 sm:py-0 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h1
              className="text-white font-extrabold leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
            >
              Enquanto você cuida dos pacientes, nós cuidamos do crescimento da sua clínica.
            </h1>

            <p
              className="text-gray-200 leading-relaxed mx-auto max-w-2xl italic"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", lineHeight: 1.8 }}
            >
              A Cíbrido nasceu da convicção de que o digital sozinho não basta — e o presencial
              sozinho também não. Quando a prospecção na rua alimenta o sistema digital e os
              agentes de IA qualificam quem veio do panfleto, do cartão ou da indicação,
              o resultado é um ciclo que não para. Não é só tecnologia. Não é só presença de rua.
              É os dois trabalhando juntos para sua clínica odontológica faturar mais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
