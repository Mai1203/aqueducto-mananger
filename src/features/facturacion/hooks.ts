"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFacturas, generarFacturacion } from "./services"
import { useAuth } from "@/features/auth/AuthContext"

export function useFacturas() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: facturas = [], isLoading } = useQuery({
    queryKey: ["facturas"],
    queryFn: getFacturas,
    enabled: !authLoading && !!user?.id,
  })

  const generateMutation = useMutation({
    mutationFn: generarFacturacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas"] })
      // También invalidamos dashboard por si cambiaron los totales
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })

  return {
    facturas,
    loading: isLoading || authLoading || generateMutation.isPending,
    reload: () => queryClient.invalidateQueries({ queryKey: ["facturas"] }),
    generar: generateMutation.mutateAsync,
  }
}