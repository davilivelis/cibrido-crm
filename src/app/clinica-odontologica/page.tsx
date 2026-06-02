"use client";

import { useEffect } from "react";

const WPP_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1%2C+gostaria+de+solicitar+um+diagn%C3%B3stico+gratuito+para+minha+cl%C3%ADnica.";

function WppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.885a.5.5 0 00.606.607l6.109-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.053-1.369l-.362-.214-3.754.896.911-3.67-.235-.375A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function IgIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export default function ClinicaOdontologicaPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>(".lp2 .reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
    );
    document.querySelectorAll<HTMLElement>(".lp2 section").forEach((sec) => {
      sec.querySelectorAll<HTMLElement>(".reveal").forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.07}s`;
      });
    });
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp2">
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a className="nav-logo" href="#">
            C<span>í</span>brido
          </a>
          <ul className="nav-links">
            <li><a href="#solucoes">Soluções</a></li>
            <li><a href="#comecar">Como Começar</a></li>
            <li><a href="#especialistas">Especialistas</a></li>
            <li><a href="#duvidas">Dúvidas</a></li>
            <li>
              <a className="btn-diag" href={WPP_LINK} target="_blank" rel="noopener noreferrer">
                Diagnóstico Gratuito
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* 1ª DOBRA — HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">Consultoria para Clínicas Odontológicas</div>

          <h1 className="reveal">
            Enquanto você cuida dos pacientes,<br />
            <em>nós cuidamos do crescimento</em><br />
            da sua clínica.
          </h1>

          <p className="hero-desc reveal">
            A Cíbrido nasceu da convicção de que o digital sozinho não basta — e o presencial sozinho também não. Quando a prospecção na rua alimenta o sistema digital e os agentes de IA qualificam quem veio do panfleto, do cartão de visita ou da indicação, o resultado é um ciclo que não para.
          </p>

          <div className="hero-cta-block reveal">
            <a className="btn-primary" href={WPP_LINK} target="_blank" rel="noopener noreferrer">
              <WppIcon />
              Solicitar Diagnóstico Gratuito
            </a>
            <p className="hero-julian-note">
              💬 Você será atendido pelo <strong>Juliano</strong>, nosso agente virtual — rápido, objetivo e sem enrolação.
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* 2ª DOBRA — EMEPA */}
      <section>
        <div className="container">
          <div className="emepa-header">
            <div>
              <p className="section-eyebrow">Nossa Metodologia</p>
              <h2 className="section-title reveal">O método que transforma<br />clínicas odontológicas</h2>
              <p className="section-sub reveal">Cada passo foi construído para mapear a realidade da sua clínica e agir com precisão — sem achismo, sem promessa vazia.</p>
            </div>
            <div className="emepa-acronym reveal">E.M.E.P.A.</div>
          </div>

          <div className="emepa-grid">
            {[
              { letter: "E", title: "Entendimento", text: "Diagnóstico gratuito da clínica odontológica — mapeamos o momento atual antes de propor qualquer solução." },
              { letter: "M", title: "Mapeamento", text: "Identificamos o que está travando o crescimento da sua clínica e as oportunidades que você ainda não enxergou para atrair mais pacientes qualificados." },
              { letter: "E", title: "Estruturação", text: "Organizamos o atendimento, o fluxo de pacientes e a comunicação para que nenhuma oportunidade seja perdida." },
              { letter: "P", title: "Prospecção", text: "Planejamos ações online e presenciais na região da sua clínica para atrair novos pacientes todos os dias — no digital e na rua." },
              { letter: "A", title: "Atendimento Dedicado", text: "Tratamos sua clínica como se fosse o nosso próprio negócio. Acompanhamento próximo, presença constante e ação imediata para que cada oportunidade de crescimento seja aproveitada." },
            ].map((card) => (
              <div className="emepa-card reveal" key={card.title}>
                <div className="emepa-letter">{card.letter}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3ª DOBRA — ESPECIALISTAS */}
      <section className="equipe-section" id="especialistas">
        <div className="container">
          <p className="section-eyebrow">A equipe</p>
          <h2 className="section-title reveal">
            Dois especialistas.<br />
            <em style={{ fontStyle: "italic" }}>Uma visão.</em>
          </h2>
          <p className="section-sub reveal">Fazer sua clínica odontológica crescer no mundo real e no digital.</p>

          <div className="equipe-grid">
            <div className="equipe-card reveal">
              <p className="equipe-role">Consultor | Comercial &amp; Estratégia Offline</p>
              <h3>Ricardo Souza</h3>
              <p>Estuda o negócio da sua clínica odontológica, planeja ações com estratégia e constrói presença onde ela mais importa: na rua, no bairro, na porta do seu consultório. Anos de experiência em prospecção presencial e inteligência de mercado.</p>
            </div>
            <div className="equipe-card reveal">
              <p className="equipe-role">Projetos &amp; Estratégia Digital</p>
              <h3>Davi Junior</h3>
              <p>Arquiteto de soluções digitais com experiência em bastidores de lançamentos, automações e tráfego pago que movimentaram milhares de leads. Transforma dados em crescimento previsível para clínicas odontológicas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4ª DOBRA — SOLUÇÕES */}
      <section id="solucoes">
        <div className="container">
          <p className="section-eyebrow">O que entregamos</p>
          <h2 className="section-title reveal">Soluções para sua<br />clínica odontológica</h2>
          <p className="section-sub reveal">Cada solução foi desenhada para um dentista que está construindo uma clínica de verdade — não só um consultório.</p>

          <div className="benefits-grid">
            {[
              { icon: "📅", title: "Agenda Organizada", text: "Pacientes chegando na hora certa, lembretes automáticos e zero buraco na agenda. Sua secretária foca no que importa." },
              { icon: "📈", title: "Engajamento que Impulsiona Resultados", text: "Lead tratado, oportunidade aproveitada. Nenhum contato cai no esquecimento. Do primeiro interesse até o agendamento — e depois, até a fidelização." },
              { icon: "📍", title: "Presença no Bairro — Físico + Digital Integrados", text: "Quem está na rua conhece seu nome. Quem está no celular encontra sua clínica. Os dois canais trabalhando juntos, de forma planejada, para que o boca a boca vire sistema." },
              { icon: "🎯", title: "Atendimento Dedicado ao Seu Negócio", text: "Cuidamos da sua clínica como se fosse a nossa. Presença constante, ajustes rápidos e estratégia em evolução contínua — sem você precisar pedir." },
            ].map((card) => (
              <div className="benefit-card reveal" key={card.title}>
                <div className="benefit-icon">{card.icon}</div>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="montagem-block reveal">
            <h3>Montagem Customizada</h3>
            <p>Cada clínica tem um momento. Escolhemos juntos o que faz sentido para o seu.</p>
            <div className="montagem-tags">
              {[
                "CRM",
                "Agente Virtual Qualificador",
                "Agente Virtual Agendador",
                "Site",
                "Tráfego Pago",
                "Mapeamento da Concorrência",
                "Pesquisa de Mercado",
                "Coleta de Leads",
                "Prospecção Presencial Estratégica",
                "Abordagem e Encaminhamento",
                "Fotógrafo Profissional",
                "Impressão Gráfica",
                "Propaganda Volante",
              ].map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5ª DOBRA — COMO COMEÇAR */}
      <section className="comecar-section" id="comecar">
        <div className="container">
          <p className="section-eyebrow">O processo</p>
          <h2 className="section-title reveal">Simples. Sem complicação.<br />Sem fidelidade.</h2>
          <p className="section-sub reveal">A gente vai até você, entende o cenário real da sua clínica e apresenta o que faz sentido — antes de qualquer compromisso.</p>

          <div className="comecar-steps reveal">
            <div className="step-card">
              <div className="step-bg-num">01</div>
              <div className="step-pill"><span>01</span> Presencial</div>
              <h3>Visita Consultiva<br />Presencial</h3>
              <p>Nossa equipe vai até sua clínica e região para entender sua operação, identificar oportunidades e apresentar o que faz sentido para o seu negócio. Sem pitch de vendas — com escuta de verdade.</p>
            </div>

            <div className="step-card">
              <div className="step-bg-num">02</div>
              <div className="step-pill"><span>02</span> Entendimento + Mapeamento</div>
              <h3>Diagnóstico<br />Completo da Clínica</h3>
              <p>Fazemos o levantamento completo — entendemos o momento atual, mapeamos o que está travando o crescimento e identificamos as oportunidades que você ainda não está enxergando. Com base nisso, apresentamos o que pode ser feito.</p>
              <div className="step-free">Gratuito. Sem compromisso.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* 6ª DOBRA — FAQ */}
      <section className="faq-section" id="duvidas">
        <div className="container">
          <p className="section-eyebrow">Dúvidas Frequentes</p>
          <h2 className="section-title reveal">Perguntas que<br />chegam mais.</h2>

          <div className="faq-grid">
            {[
              {
                q: "O que é um agente de IA para clínica odontológica?",
                a: "É um assistente virtual que atende seus pacientes pelo WhatsApp 24 horas por dia. Qualifica quem entrou em contato, filtra leads com real interesse e organiza os agendamentos — sem precisar de uma secretária disponível em tempo integral.",
              },
              {
                q: "Preciso ter conhecimento técnico para usar as soluções da Cíbrido?",
                a: "Não. Nossa equipe cuida de toda a configuração, implantação e acompanhamento. Você foca no que sabe fazer: cuidar dos seus pacientes.",
              },
              {
                q: "Como funciona o Diagnóstico Gratuito?",
                a: "Nossa equipe vai até sua clínica, entende o momento atual, mapeia o que está travando o crescimento e apresenta o que faz sentido para o seu cenário. Sem custo. Sem compromisso de continuidade.",
              },
              {
                q: "O atendimento presencial é só para determinadas regiões?",
                a: "Atendemos clínicas e consultórios na Grande São Paulo e região. Se você está fora desse perímetro, fale com o Juliano — avaliamos juntos a melhor forma de chegar até você.",
              },
              {
                q: "Como funciona o processo depois do Diagnóstico?",
                a: "Após o diagnóstico, apresentamos um plano personalizado com base no que encontramos na sua clínica. A partir daí, você decide o que faz sentido — sem pressão e sem fidelidade forçada.",
              },
              {
                q: "Como os agentes de IA se integram com meu WhatsApp?",
                a: "Por meio de uma conexão segura ao número da sua clínica. O agente atende como um funcionário seu, com o nome e a personalidade que você definir. Pacientes não percebem a diferença — e quem percebe, aprecia a agilidade.",
              },
            ].map((item) => (
              <div className="faq-item reveal" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box reveal">
            <h2>Fale com o Juliano agora.</h2>
            <p>Ele é nosso agente virtual. Entende o momento da sua clínica e agenda seu diagnóstico gratuito com um especialista Cíbrido.</p>
            <a className="btn-primary" href={WPP_LINK} target="_blank" rel="noopener noreferrer">
              <WppIcon />
              Falar com o Juliano — WhatsApp
            </a>
            <p className="cta-agent-note">Atendimento via agente virtual 24h. Sem espera, sem formulário.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <a className="footer-logo" href="#">C<span>í</span>brido</a>
            <div className="footer-info">
              © 2026 Sistema Cíbrido — Diadema, SP<br />
              <a href="mailto:suporte@cibrido.com.br">suporte@cibrido.com.br</a>
            </div>
            <div className="footer-social">
              <a href="https://instagram.com/grupocibrido" target="_blank" rel="noopener noreferrer">
                <IgIcon />
                @grupocibrido
              </a>
              <a href="mailto:suporte@cibrido.com.br">suporte@cibrido.com.br</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
