import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserCircle, CheckCircle2 } from "lucide-react";

export default function PagosPage() {
    return (
        <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Registrar Pago
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Busca un usuario para ver su deuda y registrar un nuevo pago.
                </p>
            </div>

            {/* Search Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-1 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente por nombre o documento..."
                            className="w-full pl-12 pr-4 py-4 bg-transparent border-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-lg"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Placeholder before search */}
                <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <UserCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Ningún cliente seleccionado</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        Utiliza la barra de búsqueda superior para encontrar el usuario y proceder con el registro de pago.
                    </p>
                </CardContent>
            </Card>

            {/* Example UI of what happens when a user IS selected (Static for demo) */}
            <div className="mt-8">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Ejemplo (Usuario Seleccionado)</h4>
                <Card className="border-emerald-200 shadow-sm overflow-hidden border-2">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-slate-900">Carlos Rodríguez</h2>
                                    <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium">Mora</span>
                                </div>
                                <p className="text-slate-500">CC: 1056789412 • Vereda San Juan</p>

                                <div className="mt-6">
                                    <p className="text-sm text-slate-500 mb-1">Deuda Total Pendiente</p>
                                    <p className="text-4xl font-bold text-slate-900">$ 25.500</p>
                                </div>
                            </div>

                            <div className="flex-1 md:max-w-sm bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Monto a pagar</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input type="number" defaultValue={25500} className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Método de pago</label>
                                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                            <option>Efectivo</option>
                                            <option>Transferencia Bancaria</option>
                                        </select>
                                    </div>
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-sm">
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Confirmar Pago
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
