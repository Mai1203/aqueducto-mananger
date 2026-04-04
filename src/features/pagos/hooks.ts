"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { buscarClientes, obtenerDeudaCliente, registrarPago, registrarPagoAdelantado } from "./services"
import { ClienteBusqueda } from "./types"

export function usePagos() {
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState("")
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null)

    // Búsqueda de clientes con TanStack Query
    const { data: searchResults = [] } = useQuery({
        queryKey: ["clientes", "search", searchQuery],
        queryFn: () => buscarClientes(searchQuery),
        enabled: searchQuery.length > 0,
    })

    // Obtener deuda del cliente seleccionado
    const { data: deudaData } = useQuery({
        queryKey: ["clientes", "deuda", clienteSeleccionado?.id],
        queryFn: () => obtenerDeudaCliente(clienteSeleccionado!.id),
        enabled: !!clienteSeleccionado?.id,
    })

    // Mutación para pago simple
    const pagarMutation = useMutation({
        mutationFn: registrarPago,
        onSuccess: () => {
            if (clienteSeleccionado) {
                queryClient.invalidateQueries({ queryKey: ["clientes", "deuda", clienteSeleccionado.id] })
            }
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })

    // Mutación para pago adelantado
    const pagarAdelantadoMutation = useMutation({
        mutationFn: registrarPagoAdelantado,
        onSuccess: () => {
            if (clienteSeleccionado) {
                queryClient.invalidateQueries({ queryKey: ["clientes", "deuda", clienteSeleccionado.id] })
            }
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })

    const buscar = useCallback(async (query: string) => {
        setSearchQuery(query)
    }, [])

    const seleccionarCliente = useCallback((cliente: ClienteBusqueda | null) => {
        setClienteSeleccionado(cliente)
        setSearchQuery("") // Limpiar búsqueda tras seleccionar
    }, [])

    const pagar = async (
        facturaId: string,
        monto: number,
        metodo: "efectivo" | "transferencia",
        usuarioId: string
    ) => {
        await pagarMutation.mutateAsync({
            factura_id: facturaId,
            monto,
            metodo_pago: metodo,
            registrado_por: usuarioId,
        })
    }

    const pagarAdelantado = async (
        params: { meses?: number; monto?: number },
        metodo: "efectivo" | "transferencia",
        usuarioId: string
    ) => {
        if (!clienteSeleccionado) return
        await pagarAdelantadoMutation.mutateAsync({
            cliente_id: clienteSeleccionado.id,
            ...params,
            metodo_pago: metodo,
            registrado_por: usuarioId,
        })
    }

    return {
        clientes: searchResults,
        clienteSeleccionado,
        deuda: deudaData?.deuda_total || 0,
        facturas: deudaData?.facturas || [],
        buscar,
        seleccionarCliente,
        pagar,
        pagarAdelantado,
        loading: pagarMutation.isPending || pagarAdelantadoMutation.isPending
    }
}