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
import { Plus, Edit2 } from "lucide-react";

const mockCategories = [
    { id: "1", name: "Residencial Estrato 1", value: "$ 12.000", status: "active" },
    { id: "2", name: "Residencial Estrato 2", value: "$ 15.000", status: "active" },
    { id: "3", name: "Comercial Pequeño", value: "$ 30.000", status: "active" },
    { id: "4", name: "Industrial", value: "$ 80.000", status: "inactive" },
];

export default function CategoriasPage() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Categorías Tarifarias
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Administra los valores mensuales fijos por tipo de usuario.
                    </p>
                </div>
                <Button className="shrink-0 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead>Nombre de Categoría</TableHead>
                            <TableHead>Valor Mensual</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockCategories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium text-slate-900">
                                    {cat.name}
                                </TableCell>
                                <TableCell className="text-slate-600 font-semibold">{cat.value}</TableCell>
                                <TableCell>
                                    <Badge variant={cat.status === "active" ? "success" : "secondary"}>
                                        {cat.status === "active" ? "Activa" : "Inactiva"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                                        <Edit2 className="h-4 w-4" />
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
