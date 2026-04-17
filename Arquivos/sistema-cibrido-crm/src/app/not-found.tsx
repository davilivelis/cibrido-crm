import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-6">A página que você procura não existe ou foi movida.</p>
      <Link
        href="/dashboard"
        className="bg-[#E91E7B] text-white px-6 py-3 rounded-lg hover:bg-[#d11a6f] transition-colors"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
