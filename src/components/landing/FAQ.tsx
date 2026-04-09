"use client";

import { useState } from "react";

// Seção 9: FAQ — accordion React, 6 perguntas
// (Schema JSON-LD está no layout.tsx da rota)
const PERGUNTAS = [
  {
    pergunta: "O que é um agente de IA para clínica odontológica?",
    resposta:
      "É um assistente virtual inteligente que atende seus pacientes pelo WhatsApp 24h por dia, qualifica leads e agenda consultas automaticamente — sem precisar de recepcionista disponível o tempo todo.",
  },
  {
    pergunta: "Preciso ter conhecimento técnico para usar o Sistema Cíbrido?",
    resposta:
      "Não. O Sistema Cíbrido é configurado pela nossa equipe e funciona de forma totalmente gerenciada. Você só precisa acompanhar os relatórios e os resultados.",
  },
  {
    pergunta: "Como funciona o teste gratuito de 10 dias?",
    resposta:
      "Você ativa o sistema sem pagar nada. Durante 10 dias, testamos os agentes na sua clínica odontológica com leads reais. Ao final, você escolhe o plano que faz sentido para o seu volume.",
  },
  {
    pergunta: "O atendimento é realmente presencial em Diadema?",
    resposta:
      "Sim. A Cíbrido oferece consultoria e suporte presencial para clínicas odontológicas em Diadema e região do Grande ABC.",
  },
  {
    pergunta: "Posso cancelar a qualquer momento?",
    resposta:
      "Sim. Não há fidelidade nem multa. Você cancela quando quiser, sem burocracia.",
  },
  {
    pergunta: "Como os agentes de IA se integram com meu WhatsApp?",
    resposta:
      "Integramos diretamente com o número de WhatsApp da sua clínica odontológica via API oficial. Os agentes respondem, qualificam e agendam — tudo pelo mesmo número que você já usa.",
  },
];

export default function FAQ() {
  // Índice do item aberto (-1 = nenhum)
  const [aberto, setAberto] = useState<number>(-1);

  const toggle = (i: number) => setAberto(aberto === i ? -1 : i);

  return (
    <section id="duvidas" className="py-20" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-14"
          style={{ color: "#1E2A3A" }}
        >
          Dúvidas frequentes
        </h2>

        <div className="space-y-3">
          {PERGUNTAS.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <button
                className="w-full text-left p-6 flex items-center justify-between gap-4"
                style={{ color: "#1E2A3A" }}
                onClick={() => toggle(i)}
                aria-expanded={aberto === i}
              >
                <span className="font-semibold text-lg">{item.pergunta}</span>
                {/* Ícone + animado */}
                <span
                  className="shrink-0 text-2xl font-light transition-transform duration-200"
                  style={{
                    color: "#E91E7B",
                    transform: aberto === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>

              {/* Resposta — só renderiza quando aberto */}
              {aberto === i && (
                <div className="px-6 pb-6 leading-relaxed" style={{ color: "#4B5563", fontSize: "1rem" }}>
                  {item.resposta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
