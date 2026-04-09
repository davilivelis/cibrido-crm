// Seção 1: Ticker Bar — fundo magenta, texto correndo em loop
// Server Component — animação via CSS puro
export default function TickerBar() {
  const text = "EXCLUSIVO PARA CLÍNICAS ODONTOLÓGICAS · ";
  // Duplicamos o texto para criar loop contínuo sem corte
  const row = text.repeat(8);

  return (
    <div
      className="overflow-hidden py-2 text-white text-xs font-bold tracking-widest select-none"
      style={{ backgroundColor: "#E91E7B" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes cibrido-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cibrido-ticker-inner {
          display: inline-block;
          white-space: nowrap;
          animation: cibrido-ticker 28s linear infinite;
        }
      `}</style>
      {/* Dois blocos idênticos lado a lado para loop seamless */}
      <div className="cibrido-ticker-inner">
        {row}
        {row}
      </div>
    </div>
  );
}
