import Image from "next/image";

const WA_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1!%20Quero%20agendar%20meu%20diagn%C3%B3stico%20gratuito.";

function IconeWhatsApp() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 sm:py-0">
          <div className="max-w-2xl space-y-5 sm:space-y-7">
            <h1
              className="text-white font-extrabold leading-tight"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.75rem)" }}
            >
              Faça sua clínica odontológica faturar mais.
            </h1>

            <p
              className="text-gray-200 leading-relaxed max-w-xl"
              style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
            >
              Agentes de IA que atendem, qualificam e agendam pacientes{" "}
              <span className="hidden sm:inline"><br /></span>
              24 horas por dia enquanto você foca no que importa:{" "}
              <strong className="text-white font-extrabold tracking-wide">
                ATENDER.
              </strong>
            </p>

            {/* Botão: w-full mobile (linha única 320px) → inline-flex desktop */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex sm:inline-flex items-center justify-center
                gap-2 sm:gap-3
                whitespace-nowrap
                text-white font-bold
                text-sm sm:text-lg
                px-4 sm:px-12
                py-3 sm:py-4
                w-full sm:w-auto
                rounded-full shadow-xl
                transition-all
                bg-[#25D366] hover:bg-[#1fba58] active:bg-[#1aad50]
                focus:bg-[#25D366] focus:outline-none
                focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2
                hover:scale-105 active:scale-95
              "
            >
              <IconeWhatsApp />
              Agende o seu Diagnóstico Gratuito
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
