// Skeleton global mostrado enquanto qualquer página do dashboard carrega
// Next.js exibe isso automaticamente durante a busca de dados no servidor

export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Cabeçalho da página */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-muted rounded-lg" />
        <div className="h-4 w-60 bg-muted rounded-lg" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 h-24" />
        ))}
      </div>

      {/* Tabela / lista */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-border flex items-center gap-4">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
