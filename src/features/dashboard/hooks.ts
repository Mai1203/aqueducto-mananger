"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getDashboardMetrics, getUltimosPagos, getPagosMensuales } from "./services"
import { useAuth } from "@/features/auth/AuthContext"

export function useDashboard() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const metricsQuery = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: getDashboardMetrics,
    enabled: !authLoading && !!user?.id,
  })

  const pagosQuery = useQuery({
    queryKey: ["dashboard", "ultimos-pagos"],
    queryFn: getUltimosPagos,
    enabled: !authLoading && !!user?.id,
  })

  const mensualQuery = useQuery({
    queryKey: ["dashboard", "pagos-mensuales"],
    queryFn: getPagosMensuales,
    enabled: !authLoading && !!user?.id,
  })

  const loading =
    authLoading ||
    metricsQuery.isLoading ||
    pagosQuery.isLoading ||
    mensualQuery.isLoading

  const error =
    (metricsQuery.error as Error)?.message ||
    (pagosQuery.error as Error)?.message ||
    (mensualQuery.error as Error)?.message ||
    null

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  const metricsData = metricsQuery.data || { metrics: null, trends: null }

  return {
    metrics: metricsData.metrics,
    trends: metricsData.trends,
    pagos: pagosQuery.data || [],
    pagosMensuales: mensualQuery.data || [],
    loading,
    error,
    refetch,
  }
}