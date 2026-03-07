"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PagosMensuales {
  mes: string
  total: number
}

interface PagosChartProps {
  data: PagosMensuales[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-lg font-bold text-emerald-600">
          ${payload[0].value.toLocaleString("es-CO")}
        </p>
      </div>
    )
  }
  return null
}

export function PagosChart({ data }: PagosChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-slate-400 text-sm">Sin datos de pagos</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPagos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0" }} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#colorPagos)"
          dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}