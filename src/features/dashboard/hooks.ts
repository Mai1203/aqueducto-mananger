"use client"

import { useEffect, useState } from "react"
import { getDashboardMetrics, getUltimosPagos } from "./services"
import { DashboardMetrics, UltimoPago } from "./types"

interface UseDashboardReturn {
  metrics: DashboardMetrics | null
  pagos: UltimoPago[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): UseDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [pagos, setPagos] = useState<UltimoPago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [metricsData, pagosData] = await Promise.all([
        getDashboardMetrics(),
        getUltimosPagos(),
      ])
      setMetrics(metricsData)
      setPagos(pagosData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { metrics, pagos, loading, error, refetch: fetchData }
}