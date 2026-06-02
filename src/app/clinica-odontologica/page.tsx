import TickerBar    from "@/components/landing/TickerBar";
import Nav          from "@/components/landing/Nav";
import Hero         from "@/components/landing/Hero";
import Metodologia  from "@/components/landing/Metodologia";
import Founders     from "@/components/landing/Founders";
import Services     from "@/components/landing/Services";
import HowToStart   from "@/components/landing/HowToStart";
import FAQ          from "@/components/landing/FAQ";
import CTAFooter    from "@/components/landing/CTAFooter";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";

export default function ClinicaOdontologica() {
  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <main className="overflow-x-hidden">
        <TickerBar />
        <Nav />
        <Hero />
        <Metodologia />
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #F5A623 30%, #F5A623 70%, transparent)" }} />
        <Founders />
        <Services />
        <HowToStart />
        <FAQ />
        <CTAFooter />
        <WhatsAppFloat />
      </main>
    </>
  );
}
