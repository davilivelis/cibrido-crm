'use client'

// Recharts só funciona no browser — por isso este componente é client-side
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'

interface FunnelData {
  name: string
  total: number
  color: string
}

interface FunnelChartProps {
  data: FunnelData[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: FunnelData }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700">{d.payload.name}</p>
      <p className="text-lg font-bold" style={{ color: d.payload.color }}>{d.value}</p>
      <p className="text-xs text-gray-400">leads</p>
    </div>
  )
}

// Label customizado exibido no topo de cada barra
function CustomTopLabel(props: { x?: number; y?: number; width?: number; value?: number; fill?: string }) {
  const { x = 0, y = 0, width = 0, value = 0 } = props
  if (value === 0) return null
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      dominantBaseline="auto"
      style={{ fontSize: 13, fontWeight: 700, fill: '#374151' }}
    >
      {value}
    </text>
  )
}

// Tick customizado no eixo X para rotacionar os nomes das etapas
function CustomXTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, payload } = props
  if (!payload?.value) return null
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        transform="rotate(-40)"
        style={{ fontSize: 13, fill: '#6b7280' }}
      >
        {payload.value}
      </text>
    </g>
  )
}

export default function FunnelChart({ data }: FunnelChartProps) {
  if (data.every((d) => d.total === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-gray-400">Nenhum lead no funil ainda.</p>
      </div>
    )
  }

  // Garante que o domínio do Y nunca fique colado no máximo (melhor visual)
  const maxVal = Math.max(...data.map((d) => d.total))
  const yMax   = Math.max(maxVal + 1, 5)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 24, right: 16, left: -20, bottom: 60 }}
        barSize={40}
        barCategoryGap="30%"
      >
        <CartesianGrid vertical={false} stroke="#f3f4f6" />
        <XAxis
          dataKey="name"
          tick={<CustomXTick />}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          domain={[0, yMax]}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          <LabelList content={<CustomTopLabel />} />
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
