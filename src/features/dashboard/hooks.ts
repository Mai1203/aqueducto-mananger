"use client"

import { useEffect, useState } from "react"
import { getDashboardMetrics, getUltimosPagos, getPagosMensuales } from "./services"
import { DashboardMetrics, UltimoPago } from "./types"

interface PagosMensuales {
  mes: string
  total: number
}

interface UseDashboardReturn {
  metrics: DashboardMetrics | null
  pagos: UltimoPago[]
  pagosMensuales: PagosMensuales[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): UseDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [pagos, setPagos] = useState<UltimoPago[]>([])
  const [pagosMensuales, setPagosMensuales] = useState<PagosMensuales[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [metricsData, pagosData, pagosMensualesData] = await Promise.all([
        getDashboardMetrics(),
        getUltimosPagos(),
        getPagosMensuales(),
      ])
      setMetrics(metricsData)
      setPagos(pagosData)
      setPagosMensuales(pagosMensualesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { metrics, pagos, pagosMensuales, loading, error, refetch: fetchData }
}