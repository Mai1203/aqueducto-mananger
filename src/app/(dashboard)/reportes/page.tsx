"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Download, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReportes } from "@/features/reportes/hooks"
import { exportarPDF, exportarExcel } from "@/features/reportes/exports"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "ingreso" ? "Recaudado" : "Proyectado"}:{" "}
            <span className="font-bold">${p.value.toLocaleString("es-CO")}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportesPage() {
  const { ingresos, morosos, loading, error } = useReportes()
  const [exportandoPDF, setExportandoPDF] = useState(false)
  const [exportandoExcel, setExportandoExcel] = useState(false)

  const handleExportPDF = async () => {
    setExportandoPDF(true)
    try {
      await exportarPDF(ingresos, morosos)
    } finally {
      setExportandoPDF(false)
    }
  }

  const handleExportExcel = async () => {
    setExportandoExcel(true)
    try {
      await exportarExcel(ingresos, morosos)
    } finally {
      setExportandoExcel(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500 text-sm">Cargando reportes...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500 text-sm">Error: {error}</div>
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reportes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analíticas y exportación de datos del acueducto.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportPDF}
            disabled={exportandoPDF || ingresos.length === 0}
          >
            {exportandoPDF
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
            disabled={exportandoExcel || ingresos.length === 0}
          >
            {exportandoExcel
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Ingresos vs Proyectado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {ingresos.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-4">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sin datos disponibles
                </span>
              </div>
            ) : (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresos} barCategoryGap="30%" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                    <Legend formatter={(value) => value === "ingreso" ? "Recaudado" : "Proyectado"} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                    <Bar dataKey="proyectado" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ingreso" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Top 5 Morosos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {morosos.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                No hay facturas vencidas
              </div>
            ) : (
              <div className="space-y-3">
                {morosos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-slate-900">{item.nombre}</p>
                      <p className="text-xs text-rose-600">
                        {item.facturas_pendientes}{" "}
                        {item.facturas_pendientes === 1 ? "factura vencida" : "facturas vencidas"}
                      </p>
                    </div>
                    <div className="font-bold text-slate-900">
                      ${item.total_deuda.toLocaleString("es-CO")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}