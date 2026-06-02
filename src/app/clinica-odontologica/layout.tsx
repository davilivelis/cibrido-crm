import type { Metadata } from "next";
import PixelEvents from "@/components/landing/PixelEvents";

export const metadata: Metadata = {
  title: "Cíbrido — Consultoria para Clínicas Odontológicas",
  description:
    "Consultoria de marketing odontológico estratégico para clínicas que querem crescer. Diagnóstico gratuito. Presencial em Diadema e região.",
  openGraph: {
    title: "Cíbrido — Consultoria para Clínicas Odontológicas",
    description:
      "Consultoria de marketing odontológico estratégico. Diagnóstico gratuito, sem compromisso.",
    url: "https://cibrido.com.br/clinica-odontologica",
    siteName: "Cíbrido",
    images: [
      {
        url: "/images/landing/logo-400.png",
        width: 400,
        height: 400,
        alt: "Cíbrido — Consultoria para Clínicas Odontológicas",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/images/landing/favicon-32.png",
    apple: "/images/landing/favicon-192.png",
  },
  alternates: {
    canonical: "https://cibrido.com.br/clinica-odontologica",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é um agente de IA para clínica odontológica?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "É um assistente virtual que atende seus pacientes pelo WhatsApp 24 horas por dia. Qualifica quem entrou em contato, filtra leads com real interesse e organiza os agendamentos — sem precisar de uma secretária disponível em tempo integral.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso ter conhecimento técnico para usar as soluções da Cíbrido?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. Nossa equipe cuida de toda a configuração, implantação e acompanhamento. Você foca no que sabe fazer: cuidar dos seus pacientes.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o Diagnóstico Gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nossa equipe vai até sua clínica, entende o momento atual, mapeia o que está travando o crescimento e apresenta o que faz sentido para o seu cenário. Sem custo. Sem compromisso de continuidade.",
      },
    },
    {
      "@type": "Question",
      name: "O atendimento presencial é só para determinadas regiões?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Atendemos clínicas e consultórios na Grande São Paulo e região. Se você está fora desse perímetro, fale com o Juliano — avaliamos juntos a melhor forma de chegar até você.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o processo depois do Diagnóstico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Após o diagnóstico, apresentamos um plano personalizado com base no que encontramos na sua clínica. A partir daí, você decide o que faz sentido — sem pressão e sem fidelidade forçada.",
      },
    },
    {
      "@type": "Question",
      name: "Como os agentes de IA se integram com meu WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Por meio de uma conexão segura ao número da sua clínica. O agente atende como um funcionário seu, com o nome e a personalidade que você definir. Pacientes não percebem a diferença — e quem percebe, aprecia a agilidade.",
      },
    },
  ],
};

const landingCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Figtree:wght@300;400;500;600;700&display=swap');

  .lp2 *, .lp2 *::before, .lp2 *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp2 {
    --bg:        #0B0C15;
    --bg-card:   #13141F;
    --bg-card2:  #191A28;
    --gold:      #C8A04B;
    --gold-lt:   #E8C97A;
    --gold-dim:  rgba(200,160,75,0.18);
    --gold-line: rgba(200,160,75,0.28);
    --white:     #F4F4EF;
    --gray:      #8A8A9A;
    --gray-lt:   #B0B0C0;
    --border:    rgba(255,255,255,0.07);
    --wpp:       #25D366;
    --wpp-dk:    #1da851;
    --red:       #C1272D;
    --red-dk:    #9e1f24;
    --ff-head:   'Cormorant Garamond', Georgia, serif;
    --ff-body:   'Figtree', sans-serif;
    --max:       1120px;
    --radius:    14px;

    background: var(--bg);
    color: var(--white);
    font-family: var(--ff-body);
    font-weight: 400;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .lp2 .container { max-width: var(--max); margin: 0 auto; padding: 0 24px; }
  .lp2 section { padding: 96px 0; }

  /* NAV */
  .lp2 nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(11,12,21,0.93);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .lp2 .nav-inner {
    display: flex; align-items: center; justify-content: space-between;
    height: 66px; max-width: var(--max); margin: 0 auto; padding: 0 24px;
  }
  .lp2 .nav-logo {
    font-family: var(--ff-head); font-size: 1.55rem; font-weight: 500;
    letter-spacing: 0.04em; color: var(--white); text-decoration: none;
  }
  .lp2 .nav-logo span { color: var(--gold); }
  .lp2 .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .lp2 .nav-links a {
    font-size: 0.875rem; font-weight: 500; color: var(--gray-lt);
    text-decoration: none; letter-spacing: 0.02em; transition: color 0.2s;
  }
  .lp2 .nav-links a:hover { color: var(--white); }
  .lp2 .btn-diag {
    background: var(--wpp);
    color: #fff !important;
    padding: 9px 20px;
    border-radius: 8px;
    font-weight: 700 !important;
    font-size: 0.84rem !important;
    letter-spacing: 0.01em;
    transition: background 0.2s, box-shadow 0.2s !important;
    box-shadow: 0 2px 14px rgba(37,211,102,0.22);
  }
  .lp2 .btn-diag:hover { background: var(--red) !important; box-shadow: 0 2px 18px rgba(193,39,45,0.3) !important; }

  /* HERO */
  .lp2 .hero { padding: 112px 0 84px; position: relative; overflow: hidden; }
  .lp2 .hero::before {
    content: '';
    position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
    width: 900px; height: 600px;
    background: radial-gradient(ellipse, rgba(200,160,75,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .lp2 .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid rgba(200,160,75,0.28); background: rgba(200,160,75,0.1);
    color: var(--gold-lt); font-size: 0.78rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 6px 14px; border-radius: 40px; margin-bottom: 28px;
  }
  .lp2 .hero-badge::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold); animation: lp2-blink 2s ease-in-out infinite;
  }
  @keyframes lp2-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
  .lp2 .hero h1 {
    font-family: var(--ff-head);
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 400; line-height: 1.18; letter-spacing: -0.01em;
    color: var(--white); max-width: 780px; margin-bottom: 28px;
  }
  .lp2 .hero h1 em { font-style: italic; color: var(--gold-lt); }
  .lp2 .hero-desc {
    font-size: 1.05rem; color: var(--gray-lt);
    max-width: 640px; line-height: 1.75; margin-bottom: 40px;
  }
  .lp2 .hero-cta-block { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
  .lp2 .hero-julian-note {
    font-size: 0.8rem; color: var(--gray);
    display: flex; align-items: center; gap: 6px;
  }
  .lp2 .hero-julian-note strong { color: var(--gray-lt); }

  /* BOTÃO PRIMÁRIO */
  .lp2 .btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--wpp);
    color: #fff;
    font-family: var(--ff-body); font-size: 0.96rem; font-weight: 700;
    padding: 16px 32px; border-radius: 10px;
    text-decoration: none; letter-spacing: 0.01em;
    transition: background 0.22s, transform 0.15s, box-shadow 0.22s;
    box-shadow: 0 4px 24px rgba(37,211,102,0.3);
  }
  .lp2 .btn-primary:hover {
    background: var(--red);
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(193,39,45,0.35);
  }
  .lp2 .btn-primary:active { transform: translateY(0); }
  .lp2 .btn-primary svg { width: 18px; height: 18px; flex-shrink: 0; }

  /* DIVISOR */
  .lp2 .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,160,75,0.22), transparent);
    margin: 0 24px;
  }

  /* TIPOGRAFIA COMPARTILHADA */
  .lp2 .section-eyebrow {
    font-size: 0.74rem; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--gold); margin-bottom: 14px;
  }
  .lp2 .section-title {
    font-family: var(--ff-head); font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400; line-height: 1.2; color: var(--white); margin-bottom: 16px;
  }
  .lp2 .section-sub { font-size: 1rem; color: var(--gray-lt); max-width: 560px; line-height: 1.7; }

  /* EMEPA */
  .lp2 .emepa-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 40px; margin-bottom: 56px; flex-wrap: wrap;
  }
  .lp2 .emepa-acronym {
    font-family: var(--ff-head); font-size: clamp(3rem, 7vw, 5.5rem);
    font-weight: 300; letter-spacing: 0.32em;
    color: rgba(200,160,75,0.13); line-height: 1; white-space: nowrap;
  }
  .lp2 .emepa-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px;
  }
  @media(max-width:900px){ .lp2 .emepa-grid{ grid-template-columns:1fr 1fr; } .lp2 .emepa-grid .emepa-card:last-child{ grid-column:span 2; } }
  @media(max-width:560px){ .lp2 .emepa-grid{ grid-template-columns:1fr; } .lp2 .emepa-grid .emepa-card:last-child{ grid-column:span 1; } }
  .lp2 .emepa-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px;
    padding: 32px 22px; transition: border-color 0.25s, background 0.25s;
  }
  .lp2 .emepa-card:hover { border-color: rgba(200,160,75,0.28); background: var(--bg-card2); }
  .lp2 .emepa-letter {
    font-family: var(--ff-head); font-size: 3.2rem; font-weight: 300;
    color: var(--gold); line-height: 1; margin-bottom: 18px;
  }
  .lp2 .emepa-card h3 {
    font-size: 0.82rem; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: var(--white); margin-bottom: 10px;
  }
  .lp2 .emepa-card p { font-size: 0.86rem; color: var(--gray-lt); line-height: 1.65; }

  /* EQUIPE */
  .lp2 .equipe-section { background: var(--bg-card); }
  .lp2 .equipe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; }
  @media(max-width:700px){ .lp2 .equipe-grid{ grid-template-columns:1fr; } }
  .lp2 .equipe-card {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 40px 36px; position: relative; overflow: hidden;
  }
  .lp2 .equipe-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--gold), transparent);
  }
  .lp2 .equipe-role { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
  .lp2 .equipe-card h3 { font-family: var(--ff-head); font-size: 1.7rem; font-weight: 400; color: var(--white); margin-bottom: 16px; }
  .lp2 .equipe-card p { font-size: 0.91rem; color: var(--gray-lt); line-height: 1.7; }

  /* SOLUÇÕES */
  .lp2 .benefits-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 20px; margin-top: 56px; margin-bottom: 56px;
  }
  @media(max-width:700px){ .lp2 .benefits-grid{ grid-template-columns:1fr; } }
  .lp2 .benefit-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 36px 30px; display: flex; gap: 20px; align-items: flex-start;
    transition: border-color 0.25s, background 0.25s;
  }
  .lp2 .benefit-card:hover { border-color: rgba(200,160,75,0.28); background: var(--bg-card2); }
  .lp2 .benefit-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(200,160,75,0.1); border: 1px solid rgba(200,160,75,0.22);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem;
  }
  .lp2 .benefit-card h3 { font-size: 0.97rem; font-weight: 700; color: var(--white); margin-bottom: 8px; }
  .lp2 .benefit-card p { font-size: 0.86rem; color: var(--gray-lt); line-height: 1.65; }
  .lp2 .montagem-block {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 40px;
  }
  .lp2 .montagem-block h3 { font-family: var(--ff-head); font-size: 1.45rem; font-weight: 400; color: var(--white); margin-bottom: 6px; }
  .lp2 .montagem-block > p { font-size: 0.88rem; color: var(--gray); margin-bottom: 26px; }
  .lp2 .montagem-tags { display: flex; flex-wrap: wrap; gap: 10px; }
  .lp2 .tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
    padding: 7px 14px; font-size: 0.82rem; font-weight: 500; color: var(--gray-lt);
    transition: border-color 0.2s, color 0.2s;
  }
  .lp2 .tag:hover { border-color: rgba(200,160,75,0.28); color: var(--white); }
  .lp2 .tag::before { content: '+'; color: var(--gold); font-weight: 700; font-size: 0.88rem; }

  /* COMO COMEÇAR */
  .lp2 .comecar-section { background: var(--bg); position: relative; overflow: hidden; }
  .lp2 .comecar-section::before {
    content: '';
    position: absolute; bottom: -120px; right: -120px;
    width: 480px; height: 480px;
    background: radial-gradient(ellipse, rgba(200,160,75,0.06) 0%, transparent 65%);
    pointer-events: none;
  }
  .lp2 .comecar-steps {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 2px; margin-top: 60px; border-radius: var(--radius); overflow: hidden;
  }
  @media(max-width:700px){ .lp2 .comecar-steps{ grid-template-columns:1fr; } }
  .lp2 .step-card {
    background: var(--bg-card); padding: 56px 44px;
    position: relative; overflow: hidden;
    transition: background 0.25s;
  }
  .lp2 .step-card:hover { background: var(--bg-card2); }
  .lp2 .step-card + .step-card { border-left: 1px solid rgba(255,255,255,0.05); }
  @media(max-width:700px){ .lp2 .step-card+.step-card{ border-left:none; border-top:1px solid rgba(255,255,255,0.05); } }
  .lp2 .step-bg-num {
    position: absolute; bottom: -20px; right: 20px;
    font-family: var(--ff-head); font-size: 9rem; font-weight: 300;
    color: rgba(200,160,75,0.06); line-height: 1; pointer-events: none;
    user-select: none; letter-spacing: -0.04em;
  }
  .lp2 .step-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(200,160,75,0.12); border: 1px solid rgba(200,160,75,0.25);
    border-radius: 40px; padding: 5px 14px;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--gold); margin-bottom: 24px;
  }
  .lp2 .step-pill span {
    background: var(--gold); color: #0B0C15;
    border-radius: 50%; width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 800;
  }
  .lp2 .step-card h3 {
    font-family: var(--ff-head); font-size: 1.75rem; font-weight: 400;
    color: var(--white); line-height: 1.2; margin-bottom: 18px;
  }
  .lp2 .step-card p { font-size: 0.93rem; color: var(--gray-lt); line-height: 1.75; }
  .lp2 .step-free {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 24px; font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.05em; color: #5fcf80;
    background: rgba(95,207,128,0.1); border: 1px solid rgba(95,207,128,0.22);
    border-radius: 5px; padding: 4px 12px;
  }
  .lp2 .step-free::before { content: '✓'; }

  /* FAQ */
  .lp2 .faq-section { background: var(--bg-card); }
  .lp2 .faq-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 2px; margin-top: 56px; border-radius: var(--radius); overflow: hidden;
  }
  @media(max-width:700px){ .lp2 .faq-grid{ grid-template-columns:1fr; } }
  .lp2 .faq-item {
    background: var(--bg); padding: 36px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.22s;
  }
  .lp2 .faq-item:hover { background: #0f1020; }
  .lp2 .faq-item h3 {
    font-size: 0.97rem; font-weight: 700; color: var(--white);
    margin-bottom: 12px; line-height: 1.4;
  }
  .lp2 .faq-item h3::before {
    content: '—'; color: var(--gold);
    margin-right: 10px; font-weight: 300;
  }
  .lp2 .faq-item p { font-size: 0.88rem; color: var(--gray-lt); line-height: 1.72; padding-left: 20px; }

  /* CTA FINAL */
  .lp2 .cta-section { background: var(--bg); padding: 96px 0; }
  .lp2 .cta-box {
    background: var(--bg-card); border: 1px solid rgba(200,160,75,0.25);
    border-radius: 20px; padding: 80px 56px; text-align: center;
    position: relative; overflow: hidden;
  }
  .lp2 .cta-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .lp2 .cta-box::after {
    content: ''; position: absolute; top: -120px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(200,160,75,0.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .lp2 .cta-box h2 {
    font-family: var(--ff-head); font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 400; color: var(--white); margin-bottom: 18px;
    position: relative; z-index: 1;
  }
  .lp2 .cta-box > p {
    font-size: 1.02rem; color: var(--gray-lt);
    max-width: 500px; margin: 0 auto 36px; line-height: 1.7;
    position: relative; z-index: 1;
  }
  .lp2 .cta-box .btn-primary { position: relative; z-index: 1; font-size: 1rem; padding: 18px 44px; }
  .lp2 .cta-agent-note { margin-top: 18px; font-size: 0.78rem; color: var(--gray); position: relative; z-index: 1; }

  /* FOOTER */
  .lp2 footer { background: var(--bg-card); border-top: 1px solid rgba(255,255,255,0.06); padding: 40px 0; }
  .lp2 .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
  .lp2 .footer-logo { font-family: var(--ff-head); font-size: 1.3rem; font-weight: 500; color: var(--white); text-decoration: none; }
  .lp2 .footer-logo span { color: var(--gold); }
  .lp2 .footer-info { font-size: 0.82rem; color: var(--gray); text-align: center; }
  .lp2 .footer-info a { color: var(--gray-lt); text-decoration: none; }
  .lp2 .footer-info a:hover { color: var(--gold); }
  .lp2 .footer-social { display: flex; align-items: center; gap: 18px; }
  .lp2 .footer-social a { font-size: 0.82rem; color: var(--gray-lt); text-decoration: none; display: flex; align-items: center; gap: 5px; transition: color 0.2s; }
  .lp2 .footer-social a:hover { color: var(--gold); }

  /* SCROLL REVEAL */
  .lp2 .reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .lp2 .reveal.visible { opacity: 1; transform: translateY(0); }

  /* MOBILE */
  @media(max-width:768px){
    .lp2 section{ padding:72px 0; }
    .lp2 .emepa-header{ flex-direction:column; }
    .lp2 .nav-links li:not(:last-child){ display:none; }
    .lp2 .cta-box{ padding:52px 28px; }
    .lp2 .montagem-block{ padding:28px 20px; }
  }
`;

export default function ClinicaOdontologicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingCSS }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PixelEvents />
      {children}
    </>
  );
}
