"use client"

import { useEffect, useState } from "react"
import { getIngresosMensuales, getTopMorosos } from "./services"
import { IngresoMensual, ClienteMoroso } from "./types"

interface UseReportesReturn {
  ingresos: IngresoMensual[]
  morosos: ClienteMoroso[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useReportes(): UseReportesReturn {
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([])
  const [morosos, setMorosos] = useState<ClienteMoroso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
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
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { ingresos, morosos, loading, error, refetch: fetchData }
}