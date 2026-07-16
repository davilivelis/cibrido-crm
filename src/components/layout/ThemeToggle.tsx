'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

// Alterna light/dark aplicando a classe `dark` no <html> e persistindo em localStorage.
// O script anti-flash no layout raiz aplica a classe antes do primeiro paint.
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
    setIsDark(next)
  }

  // Evita mismatch de hidratação: só renderiza o ícone depois de montar
  if (isDark === null) return <div className={`w-9 h-9 ${className}`} />

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 ${className}`}
    >
      {isDark
        ? <Sun className="w-4.5 h-4.5 text-brand-lime" />
        : <Moon className="w-4.5 h-4.5 text-slate-300" />}
    </button>
  )
}
