"use client";

import { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useCategories } from "@/features/categorias/hooks";
import { useAuth } from "@/features/auth/AuthContext";
import { Category } from "@/features/categorias/types";
import Loading from "./loading";

export default function CategoriasPage() {
    const { categories, loading, add, update, remove } = useCategories();
    const { user } = useAuth();
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
    const [formError, setFormError] = useState<string | null>(null);

    if (loading) return <Loading />;

    const openModal = (mode: "create" | "edit" | "delete", category?: Category) => {
        setModalMode(mode);
        setCurrentCategory(
            category ?? { nombre_categoria: "", valor_mensual: 0, descripcion: "", activa: true }
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({});
        setFormError(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            if (modalMode === "create") {
                await add({
                    nombre_categoria: currentCategory.nombre_categoria!,
                    valor_mensual: Number(currentCategory.valor_mensual),
                    descripcion: currentCategory.descripcion!,
                    activa: currentCategory.activa ?? true,
                });
                toast({ type: "success", title: "Categoría creada", description: `"${currentCategory.nombre_categoria}" fue agregada exitosamente.` });
            } else if (modalMode === "edit" && currentCategory.id) {
                await update(currentCategory.id, {
                    nombre_categoria: currentCategory.nombre_categoria,
                    valor_mensual: Number(currentCategory.valor_mensual),
                    activa: currentCategory.activa,
                });
                toast({ type: "success", title: "Categoría actualizada", description: "Los cambios fueron guardados." });
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
            if (currentCategory.id) await remove(currentCategory.id);
            toast({ type: "success", title: "Categoría eliminada", description: `"${currentCategory.nombre_categoria}" fue eliminada.` });
            closeModal();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al eliminar la categoría.";
            toast({ type: "error", title: "Error al eliminar", description: msg });
            closeModal();
        }
    };

    const formatCurrency = (val: string) => {
        const number = parseInt(val.replace(/\D/g, "") || "0", 10);
        return new Intl.NumberFormat("es-CO", {
            style: "currency", currency: "COP", maximumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categorías Tarifarias</h1>
                    <p className="text-sm text-slate-500 mt-1">Administra los valores mensuales fijos por tipo de usuario.</p>
                </div>
                <Button onClick={() => openModal("create")} className="shrink-0 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </Button>
            </div>

            {/* ── MOBILE: Cards (solo visible en < md) ── */}
            <div className="md:hidden space-y-3">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm
                                ${!cat.activa ? "opacity-75" : ""}`}
                        >
                            {/* Franja de color superior según estado */}
                            <div className={`h-1 w-full ${cat.activa ? "bg-emerald-500" : "bg-slate-300"}`} />

                            <div className="p-4 flex flex-col gap-3">
                                {/* Nombre + badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-slate-900 text-base leading-snug">
                                        {cat.nombre_categoria}
                                    </p>
                                    <Badge variant={cat.activa ? "success" : "secondary"}>
                                        {cat.activa ? "Activa" : "Inactiva"}
                                    </Badge>
                                </div>

                                {/* Valor mensual destacado */}
                                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                        Valor mensual
                                    </span>
                                    <span className={`text-lg font-semibold ${cat.activa ? "text-slate-900" : "text-slate-400"}`}>
                                        {formatCurrency(cat.valor_mensual.toString())}
                                    </span>
                                </div>

                                {/* Descripción */}
                                {cat.descripcion && (
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {cat.descripcion}
                                    </p>
                                )}

                                {/* Acciones */}
                                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openModal("edit", cat)}
                                        className="flex items-center gap-1.5 text-sky-600 border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-xs h-8 px-3"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openModal("delete", cat)}
                                        className="flex items-center gap-1.5 text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-200 text-xs h-8 px-3"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400 text-sm bg-white border border-slate-200 rounded-xl">
                        No hay categorías creadas.
                    </div>
                )}
            </div>

            {/* ── DESKTOP: Tabla (oculta en < md) ── */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead>Nombre de Categoría</TableHead>
                            <TableHead>Valor Mensual</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium text-slate-900">{cat.nombre_categoria}</TableCell>
                                    <TableCell className="text-slate-600 font-semibold">
                                        {formatCurrency(cat.valor_mensual.toString())}
                                    </TableCell>
                                    <TableCell className="text-slate-600">{cat.descripcion}</TableCell>
                                    <TableCell>
                                        <Badge variant={cat.activa ? "success" : "secondary"}>
                                            {cat.activa ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost" size="icon"
                                            onClick={() => openModal("edit", cat)}
                                            className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="icon"
                                            onClick={() => openModal("delete", cat)}
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No hay categorías creadas.
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
                    modalMode === "create" ? "Nueva Categoría" :
                        modalMode === "edit" ? "Editar Categoría" :
                            "Eliminar Categoría"
                }
            >
                {modalMode === "delete" ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-red-50 text-red-800 rounded-lg">
                            <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
                            <div>
                                <h4 className="font-semibold text-red-900">¿Estás seguro de eliminar esta categoría?</h4>
                                <p className="text-sm mt-1">La categoría "{currentCategory.nombre_categoria}" será eliminada de forma permanente. Esta acción no se puede deshacer.</p>
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
                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Banner de error inline */}
                        {formError && (
                            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                                <p className="text-sm font-medium">{formError}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    placeholder="Ej. Residencial Estrato 3"
                                    value={currentCategory.nombre_categoria || ""}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, nombre_categoria: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mensual</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full h-10 pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                        placeholder="0"
                                        value={currentCategory.valor_mensual || ""}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, valor_mensual: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    required
                                    className="w-full h-24 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    placeholder="Descripción de la categoría"
                                    value={currentCategory.descripcion || ""}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, descripcion: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                <select
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    value={currentCategory.activa ? "active" : "inactive"}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, activa: e.target.value === "active" })}
                                >
                                    <option value="active">Activa</option>
                                    <option value="inactive">Inactiva</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {modalMode === "create" ? "Crear Categoría" : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}