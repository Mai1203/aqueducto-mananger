"use client"

import { useState, useCallback } from "react"
import { buscarClientes, obtenerDeudaCliente, registrarPago, registrarPagoAdelantado } from "./services"
import { ClienteBusqueda, FacturaPendiente } from "./types"
import { supabase } from "@/lib/supabaseClient"

export function usePagos() {
    const [clientes, setClientes] = useState<ClienteBusqueda[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null)
    const [deuda, setDeuda] = useState(0)
    const [facturas, setFacturas] = useState<FacturaPendiente[]>([])

    const buscar = async (query: string) => {
        if (!query) {
            setClientes([])
            return
        }

        try {
            await supabase.auth.getSession()
            const data = await buscarClientes(query)
            setClientes(data || [])
        } catch (error) {
            console.error("Error buscando clientes:", error)
        }
    }

    const seleccionarCliente = async (cliente: ClienteBusqueda | null) => {
        if (!cliente) {
            setClienteSeleccionado(null)
            setClientes([])
            setFacturas([])
            setDeuda(0)
            return
        }

        setClienteSeleccionado(cliente)
        setClientes([])

        try {
            await supabase.auth.getSession()
            const data = await obtenerDeudaCliente(cliente.id)
            setFacturas(data.facturas || [])
            setDeuda(data.deuda_total || 0)
        } catch (error) {
            console.error("Error seleccionando cliente:", error)
        }
    }

    const pagar = async (
        facturaId: string,
        monto: number,
        metodo: "efectivo" | "transferencia",
        usuarioId: string
    ) => {
        if (!clienteSeleccionado) return

        try {
            await supabase.auth.getSession()
            await registrarPago({
                factura_id: facturaId,
                monto,
                metodo_pago: metodo,
                registrado_por: usuarioId,
            })

            // refrescar deuda
            const data = await obtenerDeudaCliente(clienteSeleccionado.id)
            setFacturas(data.facturas || [])
            setDeuda(data.deuda_total || 0)
        } catch (error) {
            console.error("Error registrando pago:", error)
            throw error
        }
    }

    const pagarAdelantado = async (
        params: { meses?: number; monto?: number },
        metodo: "efectivo" | "transferencia",
        usuarioId: string
    ) => {
        if (!clienteSeleccionado) return

        try {
            await supabase.auth.getSession()
            await registrarPagoAdelantado({
                cliente_id: clienteSeleccionado.id,
                ...params,
                metodo_pago: metodo,
                registrado_por: usuarioId,
            })

            // refrescar deuda
            const data = await obtenerDeudaCliente(clienteSeleccionado.id)
            setFacturas(data.facturas || [])
            setDeuda(data.deuda_total || 0)
        } catch (error) {
            console.error("Error registrando pago adelantado:", error)
            throw error
        }
    }

    return {
        clientes,
        clienteSeleccionado,
        deuda,
        facturas,
        buscar,
        seleccionarCliente,
        pagar,
        pagarAdelantado,
    }
}