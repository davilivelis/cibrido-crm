// Landing page: cibrido.com.br/clinica-odontologica
// 10 seções conforme CONTEXTO-BUILD-LANDING.md
import TickerBar     from "@/components/landing/TickerBar";
import Nav           from "@/components/landing/Nav";
import Hero          from "@/components/landing/Hero";
import Numbers       from "@/components/landing/Numbers";
import Services      from "@/components/landing/Services";
import Metodologia   from "@/components/landing/Metodologia";
import HowToStart    from "@/components/landing/HowToStart";
import Plans         from "@/components/landing/Plans";
import FAQ           from "@/components/landing/FAQ";
import CTAFooter     from "@/components/landing/CTAFooter";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";

export default function ClinicaOdontologicaPage() {
  return (
    <main className="overflow-x-hidden">
      {/* 1. Ticker bar magenta */}
      <TickerBar />

      {/* 2. Nav sticky navy */}
      <Nav />

      {/* 3. Hero */}
      <Hero />

      {/* 4. Números + prova social */}
      <Numbers />

      {/* 5. Serviços (id="solucoes") */}
      <Services />

      {/* 6. Método E.M.E.P.A. */}
      <Metodologia />

      {/* 7. Como começar */}
      <HowToStart />

      {/* 8. Planos + tabela comparativa (id="planos") */}
      <Plans />

      {/* 9. FAQ accordion (id="duvidas") */}
      <FAQ />

      {/* 10. CTA Final + Footer */}
      <CTAFooter />

      {/* Widget WhatsApp flutuante — sempre visível */}
      <WhatsAppFloat />
    </main>
  );
}
