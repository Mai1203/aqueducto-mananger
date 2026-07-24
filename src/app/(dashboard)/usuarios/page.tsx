"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

import { useUsuarios } from "@/features/usuarios/hooks";
import { Usuario } from "@/features/usuarios/types";
import Loading from "./loading";

// --- Helper: iniciales del nombre ---
function getInitials(nombre: string) {
    return nombre
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

export default function UsuariosPage() {
    const { usuarios, loading, add, update, remove } = useUsuarios();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
    const [currentUser, setCurrentUser] = useState<Partial<Usuario>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return usuarios.filter((user) => {
            const matchesSearch =
                user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.cedula.includes(searchTerm);
            const matchesStatus =
                statusFilter === "all" ? true : user.estado === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [usuarios, searchTerm, statusFilter]);

    if (loading) return <Loading />;

    const openModal = (mode: "create" | "edit" | "delete", user?: Usuario) => {
        setModalMode(mode);
        setCurrentUser(
            user ?? { nombre: "", cedula: "", telefono: "", estado: "activo" }
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser({});
        setFormError(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            if (modalMode === "create") {
                await add({
                    nombre: currentUser.nombre!,
                    cedula: currentUser.cedula!,
                    telefono: currentUser.telefono,
                    estado: currentUser.estado ?? "activo",
                });
                toast({ type: "success", title: "Usuario creado", description: `${currentUser.nombre} fue agregado exitosamente.` });
            } else if (modalMode === "edit" && currentUser.id) {
                await update(currentUser.id, {
                    nombre: currentUser.nombre,
                    cedula: currentUser.cedula,
                    telefono: currentUser.telefono,
                    estado: currentUser.estado,
                });
                toast({ type: "success", title: "Usuario actualizado", description: "Los cambios fueron guardados." });
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
            if (currentUser.id) await remove(currentUser.id);
            toast({ type: "success", title: "Usuario eliminado", description: `"${currentUser.nombre}" fue eliminado.` });
            closeModal();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al eliminar el usuario.";
            toast({ type: "error", title: "Error al eliminar", description: msg });
            closeModal();
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usuarios</h1>
                    <p className="text-sm text-slate-500 mt-1">Gestiona los suscriptores del acueducto rural.</p>
                </div>
                <Button onClick={() => openModal("create")} className="shrink-0 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="suspendido">Suspendidos</option>
                    </select>
                </div>
            </div>

            {/* ── MOBILE: Cards (solo visible en < md) ── */}
            <div className="md:hidden space-y-3">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3"
                        >
                            {/* Fila superior: avatar + nombre + badge */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Avatar con iniciales */}
                                    <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 text-sm font-semibold shrink-0 select-none">
                                        {getInitials(user.nombre)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{user.nombre}</p>
                                        <p className="text-xs text-slate-500">CC {user.cedula}</p>
                                    </div>
                                </div>
                                <Badge variant={user.estado === "activo" ? "success" : "error"}>
                                    {user.estado === "activo" ? "Activo" : "Suspendido"}
                                </Badge>
                            </div>

                            {user.telefono && (
                                <div className="border-t border-slate-100 pt-2 text-xs text-slate-600">
                                    <span className="font-medium text-slate-400">Teléfono: </span>
                                    {user.telefono}
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal("edit", user)}
                                    className="flex items-center gap-1.5 text-sky-600 border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-xs h-8 px-3"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal("delete", user)}
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
                        No se encontraron usuarios.
                    </div>
                )}
            </div>

            {/* ── DESKTOP: Tabla (oculta en < md) ── */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Cédula</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-slate-900">{user.nombre}</TableCell>
                                    <TableCell className="text-slate-600">{user.cedula}</TableCell>
                                    <TableCell className="text-slate-600">{user.telefono || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.estado === "activo" ? "success" : "error"}>
                                            {user.estado === "activo" ? "Activo" : "Suspendido"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal("edit", user)}
                                            className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal("delete", user)}
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
                                    No se encontraron usuarios.
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
                    modalMode === "create" ? "Nuevo Usuario" :
                        modalMode === "edit" ? "Editar Usuario" :
                            "Eliminar Usuario"
                }
            >
                {modalMode === "delete" ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-red-50 text-red-800 rounded-lg">
                            <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
                            <div>
                                <h4 className="font-semibold text-red-900">¿Estás seguro de eliminar este usuario?</h4>
                                <p className="text-sm mt-1">El usuario "{currentUser.nombre}" será eliminado permanentemente. Esta acción no se puede deshacer.</p>
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
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    placeholder="Ej. Juan Pérez"
                                    value={currentUser.nombre || ""}
                                    onChange={(e) => setCurrentUser({ ...currentUser, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cédula</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    required
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    placeholder="Ej. 1098745632"
                                    value={currentUser.cedula || ""}
                                    onChange={(e) => {
                                        const valorLimpiado = e.target.value.replace(/\D/g, "");
                                        setCurrentUser({ ...currentUser, cedula: valorLimpiado });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    placeholder="Ej. 3114567890"
                                    value={currentUser.telefono || ""}
                                    onChange={(e) => {
                                        const valorLimpiado = e.target.value.replace(/\D/g, "");
                                        setCurrentUser({ ...currentUser, telefono: valorLimpiado });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                <select
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                    value={String(currentUser.estado ?? "activo")}
                                    onChange={(e) => setCurrentUser({ ...currentUser, estado: e.target.value as "activo" | "suspendido" })}
                                >
                                    <option value="activo">Activo</option>
                                    <option value="suspendido">Suspendidos</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {modalMode === "create" ? "Crear Usuario" : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}