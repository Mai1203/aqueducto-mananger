"use client"

import { useState, useEffect } from "react"
import { Search, UserCircle, CheckCircle2, X, CreditCard, Banknote, Receipt, ChevronRight, CalendarDays, History, MapPin, Layers, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

import { usePagos } from "@/features/pagos/hooks"
import { useAuth } from "@/features/auth/AuthContext"

export default function PagosPage() {

    const {
        clientes,
        clienteSeleccionado,
        matriculaSeleccionada,
        deuda,
        facturas,
        buscar,
        seleccionarCliente,
        seleccionarMatricula,
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
    const [adelantadoType, setAdelantadoType] = useState<"meses" | "monto">("meses")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [montoError, setMontoError] = useState<string | null>(null)

    // Tarifa mensual efectiva de la matrícula seleccionada
    const valorMensual = matriculaSeleccionada?.valor_mensual ?? 0

    // Efecto para calcular monto si es adelantado por meses
    useEffect(() => {
        if (isAdelantado && adelantadoType === "meses" && valorMensual) {
            setMonto(valorMensual * meses)
        }
    }, [isAdelantado, adelantadoType, meses, valorMensual])

    // Selección de cliente
    const handleSeleccionarCliente = (c: typeof clientes[0]) => {
        seleccionarCliente(c)
        setQuery("")
        buscar("")
        setIsAdelantado(false)
        setAdelantadoType("meses")
        setMeses(1)
        setMonto(0)
        setMontoError(null)
    }

    const handleLimpiarCliente = () => {
        seleccionarCliente(null)
        setQuery("")
        buscar("")
        setMonto(0)
        setMontoError(null)
        setIsAdelantado(false)
    }

    const getEstadoBadge = (estado?: "activa" | "suspendida" | "inactiva") => {
        switch (estado) {
            case "activa":
                return (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        Activa
                    </span>
                )
            case "suspendida":
                return (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/50">
                        Suspendida
                    </span>
                )
            case "inactiva":
                return (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200/50">
                        Inactiva
                    </span>
                )
            default:
                return null
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Registrar Pago
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Busca un cliente, elige la matrícula correspondiente y registra el pago.
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

                {/* Dropdown flotante */}
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
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>CC: {c.cedula}</span>
                                        <span>•</span>
                                        <span className="shrink-0 font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                            {c.matriculas.length} {c.matriculas.length === 1 ? "matrícula" : "matrículas"}
                                        </span>
                                    </div>
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
                <div className="space-y-5">

                    {/* ALERTA CLIENTE SIN MATRÍCULAS */}
                    {clienteSeleccionado.matriculas.length === 0 && (
                        <Card className="border-2 border-amber-200 bg-amber-50/50 shadow-sm">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-900">Cliente sin matrículas registradas</h3>
                                    <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                                        El usuario <strong>{clienteSeleccionado.nombre}</strong> no posee matrículas de agua registradas. Para registrar pagos o generar cobros, es necesario asignar al menos una matrícula en el módulo de <strong>Matrículas</strong>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {clienteSeleccionado.matriculas.length > 0 && (
                        <div className="grid md:grid-cols-5 gap-5">

                            {/* Columna izquierda: Info + Selector Matrículas + Facturas */}
                            <div className="md:col-span-3 space-y-4">

                                {/* Info del cliente */}
                                <Card className="border-2 border-emerald-200 shadow-sm">
                                    <CardContent className="p-5 space-y-4">
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
                                                        CC: {clienteSeleccionado.cedula}
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

                                        {/* SELECTOR DE MATRÍCULA SI TIENE MÁS DE 1 */}
                                        {clienteSeleccionado.matriculas.length > 1 && (
                                            <div className="pt-2 border-t border-slate-100 space-y-2">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                                    Selecciona la matrícula a pagar ({clienteSeleccionado.matriculas.length}):
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {clienteSeleccionado.matriculas.map((mat) => {
                                                        const isSelected = matriculaSeleccionada?.id === mat.id
                                                        return (
                                                            <button
                                                                key={mat.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    seleccionarMatricula(mat)
                                                                    setMonto(0)
                                                                }}
                                                                className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                                                                    isSelected
                                                                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400"
                                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="font-bold text-slate-900 text-sm font-mono">
                                                                        #{mat.numero_matricula}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        {getEstadoBadge(mat.estado)}
                                                                        {isSelected && (
                                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                                                Seleccionada
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {mat.direccion_lote && (
                                                                    <p className="text-xs text-slate-500 truncate mt-1">
                                                                        {mat.direccion_lote}
                                                                    </p>
                                                                )}
                                                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                                                    <span className="text-slate-400">{mat.nombre_categoria || "Tarifa base"}</span>
                                                                    <span className="font-semibold text-slate-700">${mat.valor_mensual.toLocaleString()}/mes</span>
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* SI SOLO TIENE 1 MATRÍCULA */}
                                        {clienteSeleccionado.matriculas.length === 1 && (
                                            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/70 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <div className="truncate">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-emerald-950 font-mono">
                                                                Matrícula #{matriculaSeleccionada?.numero_matricula}
                                                            </p>
                                                            {getEstadoBadge(matriculaSeleccionada?.estado)}
                                                        </div>
                                                        {matriculaSeleccionada?.direccion_lote && (
                                                            <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                                                                {matriculaSeleccionada.direccion_lote}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg shrink-0">
                                                    Tarifa: ${valorMensual.toLocaleString()}/mes
                                                </span>
                                            </div>
                                        )}

                                        {/* ALERTA DE ESTADO SI LA MATRÍCULA SELECCIONADA NO ESTÁ ACTIVA */}
                                        {matriculaSeleccionada?.estado === "inactiva" && (
                                            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-900 text-xs font-medium">
                                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                                <div>
                                                    <strong>Atención:</strong> Esta matrícula está marcada como <strong className="uppercase font-bold text-rose-700">Inactiva</strong>.
                                                </div>
                                            </div>
                                        )}
                                        {matriculaSeleccionada?.estado === "suspendida" && (
                                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs font-medium">
                                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                <div>
                                                    <strong>Atención:</strong> Esta matrícula se encuentra actualmente <strong className="uppercase font-bold text-amber-700">Suspendida</strong>.
                                                </div>
                                            </div>
                                        )}

                                        {/* Deuda total destacada de la matrícula seleccionada */}
                                        <div className="grid grid-cols-2 gap-3 pt-1">
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
                                                    ${valorMensual.toLocaleString()}
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
                                            Facturas pendientes {matriculaSeleccionada?.numero_matricula ? `(#${matriculaSeleccionada.numero_matricula})` : ""}
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
                                                    ¡Al día! No hay deudas pendientes en esta matrícula.
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

                                                // Validaciones de monto
                                                if (!isAdelantado || (isAdelantado && adelantadoType === "monto")) {
                                                    if (!monto || monto <= 0) return
                                                    if (monto % 1000 !== 0) {
                                                        setMontoError("El monto debe ser un valor en miles (múltiplos de 1.000).")
                                                        return
                                                    }
                                                }

                                                if (!isAdelantado && (!facturas.length || !monto)) return
                                                if (isAdelantado && adelantadoType === "meses" && !meses) return
                                                if (isAdelantado && adelantadoType === "monto" && !monto) return

                                                setIsSubmitting(true)
                                                try {
                                                    const matDesc = matriculaSeleccionada?.numero_matricula
                                                        ? ` (Matrícula #${matriculaSeleccionada.numero_matricula})`
                                                        : ""

                                                    if (isAdelantado) {
                                                        const params = adelantadoType === "meses" ? { meses } : { monto }
                                                        await pagarAdelantado(params, metodo, user.id)
                                                        toast({
                                                            type: "success",
                                                            title: "Pago por adelantado registrado",
                                                            description: adelantadoType === "meses"
                                                                ? `Se han pagado ${meses} meses exitosamente${matDesc}.`
                                                                : `Se ha registrado el pago de $${monto.toLocaleString()} exitosamente${matDesc}.`
                                                        })
                                                    } else {
                                                        await pagarAdelantado({ monto }, metodo, user.id)
                                                        toast({
                                                            type: "success",
                                                            title: "Pago registrado",
                                                            description: `Se ha registrado el pago de $${monto.toLocaleString()} exitosamente${matDesc}.`
                                                        })
                                                    }
                                                    setMonto(0)
                                                    setIsAdelantado(false)
                                                    setMeses(1)
                                                    setAdelantadoType("meses")
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
                                            {/* Opción Adelantado: Selección de Tipo */}
                                            {isAdelantado && (
                                                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setAdelantadoType("meses"); setMonto(0); }}
                                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${adelantadoType === "meses" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                                    >
                                                        Por meses
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setAdelantadoType("monto"); setMonto(0); }}
                                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${adelantadoType === "monto" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                                    >
                                                        Por valor
                                                    </button>
                                                </div>
                                            )}

                                            {/* Opción Adelantado: Selección de Meses */}
                                            {isAdelantado && adelantadoType === "meses" && (
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
                                            )}

                                            {/* Monto Manual (Deuda o Adelantado por valor) */}
                                            {(!isAdelantado || (isAdelantado && adelantadoType === "monto")) && (
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
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value)
                                                                setMonto(val)
                                                                if (val % 1000 !== 0) {
                                                                    setMontoError("El monto debe ser en pesos colombianos.")
                                                                } else {
                                                                    setMontoError(null)
                                                                }
                                                            }}
                                                            className={`w-full pl-7 pr-4 py-2.5 border-2 rounded-lg text-slate-900 font-semibold focus:outline-none transition-colors ${
                                                                montoError
                                                                    ? "border-rose-400 focus:border-rose-500 bg-rose-50/30"
                                                                    : isAdelantado
                                                                        ? "border-emerald-100 focus:border-emerald-400"
                                                                        : "border-slate-200 focus:border-emerald-400"
                                                            }`}
                                                        />
                                                    </div>
                                                    {montoError ? (
                                                        <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3 shrink-0" />
                                                            {montoError}
                                                        </p>
                                                    ) : (
                                                        <div className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                            <History className="w-3 h-3" />
                                                            Solo valores en pesos colombianos · Se pagarán primero las facturas pendientes.
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
                                                disabled={
                                                    isSubmitting ||
                                                    !!montoError ||
                                                    (!isAdelantado && (!monto || !facturas.length)) ||
                                                    (isAdelantado && adelantadoType === "monto" && !monto) ||
                                                    (isAdelantado && adelantadoType === "meses" && !meses)
                                                }
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
                                                        {isAdelantado ? (adelantadoType === "meses" ? `Pagar ${meses} meses` : 'Confirmar Pago') : 'Confirmar Pago'}
                                                    </>
                                                )}
                                            </Button>

                                            {isAdelantado && (
                                                <p className="text-[10px] text-center text-slate-400 italic">
                                                    * Se generarán automáticamente las facturas de los próximos periodos para la matrícula.
                                                </p>
                                            )}
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

