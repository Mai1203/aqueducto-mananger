"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getIngresosMensuales, getTopMorosos } from "./services"
import { useAuth } from "@/features/auth/AuthContext"

export function useReportes() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const ingresosQuery = useQuery({
    queryKey: ["reportes", "ingresos-mensuales"],
    queryFn: getIngresosMensuales,
    enabled: !authLoading && !!user?.id,
  })

  const morososQuery = useQuery({
    queryKey: ["reportes", "top-morosos"],
    queryFn: getTopMorosos,
    enabled: !authLoading && !!user?.id,
  })

  const loading =
    authLoading ||
    ingresosQuery.isLoading ||
    morososQuery.isLoading

  const error =
    (ingresosQuery.error as Error)?.message ||
    (morososQuery.error as Error)?.message ||
    null

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["reportes"] })
  }

  return {
    ingresos: ingresosQuery.data || [],
    morosos: morososQuery.data || [],
    loading,
    error,
    refetch,
  }
}