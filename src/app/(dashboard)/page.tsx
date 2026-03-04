import { MetricCard } from "@/components/ui/metric-card";
import { DollarSign, Users, AlertCircle, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Resumen financiero y operativo del acueducto rural.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Recaudado (Mes)"
          value="$ 1,245.00"
          trend="+12%"
          isPositive={true}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Pendiente"
          value="$ 450.00"
          trend="-2%"
          isPositive={true}
          icon={AlertCircle}
        />
        <MetricCard
          title="Facturas Vencidas"
          value="18"
          trend="+4"
          isPositive={false}
          icon={FileText}
        />
        <MetricCard
          title="Usuarios Activos"
          value="124"
          trend="+2"
          isPositive={true}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center lg:col-span-4 h-96">
          <span className="text-slate-400">Gráfico de historial de pagos (Próximamente)</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 leading-none">Últimos Pagos</h3>
            <p className="text-sm text-slate-500 mt-1">Registro de cobros recientes.</p>
          </div>
          <div className="p-6">
            <div className="space-y-6 text-sm">
              {[
                { name: "Juan Pérez", amount: "$15.00", date: "Hoy, 10:45 AM" },
                { name: "María Gómez", amount: "$15.00", date: "Ayer, 3:30 PM" },
                { name: "Familia Castro", amount: "$30.00", date: "15 Oct, 9:00 AM" }
              ].map((payment, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{payment.name}</p>
                    <p className="text-slate-500">{payment.date}</p>
                  </div>
                  <div className="font-semibold text-emerald-600">
                    +{payment.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
