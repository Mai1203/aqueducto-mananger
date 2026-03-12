"use client"

import { DollarSign, Users, AlertCircle, FileText } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { PagosChart } from "@/components/ui/Pagoschart";
import { useDashboard } from "@/features/dashboard/hooks";
import Loading from "./loading";

export default function Dashboard() {
  const { metrics, pagos, pagosMensuales, loading } = useDashboard()

  if (loading) return <Loading />

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
          value={`$ ${metrics?.totalRecaudado?.toLocaleString('es-CO')}`}
          trend="+12%"
          isPositive={true}
          icon={DollarSign}
        />

        <MetricCard
          title="Total Pendiente"
          value={`$ ${metrics?.totalPendiente?.toLocaleString('es-CO')}`}
          trend="-2%"
          isPositive={true}
          icon={AlertCircle}
        />
        <MetricCard
          title="Facturas Vencidas"
          value={`${metrics?.facturasVencidas}`}
          isPositive={false}
          icon={FileText}
        />
        <MetricCard
          title="Usuarios Activos"
          value={`${metrics?.usuariosActivos}`}
          isPositive={true}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center lg:col-span-4 h-96">
          <PagosChart data={pagosMensuales} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3 overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 leading-none">Últimos Pagos</h3>
            <p className="text-sm text-slate-500 mt-1">Registro de cobros recientes.</p>
          </div>
          <div className="p-6 space-y-4">

            {pagos.map((p) => (

              <div
                key={p.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{p.cliente_nombre}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(p.fecha_pago).toLocaleDateString()}
                  </p>
                </div>

                <div className="font-semibold text-emerald-600">
                  +${p.valor_pagado}
                </div>
              </div>

            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
