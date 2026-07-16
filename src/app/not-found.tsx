import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground mb-6">A página que você procura não existe ou foi movida.</p>
      <Link
        href="/dashboard"
        className="bg-brand-lime text-[#131500] px-6 py-3 rounded-lg hover:bg-[#a8e000] transition-colors"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
