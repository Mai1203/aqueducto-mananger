"use client"

import { useEffect, useState, useCallback } from "react"
import { getDashboardMetrics, getUltimosPagos, getPagosMensuales } from "./services"
import { DashboardMetrics, UltimoPago } from "./types"
import { useAuth } from "@/features/auth/AuthContext"
import { supabase } from "@/lib/supabaseClient"

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
  const { user, loading: authLoading } = useAuth()

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [pagos, setPagos] = useState<UltimoPago[]>([])
  const [pagosMensuales, setPagosMensuales] = useState<PagosMensuales[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Garantizar que la sesión esté lista y el token refrescado
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

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
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchData()

    // Recuperación al volver a la pestaña
    const handleFocus = () => {
      fetchData()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.id, authLoading, fetchData])

  return { metrics, pagos, pagosMensuales, loading, error, refetch: fetchData }
}