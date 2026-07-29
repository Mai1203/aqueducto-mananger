"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, AlertTriangle, MapPin, Settings, BadgeDollarSign } from "lucide-react";
import { useToast } from "@/components/ui/toast";

import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

import { useMatriculas } from "@/features/matriculas/hooks";
import { Matricula } from "@/features/matriculas/types";
import { generateNextNumeroMatricula } from "@/features/matriculas/utils";
import { useUsuarios } from "@/features/usuarios/hooks";
import { useCategories } from "@/features/categorias/hooks";
import { useConfiguracionFacturacion } from "@/features/configuracion_facturacion/hooks";
import Loading from "./loading";

export default function MatriculasPage() {
    const { matriculas, loading: loadingMatriculas, add, update, remove } = useMatriculas();
    const { usuarios, loading: loadingUsuarios } = useUsuarios();
    const { categories, loading: loadingCategories } = useCategories();
    const { config, loading: loadingConfig, update: updateConfig } = useConfiguracionFacturacion();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
    const [currentMatricula, setCurrentMatricula] = useState<Partial<Matricula>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configValues, setConfigValues] = useState({
        valor_matricula: 0,
        dias_vencimiento_matricula: 8,
    });
    const [configError, setConfigError] = useState<string | null>(null);

    const loading = loadingMatriculas || loadingUsuarios || loadingCategories;

    const activeCategories = useMemo(() => {
        return categories.filter((c) => c.activa);
    }, [categories]);

    const sortedUsuarios = useMemo(() => {
        return [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [usuarios]);

    const filteredMatriculas = useMemo(() => {
        return matriculas.filter((mat) => {
            const clienteNombre = mat.cliente?.nombre || "";
            const matchesSearch =
                mat.numero_matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clienteNombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "all" ? true : mat.estado === statusFilter;
            const matchesCategory =
                categoryFilter === "all" ? true : mat.categoria_id === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [matriculas, searchTerm, statusFilter, categoryFilter]);

    if (loading) return <Loading />;

    const getCategoryName = (categoria_id?: string | null) => {
        if (!categoria_id) return "Sin categoría";
        const category = categories.find((c) => c.id === categoria_id);
        return category?.nombre_categoria || "Sin categoría";
    };

    const getClientNameAndCedula = (cliente_id: string) => {
        const client = usuarios.find((u) => u.id === cliente_id);
        return client ? `${client.nombre} (CC: ${client.cedula})` : "Desconocido";
    };

    const openModal = (mode: "create" | "edit" | "delete", matricula?: Matricula) => {
        setModalMode(mode);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const localToday = `${yyyy}-${mm}-${dd}`;

        setCurrentMatricula(
            matricula ?? {
                numero_matricula: "",
                cliente_id: "",
                categoria_id: "",
                direccion_lote: "",
                fecha_registro: localToday,
                estado: "activa",
                observaciones: ""
            }
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentMatricula({});
        setFormError(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!currentMatricula.cliente_id) {
            setFormError("Debe seleccionar un cliente.");
            return;
        }
        if (!currentMatricula.categoria_id) {
            setFormError("Debe seleccionar una categoría.");
            return;
        }

        try {
            if (modalMode === "create") {
                await add({
                    numero_matricula: currentMatricula.numero_matricula!,
                    cliente_id: currentMatricula.cliente_id!,
                    categoria_id: currentMatricula.categoria_id!,
                    estado: currentMatricula.estado ?? "activa",
                    direccion_lote: currentMatricula.direccion_lote || null,
                    fecha_registro: currentMatricula.fecha_registro || null,
                    observaciones: currentMatricula.observaciones || null,
                });
                toast({ type: "success", title: "Matrícula creada", description: `Matrícula #${currentMatricula.numero_matricula} fue registrada exitosamente.` });
            } else if (modalMode === "edit" && currentMatricula.id) {
                await update(currentMatricula.id, {
                    numero_matricula: currentMatricula.numero_matricula,
                    cliente_id: currentMatricula.cliente_id,
                    categoria_id: currentMatricula.categoria_id,
                    estado: currentMatricula.estado,
                    direccion_lote: currentMatricula.direccion_lote || null,
                    fecha_registro: currentMatricula.fecha_registro || null,
                    observaciones: currentMatricula.observaciones || null,
                });
                toast({ type: "success", title: "Matrícula actualizada", description: "Los cambios fueron guardados." });
            }
            closeModal();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
            setFormError(msg);
            toast({ type: "error", title: "Error al guardar", description: msg });
        }
    };

    const handleDelete = async () => {
        try {
            if (currentMatricula.id) await remove(currentMatricula.id);
            toast({ type: "success", title: "Matrícula eliminada", description: `Matrícula #${currentMatricula.numero_matricula} fue eliminada.` });
            closeModal();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al eliminar la matrícula.";
            toast({ type: "error", title: "Error al eliminar", description: msg });
            closeModal();
        }
    };

    const openConfigModal = () => {
        if (config) {
            setConfigValues({
                valor_matricula: config.valor_matricula,
                dias_vencimiento_matricula: config.dias_vencimiento_matricula,
            });
        }
        setConfigError(null);
        setIsConfigModalOpen(true);
    };

    const closeConfigModal = () => {
        setIsConfigModalOpen(false);
        setConfigError(null);
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setConfigError(null);

        if (configValues.valor_matricula <= 0) {
            setConfigError("El valor de matrícula debe ser mayor a 0.");
            return;
        }
        if (configValues.valor_matricula % 1000 !== 0) {
            setConfigError("El valor de matrícula debe ser en pesos Colombianos sin decimales (Múltiplo de 1000).");
            return;
        }

        try {
            await updateConfig({
                valor_matricula: configValues.valor_matricula,
                dias_vencimiento_matricula: configValues.dias_vencimiento_matricula,
            });
            toast({ type: "success", title: "Configuración guardada", description: "Los cambios fueron guardados exitosamente." });
            closeConfigModal();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
            setConfigError(msg);
            toast({ type: "error", title: "Error al guardar", description: msg });
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        
        // Si es una fecha sin hora (YYYY-MM-DD), la interpretamos en la zona horaria local para evitar corrimientos por desfase UTC
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split("-").map(Number);
            return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }

        return new Date(dateStr).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getStatusVariant = (estado: string) => {
        switch (estado) {
            case "activa":
                return "success";
            case "suspendida":
                return "warning";
            case "inactiva":
                return "secondary";
            default:
                return "secondary";
        }
    };

    const getStatusLabel = (estado: string) => {
        switch (estado) {
            case "activa":
                return "Activa";
            case "suspendida":
                return "Suspendida";
            case "inactiva":
                return "Inactiva";
            default:
                return estado;
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Matrículas</h1>
                    <p className="text-sm text-slate-500 mt-1">Gestiona las conexiones y suscripciones del acueducto.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button onClick={() => openModal("create")} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Matrícula
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={openConfigModal}
                        className="flex items-center gap-2"
                    >
                        <BadgeDollarSign className="w-4 h-4" />
                        Valor Matricula
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número o cliente..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[150px]"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre_categoria}
                            </option>
                        ))}
                    </select>
                    <select
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="activa">Activas</option>
                        <option value="suspendida">Suspendidas</option>
                        <option value="inactiva">Inactivas</option>
                    </select>
                </div>
            </div>

            {/* ── MOBILE: Cards (solo visible en < md) ── */}
            <div className="md:hidden space-y-3">
                {filteredMatriculas.length > 0 ? (
                    filteredMatriculas.map((mat) => (
                        <div
                            key={mat.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3"
                        >
                            {/* Fila superior: número de matrícula + estado */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-slate-900 text-sm">#{mat.numero_matricula}</p>
                                        <p className="text-[10px] text-slate-400">{formatDate(mat.fecha_registro || mat.created_at)}</p>
                                    </div>
                                </div>
                                <Badge variant={getStatusVariant(mat.estado)}>
                                    {getStatusLabel(mat.estado)}
                                </Badge>
                            </div>

                            {/* Fila de detalles: Cliente y Dirección */}
                            <div className="border-t border-slate-100 pt-3 space-y-2">
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Usuario</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{mat.cliente?.nombre || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Dirección / Lote</p>
                                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{mat.direccion_lote || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Categoría</p>
                                        <p className="text-xs text-slate-600 mt-0.5">{mat.categoria?.nombre_categoria || getCategoryName(mat.categoria_id)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal("edit", mat)}
                                    className="flex items-center gap-1.5 text-sky-600 border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-xs h-8 px-3"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal("delete", mat)}
                                    className="flex items-center gap-1.5 text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-200 text-xs h-8 px-3"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400 text-sm bg-white border border-slate-200 rounded-xl">
                        No se encontraron matrículas.
                    </div>
                )}
            </div>

            {/* ── DESKTOP: Tabla (oculta en < md) ── */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="w-32"># Matrícula</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Dirección / Lote</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMatriculas.length > 0 ? (
                            filteredMatriculas.map((mat) => (
                                <TableRow key={mat.id}>
                                    <TableCell className="font-mono font-bold text-slate-900">{mat.numero_matricula}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{mat.cliente?.nombre || "N/A"}</TableCell>
                                    <TableCell className="text-slate-600 max-w-[200px] truncate" title={mat.direccion_lote ? `Lote: ${mat.direccion_lote}` : "N/A"}>
                                        {mat.direccion_lote || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {mat.categoria?.nombre_categoria || getCategoryName(mat.categoria_id)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(mat.estado)}>
                                            {getStatusLabel(mat.estado)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {formatDate(mat.fecha_registro || mat.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal("edit", mat)}
                                            className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal("delete", mat)}
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No se encontraron matrículas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Genérico */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={
                    modalMode === "create" ? "Nueva Matrícula" :
                        modalMode === "edit" ? "Editar Matrícula" :
                            "Eliminar Matrícula"
                }
            >
                {modalMode === "delete" ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-red-50 text-red-800 rounded-lg">
                            <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
                            <div>
                                <h4 className="font-semibold text-red-900">¿Estás seguro de eliminar esta matrícula?</h4>
                                <p className="text-sm mt-1">La matrícula "#{currentMatricula.numero_matricula}" será eliminada de forma permanente. Esta acción no se puede deshacer.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                onClick={handleDelete}
                            >
                                Sí, eliminar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Banner de error inline */}
                        {formError && (
                            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                                <p className="text-sm font-medium">{formError}</p>
                            </div>
                        )}
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                            <p className="text-sm text-slate-600">Al crear una Matricula automáticamente se creará una factura con el valor pre-establecido</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Matrícula</label>
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none transition-shadow font-mono text-slate-500 cursor-not-allowed"
                                    placeholder="Se generará al seleccionar el cliente..."
                                    value={currentMatricula.numero_matricula || ""}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                                <select
                                    required
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    value={currentMatricula.cliente_id || ""}
                                    onChange={(e) => {
                                        const nextClienteId = e.target.value;
                                        let nextNumero = currentMatricula.numero_matricula || "";
                                        if (modalMode === "create" && nextClienteId) {
                                            const clientObj = usuarios.find(u => u.id === nextClienteId);
                                            if (clientObj) {
                                                nextNumero = generateNextNumeroMatricula(clientObj.nombre, matriculas);
                                            }
                                        }
                                        setCurrentMatricula({
                                            ...currentMatricula,
                                            cliente_id: nextClienteId,
                                            numero_matricula: nextNumero
                                        });
                                    }}
                                >
                                    <option value="">Seleccione un usuario</option>
                                    {sortedUsuarios.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.nombre} (CC: {user.cedula})
                                        </option>
                                    ))}
                                </select>
                            </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Dirección del Lote</label>
                                 <input
                                     type="text"
                                     className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                     placeholder="Ej. Lote 15, Sector A"
                                     value={currentMatricula.direccion_lote || ""}
                                     onChange={(e) => setCurrentMatricula({ ...currentMatricula, direccion_lote: e.target.value })}
                                 />
                             </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                 <select
                                     required
                                     className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                     value={currentMatricula.categoria_id || ""}
                                     onChange={(e) => setCurrentMatricula({ ...currentMatricula, categoria_id: e.target.value })}
                                 >
                                     <option value="">Seleccione una categoría</option>
                                     {activeCategories.map((cat) => (
                                         <option key={cat.id} value={cat.id}>
                                             {cat.nombre_categoria}
                                         </option>
                                     ))}
                                 </select>
                             </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                 <select
                                     className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                     value={currentMatricula.estado || "activa"}
                                     onChange={(e) => setCurrentMatricula({ ...currentMatricula, estado: e.target.value as any })}
                                 >
                                     <option value="activa">Activa</option>
                                     <option value="suspendida">Suspendida</option>
                                     <option value="inactiva">Inactiva</option>
                                 </select>
                             </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
                                 <input
                                     type="date"
                                     className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                     value={currentMatricula.fecha_registro || ""}
                                     onChange={(e) => setCurrentMatricula({ ...currentMatricula, fecha_registro: e.target.value })}
                                 />
                             </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                                 <textarea
                                     className="w-full min-h-[80px] px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                     placeholder="Observaciones o notas adicionales..."
                                     value={currentMatricula.observaciones || ""}
                                     onChange={(e) => setCurrentMatricula({ ...currentMatricula, observaciones: e.target.value })}
                                 />
                             </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {modalMode === "create" ? "Registrar Matrícula" : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal de Configuración */}
            <Modal
                isOpen={isConfigModalOpen}
                onClose={closeConfigModal}
                title="Configuración de Facturación"
            >
                <form onSubmit={handleSaveConfig} className="space-y-4">
                    {configError && (
                        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                            <p className="text-sm font-medium">{configError}</p>
                        </div>
                    )}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor de Matrícula</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                value={configValues.valor_matricula}
                                onChange={(e) => setConfigValues({ ...configValues, valor_matricula: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Días de Vencimiento</label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                value={configValues.dias_vencimiento_matricula}
                                onChange={(e) => setConfigValues({ ...configValues, dias_vencimiento_matricula: parseInt(e.target.value) || 8 })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={closeConfigModal}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar Configuración
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
