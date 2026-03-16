import { useState } from "react"
import { buscarClientes, obtenerDeudaCliente, registrarPago, registrarPagoAdelantado } from "./services"
import { ClienteBusqueda, FacturaPendiente } from "./types"

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

        const data = await buscarClientes(query)

        setClientes(data || [])
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

        const data = await obtenerDeudaCliente(cliente.id)

        setFacturas(data.facturas || [])
        setDeuda(data.deuda_total || 0)
    }


    const pagar = async (
        facturaId: string,
        monto: number,
        metodo: "efectivo" | "transferencia",
        usuarioId: string
    ) => {

        if (!clienteSeleccionado) return

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
    }

    const pagarAdelantado = async (
        params: { meses?: number; monto?: number },
        metodo: "efectivo" | "transferencia",
        usuarioId: string
    ) => {
        if (!clienteSeleccionado) return

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