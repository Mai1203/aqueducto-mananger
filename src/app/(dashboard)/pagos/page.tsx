"use client"

import { useState } from "react"
import { Search, UserCircle, CheckCircle2, X, CreditCard, Banknote, Receipt, ChevronRight, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

import { usePagos } from "@/features/pagos/hooks"
import { useAuth } from "@/features/auth/AuthContext"

export default function PagosPage() {

    const {
        clientes,
        clienteSeleccionado,
        deuda,
        facturas,
        buscar,
        seleccionarCliente,
        pagar
    } = usePagos()

    const { user } = useAuth()
    const { toast } = useToast()

    const [query, setQuery] = useState("")
    const [monto, setMonto] = useState(0)
    const [metodo, setMetodo] = useState<"efectivo" | "transferencia">("efectivo")

    // BUG FIX: al seleccionar cliente, limpiar búsqueda para cerrar el dropdown
    const handleSeleccionarCliente = (c: typeof clientes[0]) => {
        seleccionarCliente(c)
        setQuery("")
        buscar("")
    }

    const handleLimpiarCliente = () => {
        seleccionarCliente(null)
        setQuery("")
        buscar("")
        setMonto(0)
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Registrar Pago
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Busca un cliente para ver su deuda y registrar un nuevo pago.
                </p>
            </div>

            {/* BUSCADOR */}
            <div className="relative">
                <div className={`flex items-center gap-3 px-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all duration-200 ${query ? "border-emerald-400 shadow-emerald-100" : "border-slate-200 hover:border-slate-300"}`}>
                    <Search className="h-5 w-5 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre o documento..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            buscar(e.target.value)
                        }}
                        className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={handleLimpiarCliente}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Dropdown flotante — no desplaza el contenido */}
                {clientes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        {clientes.map((c, i) => (
                            <button
                                key={c.id}
                                onClick={() => handleSeleccionarCliente(c)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors group ${i !== 0 ? "border-t border-slate-100" : ""}`}
                            >
                                <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                                    <UserCircle className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{c.nombre}</p>
                                    <p className="text-xs text-slate-500">CC: {c.cedula} • {c.direccion}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* EMPTY STATE */}
            {!clienteSeleccionado && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <UserCircle className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700">
                        Ningún cliente seleccionado
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">
                        Usa la barra de búsqueda para encontrar y seleccionar un cliente.
                    </p>
                </div>
            )}

            {/* CLIENTE SELECCIONADO */}
            {clienteSeleccionado && (
                <div className="grid md:grid-cols-5 gap-5">

                    {/* Columna izquierda: Info + Facturas */}
                    <div className="md:col-span-3 space-y-4">

                        {/* Info del cliente */}
                        <Card className="border-2 border-emerald-200 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                            <UserCircle className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-slate-900 leading-tight">
                                                {clienteSeleccionado.nombre}
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                CC: {clienteSeleccionado.cedula} • {clienteSeleccionado.direccion}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLimpiarCliente}
                                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
                                        title="Cambiar cliente"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Deuda total destacada */}
                                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                        Deuda Total
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        ${deuda.toLocaleString()}
                                        <span className="text-base font-normal text-slate-400 ml-1">COP</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Facturas pendientes */}
                        <Card className="border border-slate-200 shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-slate-400" />
                                <h3 className="text-sm font-semibold text-slate-700">
                                    Facturas pendientes
                                </h3>
                                <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                                    {facturas.length}
                                </span>
                            </div>
                            <CardContent className="p-0">
                                {facturas.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-8">
                                        Sin facturas pendientes
                                    </p>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {facturas.map((f) => (
                                            <div key={f.id} className="flex items-center justify-between px-5 py-3.5">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {f.periodo}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Vence {f.fecha_vencimiento}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        ${(f.saldo_pendiente ?? 0).toLocaleString()}
                                                    </p>
                                                    <span className="text-xs text-amber-500 font-medium">Pendiente</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna derecha: Formulario de pago */}
                    <div className="md:col-span-2">
                        <Card className="border border-slate-200 shadow-sm sticky top-6">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-700">Registrar pago</h3>
                            </div>
                            <CardContent className="p-5">
                                <form
                                    className="space-y-4"
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        if (!facturas.length || !monto) return

                                        try {
                                            await pagar(facturas[0].id, monto, metodo, user.id)
                                            toast({
                                                type: "success",
                                                title: "Pago registrado",
                                                description: `Se ha registrado el pago de $${monto.toLocaleString()} exitosamente.`
                                            })
                                            setMonto(0)
                                        } catch (error) {
                                            toast({
                                                type: "error",
                                                title: "Error al pagar",
                                                description: error instanceof Error ? error.message : "No se pudo registrar el pago."
                                            })
                                        }
                                    }}
                                >
                                    {/* Monto */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                            Monto
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                                            <input
                                                type="number"
                                                value={monto || ""}
                                                placeholder="0"
                                                onChange={(e) => setMonto(Number(e.target.value))}
                                                className="w-full pl-7 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-emerald-400 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Método — toggle visual */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                            Método de pago
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(["efectivo", "transferencia"] as const).map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setMetodo(m)}
                                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${metodo === m
                                                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                                        }`}
                                                >
                                                    {m === "efectivo"
                                                        ? <Banknote className="w-4 h-4" />
                                                        : <CreditCard className="w-4 h-4" />
                                                    }
                                                    {m === "efectivo" ? "Efectivo" : "Transferencia"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resumen rápido */}
                                    {monto > 0 && (
                                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm text-emerald-700">
                                            <p className="font-medium">
                                                Pago de <span className="font-bold">${monto.toLocaleString()}</span> por {metodo}
                                            </p>
                                            {deuda - monto > 0 && (
                                                <p className="text-xs text-emerald-500 mt-0.5">
                                                    Saldo restante: ${(deuda - monto).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={!monto || !facturas.length}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 h-11 text-sm font-semibold"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Confirmar Pago
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}