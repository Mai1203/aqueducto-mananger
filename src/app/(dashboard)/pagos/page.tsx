"use client"

import { useState, useEffect } from "react"
import { Search, UserCircle, CheckCircle2, X, CreditCard, Banknote, Receipt, ChevronRight, CalendarDays, History } from "lucide-react"

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
        pagar,
        pagarAdelantado
    } = usePagos()

    const { user } = useAuth()
    const { toast } = useToast()

    const [query, setQuery] = useState("")
    const [monto, setMonto] = useState(0)
    const [metodo, setMetodo] = useState<"efectivo" | "transferencia">("efectivo")
    const [isAdelantado, setIsAdelantado] = useState(false)
    const [meses, setMeses] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Efecto para calcular monto si es adelantado
    useEffect(() => {
        if (isAdelantado && clienteSeleccionado?.valor_mensual) {
            setMonto(clienteSeleccionado.valor_mensual * meses)
        }
    }, [isAdelantado, meses, clienteSeleccionado])

    // BUG FIX: al seleccionar cliente, limpiar búsqueda para cerrar el dropdown
    const handleSeleccionarCliente = (c: typeof clientes[0]) => {
        seleccionarCliente(c)
        setQuery("")
        buscar("")
        setIsAdelantado(false)
        setMeses(1)
        setMonto(0)
    }

    const handleLimpiarCliente = () => {
        seleccionarCliente(null)
        setQuery("")
        buscar("")
        setMonto(0)
        setIsAdelantado(false)
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
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Deuda Pendiente
                                        </p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            ${deuda.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">
                                            Tarifa Mensual
                                        </p>
                                        <p className="text-2xl font-bold text-emerald-700">
                                            ${(clienteSeleccionado.valor_mensual || 0).toLocaleString()}
                                        </p>
                                    </div>
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
                                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">
                                            ¡Al día! No hay deudas pendientes
                                        </p>
                                    </div>
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
                        <Card className="border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-700">Registrar pago</h3>
                                <div className="flex gap-1 p-1 bg-slate-200/50 rounded-lg">
                                    <button
                                        onClick={() => { setIsAdelantado(false); setMonto(0); }}
                                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${!isAdelantado ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Deuda
                                    </button>
                                    <button
                                        onClick={() => setIsAdelantado(true)}
                                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${isAdelantado ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Adelantado
                                    </button>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <form
                                    className="space-y-4"
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        if (!isAdelantado && (!facturas.length || !monto)) return
                                        if (isAdelantado && !meses) return

                                        setIsSubmitting(true)
                                        try {
                                            if (isAdelantado) {
                                                await pagarAdelantado(meses, metodo, user.id)
                                                toast({
                                                    type: "success",
                                                    title: "Pago por adelantado registrado",
                                                    description: `Se han pagado ${meses} meses por un total de $${monto.toLocaleString()} exitosamente.`
                                                })
                                            } else {
                                                await pagar(facturas[0].id, monto, metodo, user.id)
                                                toast({
                                                    type: "success",
                                                    title: "Pago registrado",
                                                    description: `Se ha registrado el pago de $${monto.toLocaleString()} exitosamente.`
                                                })
                                            }
                                            setMonto(0)
                                            setIsAdelantado(false)
                                            setMeses(1)
                                        } catch (error) {
                                            toast({
                                                type: "error",
                                                title: "Error al registrar pago",
                                                description: error instanceof Error ? error.message : "Ocurrió un error inesperado."
                                            })
                                        } finally {
                                            setIsSubmitting(false)
                                        }
                                    }}
                                >
                                    {/* Opción Adelantado: Selección de Meses */}
                                    {isAdelantado ? (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                                ¿Cuántos meses desea pagar?
                                            </label>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
                                                <select
                                                    value={meses}
                                                    onChange={(e) => setMeses(Number(e.target.value))}
                                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-100 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-emerald-400 bg-emerald-50/30 transition-colors appearance-none"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                        <option key={m} value={m}>{m} {m === 1 ? 'mes' : 'meses'}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <ChevronRight className="w-4 h-4 text-emerald-400 rotate-90" />
                                                </div>
                                            </div>
                                            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                                                <span className="text-xs font-medium text-emerald-700">Total a pagar:</span>
                                                <span className="text-lg font-bold text-emerald-700">${monto.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Monto Manual */
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                                Monto a pagar
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
                                            {monto > 0 && (
                                                <div className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <History className="w-3 h-3" />
                                                    Se aplicará a la factura más antigua.
                                                </div>
                                            )}
                                        </div>
                                    )}

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

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || (!isAdelantado && (!monto || !facturas.length)) || (isAdelantado && !monto)}
                                        className={`w-full h-11 text-sm font-semibold transition-all ${isAdelantado ? 'bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200' : 'bg-slate-900 hover:bg-slate-800'}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                {isAdelantado ? `Pagar ${meses} meses` : 'Confirmar Pago'}
                                            </>
                                        )}
                                    </Button>

                                    {isAdelantado && (
                                        <p className="text-[10px] text-center text-slate-400 italic">
                                            * Se generarán automáticamente las facturas de los próximos periodos.
                                        </p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
