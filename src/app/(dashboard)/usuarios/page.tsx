import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal } from "lucide-react";

const mockUsers = [
    {
        id: "1",
        name: "Juan Pérez García",
        document: "1098745632",
        address: "Vereda La Esperanza, Finca El Sol",
        phone: "311 456 7890",
        category: "Residencial",
        status: "active",
    },
    {
        id: "2",
        name: "María Gómez Ruiz",
        document: "45789123",
        address: "Sector Central, Casa 15",
        phone: "320 123 4567",
        category: "Comercial",
        status: "active",
    },
    {
        id: "3",
        name: "Carlos Rodríguez",
        document: "1056789412",
        address: "Vereda San Juan, Lote 4",
        phone: "315 987 6543",
        category: "Residencial",
        status: "suspended",
    },
];

export default function UsuariosPage() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Usuarios
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestiona los suscriptores del acueducto rural.
                    </p>
                </div>
                <Button className="shrink-0 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[150px]">
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="suspended">Suspendidos</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Cédula</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-slate-900">
                                    {user.name}
                                    <div className="text-xs text-slate-500 md:hidden">
                                        {user.document}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-slate-600">
                                    {user.document}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {user.address}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {user.category}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.status === "active" ? "success" : "error"}
                                    >
                                        {user.status === "active" ? "Activo" : "Suspendido"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
