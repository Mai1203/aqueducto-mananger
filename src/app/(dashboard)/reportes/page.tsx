import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportesPage() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Reportes
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Analíticas y exportación de datos del acueducto.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Exportar PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Exportar Excel
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Ingresos vs Proyectado
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-4">
                            <span className="text-sm text-slate-400 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                AQUÍ GRÁFICO DE BARRAS RECHARTS
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Top 5 Morosos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Carlos Rodríguez", amount: "$ 25.500", months: "2 meses" },
                                { name: "Familia Sánchez", amount: "$ 18.000", months: "1 mes" },
                                { name: "Finca El Porvenir", amount: "$ 15.000", months: "1 mes" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                                    <div>
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-xs text-rose-600">{item.months} de atraso</p>
                                    </div>
                                    <div className="font-bold text-slate-900">
                                        {item.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
