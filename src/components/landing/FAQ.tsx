"use client";

import { useState } from "react";

// Seção: FAQ — accordion React, 6 perguntas (v2)
const PERGUNTAS = [
  {
    pergunta: "O que é um agente de IA para clínica odontológica?",
    resposta:
      "É um assistente virtual que atende seus pacientes pelo WhatsApp 24 horas por dia. Qualifica quem entrou em contato, filtra leads com real interesse e organiza os agendamentos — sem precisar de uma secretária disponível em tempo integral.",
  },
  {
    pergunta: "Preciso ter conhecimento técnico para usar as soluções da Cíbrido?",
    resposta:
      "Não. Nossa equipe cuida de toda a configuração, implantação e acompanhamento. Você foca no que sabe fazer: cuidar dos seus pacientes.",
  },
  {
    pergunta: "Como funciona o Diagnóstico Gratuito?",
    resposta:
      "Nossa equipe vai até sua clínica, entende o momento atual, mapeia o que está travando o crescimento e apresenta o que faz sentido para o seu cenário. Sem custo. Sem compromisso de continuidade.",
  },
  {
    pergunta: "O atendimento presencial é só para determinadas regiões?",
    resposta:
      "Atendemos clínicas e consultórios na Grande São Paulo e região. Se você está fora desse perímetro, fale com o Juliano — avaliamos juntos a melhor forma de chegar até você.",
  },
  {
    pergunta: "Como funciona o processo depois do Diagnóstico?",
    resposta:
      "Após o diagnóstico, apresentamos um plano personalizado com base no que encontramos na sua clínica. A partir daí, você decide o que faz sentido — sem pressão e sem fidelidade forçada.",
  },
  {
    pergunta: "Como os agentes de IA se integram com meu WhatsApp?",
    resposta:
      "Por meio de uma conexão segura ao número da sua clínica. O agente atende como um funcionário seu, com o nome e a personalidade que você definir. Pacientes não percebem a diferença — e quem percebe, aprecia a agilidade.",
  },
];

export default function FAQ() {
  const [aberto, setAberto] = useState<number>(-1);
  const toggle = (i: number) => setAberto(aberto === i ? -1 : i);

  return (
    <section id="duvidas" className="py-20" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-14"
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
                className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-4"
                style={{ color: "#1E2A3A" }}
                onClick={() => toggle(i)}
                aria-expanded={aberto === i}
              >
                <span className="font-semibold text-base sm:text-lg">{item.pergunta}</span>
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

              {aberto === i && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 leading-relaxed" style={{ color: "#4B5563", fontSize: "0.9375rem" }}>
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
