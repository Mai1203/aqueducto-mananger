"use client";

import { useState, useMemo } from "react";
import { Search, Zap, Filter } from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useFacturas } from "@/features/facturacion/hooks";
import { generarFacturacion } from "@/features/facturacion/services";
import Loading from "./loading";

type EstadoFactura = "pendiente" | "pagado" | "vencida";
type EstadoFiltro = "all" | EstadoFactura;

// Helper: calcula el estado real de una factura
function getEstadoReal(inv: { estado: string; fecha_vencimiento: string }): EstadoFactura {
    if (inv.estado === "pagado") return "pagado";
    if (new Date(inv.fecha_vencimiento) < new Date()) return "vencida";
    return "pendiente";
}

export default function FacturacionPage() {
    const { facturas, loading, reload } = useFacturas();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("all");
    const [generating, setGenerating] = useState(false);

    const facturasFiltradas = useMemo(() => {
        return facturas.filter((inv) => {
            const estadoReal = getEstadoReal(inv);
            const matchesSearch =
                inv.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.periodo.includes(searchTerm);
            const matchesEstado = estadoFiltro === "all" ? true : estadoReal === estadoFiltro;
            return matchesSearch && matchesEstado;
        });
    }, [facturas, searchTerm, estadoFiltro]);

    const handleGenerarFacturacion = async () => {
        setGenerating(true);
        try {
            const periodo = new Date().toISOString().slice(0, 7);
            await generarFacturacion(periodo);
            await reload();
            toast({ type: "success", title: "Facturación generada", description: `Facturas del período ${periodo} creadas exitosamente.` });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al generar la facturación.";
            if (msg.toLowerCase().includes("duplicate")) {
                toast({ type: "warning", title: "Facturas ya generadas", description: "Ya existen facturas para este período." });
            } else {
                toast({ type: "error", title: "Error al generar", description: msg });
            }
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <Loading />;

    const mesActual = new Date().toLocaleString("es-CO", { month: "long" });

    // Variantes de estilo por estado
    const estadoStyles = {
        pagado:    { franja: "bg-emerald-500",  card: "",                              monto: "text-slate-900" },
        pendiente: { franja: "bg-amber-400",    card: "",                              monto: "text-slate-900" },
        vencida:   { franja: "bg-red-500",      card: "bg-rose-50/60 border-rose-200", monto: "text-red-700"   },
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-sky-50 p-6 rounded-2xl border border-sky-100">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-sky-950">Facturación Mensual</h1>
                    <p className="text-sm text-sky-700 mt-1">Revisa y genera las facturas para todos los usuarios activos.</p>
                </div>
                <Button
                    onClick={handleGenerarFacturacion}
                    disabled={generating}
                    className="shrink-0 flex items-center gap-2 shadow-sm font-semibold h-11 px-6"
                >
                    <Zap className={`w-5 h-5 fill-current ${generating ? "animate-pulse" : ""}`} />
                    {generating ? "Generando..." : `Generar Facturación (${mesActual})`}
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, N° factura o período..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[160px]"
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value as EstadoFiltro)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="pagado">Pagadas</option>
                        <option value="vencida">Vencidas</option>
                    </select>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {facturasFiltradas.length} de {facturas.length} facturas
                </span>
            </div>

            {/* ── MOBILE: Cards (solo visible en < md) ── */}
            <div className="md:hidden space-y-3">
                {facturasFiltradas.length > 0 ? (
                    facturasFiltradas.map((inv) => {
                        const estadoReal = getEstadoReal(inv);
                        const styles = estadoStyles[estadoReal];

                        return (
                            <div
                                key={inv.id}
                                className={`border rounded-xl overflow-hidden shadow-sm ${styles.card || "bg-white border-slate-200"}`}
                            >
                                {/* Franja de color según estado */}
                                <div className={`h-1 w-full ${styles.franja}`} />

                                <div className="p-4 flex flex-col gap-3">
                                    {/* Cliente + badge */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm leading-snug">
                                                {inv.cliente?.nombre}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                #{inv.id.slice(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            estadoReal === "pagado" ? "success" :
                                            estadoReal === "vencida" ? "error" : "warning"
                                        }>
                                            {estadoReal === "pagado" ? "Pagada" :
                                             estadoReal === "vencida" ? "Vencida" : "Pendiente"}
                                        </Badge>
                                    </div>

                                    {/* Monto destacado */}
                                    <div className={`flex items-center justify-between rounded-lg px-3 py-2.5
                                        ${estadoReal === "vencida" ? "bg-red-50" : "bg-slate-50"}`}>
                                        <span className={`text-xs font-medium uppercase tracking-wide
                                            ${estadoReal === "vencida" ? "text-red-400" : "text-slate-400"}`}>
                                            Total
                                        </span>
                                        <span className={`text-xl font-semibold ${styles.monto}`}>
                                            ${inv.total.toLocaleString("es-CO")}
                                        </span>
                                    </div>

                                    {/* Período y vencimiento */}
                                    <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Período</span>
                                            <span className="text-slate-700 font-medium">{inv.periodo}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">
                                                {estadoReal === "vencida" ? "Venció" : "Vence"}
                                            </span>
                                            <span className={`font-medium ${estadoReal === "vencida" ? "text-red-600" : "text-slate-700"}`}>
                                                {inv.fecha_vencimiento}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-slate-400 text-sm bg-white border border-slate-200 rounded-xl">
                        No se encontraron facturas con los filtros aplicados.
                    </div>
                )}
            </div>

            {/* ── DESKTOP: Tabla (oculta en < md) ── */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Factura / Cliente</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Vencimiento</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {facturasFiltradas.length > 0 ? (
                            facturasFiltradas.map((inv) => {
                                const estadoReal = getEstadoReal(inv);
                                return (
                                    <TableRow key={inv.id} className={estadoReal === "vencida" ? "bg-rose-50/30" : ""}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{inv.cliente?.nombre}</div>
                                            <div className="text-xs text-slate-400 font-mono">#{inv.id.slice(0, 8).toUpperCase()}</div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{inv.periodo}</TableCell>
                                        <TableCell className="font-semibold text-slate-900">
                                            ${inv.total.toLocaleString("es-CO")}
                                        </TableCell>
                                        <TableCell className={estadoReal === "vencida" ? "text-rose-600 font-medium" : "text-slate-600"}>
                                            {inv.fecha_vencimiento}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                estadoReal === "pagado" ? "success" :
                                                estadoReal === "vencida" ? "error" : "warning"
                                            }>
                                                {estadoReal === "pagado" ? "Pagada" :
                                                 estadoReal === "vencida" ? "Vencida" : "Pendiente"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                                    No se encontraron facturas con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}