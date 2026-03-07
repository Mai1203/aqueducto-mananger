"use client";

import { useState, useMemo } from "react";
import { Search, Zap, Filter } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

import { useFacturas } from "@/features/facturacion/hooks";
import { generarFacturacion } from "@/features/facturacion/services";
import Loading from "./loading";

type EstadoFiltro = "all" | "pendiente" | "pagado" | "vencida";

export default function FacturacionPage() {
    const { facturas, loading, reload } = useFacturas();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("all");
    const [generating, setGenerating] = useState(false);

    // Filtrado reactivo
    const facturasFiltradas = useMemo(() => {
        return facturas.filter((inv) => {
            const isOverdue =
                inv.estado === "pendiente" &&
                new Date(inv.fecha_vencimiento) < new Date();

            const estadoReal: EstadoFiltro = inv.estado === "pagado"
                ? "pagado"
                : isOverdue
                    ? "vencida"
                    : "pendiente";

            const matchesSearch =
                inv.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.periodo.includes(searchTerm);

            const matchesEstado =
                estadoFiltro === "all" ? true : estadoReal === estadoFiltro;

            return matchesSearch && matchesEstado;
        });
    }, [facturas, searchTerm, estadoFiltro]);

    const handleGenerarFacturacion = async () => {
        setGenerating(true);
        try {
            const periodo = new Date().toISOString().slice(0, 7);
            await generarFacturacion(periodo);
            await reload();
            toast({
                type: "success",
                title: "Facturación generada",
                description: `Las facturas del período ${periodo} fueron creadas exitosamente.`,
            });
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Error al generar la facturación.";
            // Si ya existen facturas duplicadas, lo informamos sin que sea un error crítico
            if (msg.toLowerCase().includes("duplicate")) {
                toast({
                    type: "warning",
                    title: "Facturas ya generadas",
                    description: "Ya existen facturas para este período. No se crearon duplicados.",
                });
            } else {
                toast({
                    type: "error",
                    title: "Error al generar",
                    description: msg,
                });
            }
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <Loading />;

    const mesActual = new Date().toLocaleString("es-CO", { month: "long" });

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-sky-50 p-6 rounded-2xl border border-sky-100">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-sky-950">
                        Facturación Mensual
                    </h1>
                    <p className="text-sm text-sky-700 mt-1">
                        Revisa y genera las facturas para todos los usuarios activos.
                    </p>
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
                {/* Búsqueda */}
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

                {/* Filtro de estado */}
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

                {/* Contador de resultados */}
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {facturasFiltradas.length} de {facturas.length} facturas
                </span>
            </div>

            {/* Tabla */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
                        {facturasFiltradas.length > 0 ? facturasFiltradas.map((inv) => {
                            const isOverdue =
                                inv.estado === "pendiente" &&
                                new Date(inv.fecha_vencimiento) < new Date();

                            return (
                                <TableRow key={inv.id} className={isOverdue ? "bg-rose-50/30" : ""}>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">
                                            {inv.cliente?.nombre}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            #{inv.id.slice(0, 8).toUpperCase()}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-slate-600">{inv.periodo}</TableCell>

                                    <TableCell className="font-semibold text-slate-900">
                                        ${inv.total.toLocaleString("es-CO")}
                                    </TableCell>

                                    <TableCell className={isOverdue ? "text-rose-600 font-medium" : "text-slate-600"}>
                                        {inv.fecha_vencimiento}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={
                                                inv.estado === "pagado"
                                                    ? "success"
                                                    : isOverdue
                                                        ? "error"
                                                        : "warning"
                                            }
                                        >
                                            {inv.estado === "pagado"
                                                ? "Pagada"
                                                : isOverdue
                                                    ? "Vencida"
                                                    : "Pendiente"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
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
