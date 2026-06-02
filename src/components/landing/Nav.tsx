"use client";

import { useState } from "react";
import Image from "next/image";

// Links de âncora para as seções da landing page
const WPP_LINK =
  "https://wa.me/5511960341082?text=Ol%C3%A1%2C+gostaria+de+solicitar+um+diagn%C3%B3stico+gratuito+para+minha+cl%C3%ADnica.";

const NAV_LINKS = [
  { href: "#solucoes",      label: "Soluções"      },
  { href: "#como-comecar",  label: "Como Começar"  },
  { href: "#duvidas",       label: "Dúvidas"       },
];

// Seção 2: Nav sticky — fundo navy, logo + links + hamburger mobile
export default function Nav() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 shadow-lg"
      style={{ backgroundColor: "#1E2A3A" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + nome */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/landing/logo-navbar.png"
              alt="Cíbrido"
              width={39}
              height={40}
              className="shrink-0"
            />
            <span className="text-white text-xl font-bold tracking-wide">
              Cíbrido
            </span>
          </div>

          {/* Links desktop + CTA */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <a
              href={WPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-landing text-white text-sm font-bold px-5 py-2 rounded-lg"
            >
              Diagnóstico Gratuito
            </a>
          </div>

          {/* Botão hamburger — mobile */}
          <button
            className="md:hidden text-white p-2 rounded-md"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
          >
            {menuAberto ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Menu mobile expandido */}
        {menuAberto && (
          <div className="md:hidden pb-4 flex flex-col gap-4 border-t border-white/10 pt-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium px-2"
                onClick={() => setMenuAberto(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={WPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-landing text-white text-sm font-bold px-5 py-3 rounded-lg text-center"
              onClick={() => setMenuAberto(false)}
            >
              Diagnóstico Gratuito
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
