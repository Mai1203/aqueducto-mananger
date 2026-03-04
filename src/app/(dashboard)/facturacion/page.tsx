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
import { Search, Zap, Filter } from "lucide-react";

const mockInvoices = [
    { id: "INV-001", client: "Juan Pérez García", period: "2023-10", base: "$12.000", total: "$12.000", status: "pending", due: "2023-11-05" },
    { id: "INV-002", client: "María Gómez Ruiz", period: "2023-10", base: "$30.000", total: "$30.000", status: "paid", due: "2023-11-05" },
    { id: "INV-003", client: "Carlos Rodríguez", period: "2023-09", base: "$12.000", total: "$13.500", status: "overdue", due: "2023-10-05" },
];

export default function FacturacionPage() {
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
                <Button className="shrink-0 flex items-center gap-2 shadow-sm font-semibold h-11 px-6">
                    <Zap className="w-5 h-5 fill-current" />
                    Generar Facturación (Octubre)
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o N° factura..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Factura / Cliente</TableHead>
                            <TableHead>Periodo</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Vencimiento</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockInvoices.map((inv) => (
                            <TableRow key={inv.id} className={inv.status === 'overdue' ? 'bg-rose-50/30' : ''}>
                                <TableCell>
                                    <div className="font-medium text-slate-900">{inv.client}</div>
                                    <div className="text-xs text-slate-500">{inv.id}</div>
                                </TableCell>
                                <TableCell className="text-slate-600">{inv.period}</TableCell>
                                <TableCell className="font-semibold text-slate-900">{inv.total}</TableCell>
                                <TableCell className={inv.status === 'overdue' ? 'text-rose-600 font-medium' : 'text-slate-600'}>
                                    {inv.due}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            inv.status === "paid" ? "success" :
                                                inv.status === "pending" ? "warning" : "error"
                                        }
                                    >
                                        {inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : "Vencida"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
