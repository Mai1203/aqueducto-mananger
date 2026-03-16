"use client"

import { useEffect, useState, useCallback } from "react"
import { getIngresosMensuales, getTopMorosos } from "./services"
import { IngresoMensual, ClienteMoroso } from "./types"
import { useAuth } from "@/features/auth/AuthContext"
import { supabase } from "@/lib/supabaseClient"

interface UseReportesReturn {
  ingresos: IngresoMensual[]
  morosos: ClienteMoroso[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useReportes(): UseReportesReturn {
  const { user, loading: authLoading } = useAuth()
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([])
  const [morosos, setMorosos] = useState<ClienteMoroso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }
      const [ingresosData, morososData] = await Promise.all([
        getIngresosMensuales(),
        getTopMorosos(),
      ])
      setIngresos(ingresosData)
      setMorosos(morososData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      setLoading(false)
      return
    }
    fetchData()

    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id, authLoading, fetchData])

  return { ingresos, morosos, loading, error, refetch: fetchData }
}