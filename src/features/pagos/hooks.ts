"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { buscarClientes, obtenerDeudaMatricula, registrarPago, registrarPagoAdelantado } from "./services"
import { ClienteBusqueda, MatriculaCliente } from "./types"

export function usePagos() {
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState("")
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null)
    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState<MatriculaCliente | null>(null)

    // Búsqueda de clientes con TanStack Query
    const { data: searchResults = [] } = useQuery({
        queryKey: ["clientes", "search", searchQuery],
        queryFn: () => buscarClientes(searchQuery),
        enabled: searchQuery.length > 0,
    })

    // Obtener deuda de la matrícula seleccionada
    const { data: deudaData } = useQuery({
        queryKey: ["deuda", matriculaSeleccionada?.id],
        queryFn: () => obtenerDeudaMatricula(matriculaSeleccionada?.id),
        enabled: !!matriculaSeleccionada?.id,
    })

    // Mutación para pago simple
    const pagarMutation = useMutation({
        mutationFn: registrarPago,
        onSuccess: () => {
            if (matriculaSeleccionada) {
                queryClient.invalidateQueries({ queryKey: ["deuda", matriculaSeleccionada.id] })
            }
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })

    // Mutación para pago adelantado
    const pagarAdelantadoMutation = useMutation({
        mutationFn: registrarPagoAdelantado,
        onSuccess: () => {
            if (matriculaSeleccionada) {
                queryClient.invalidateQueries({ queryKey: ["deuda", matriculaSeleccionada.id] })
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
        if (cliente && cliente.matriculas && cliente.matriculas.length > 0) {
            setMatriculaSeleccionada(cliente.matriculas[0])
        } else {
            setMatriculaSeleccionada(null)
        }
    }, [])

    const seleccionarMatricula = useCallback((matricula: MatriculaCliente | null) => {
        setMatriculaSeleccionada(matricula)
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
            matricula_id: matriculaSeleccionada?.id,
            ...params,
            metodo_pago: metodo,
            registrado_por: usuarioId,
        })
    }

    return {
        clientes: searchResults,
        clienteSeleccionado,
        matriculaSeleccionada,
        deuda: deudaData?.deuda_total || 0,
        facturas: deudaData?.facturas || [],
        buscar,
        seleccionarCliente,
        seleccionarMatricula,
        pagar,
        pagarAdelantado,
        loading: pagarMutation.isPending || pagarAdelantadoMutation.isPending
    }
}