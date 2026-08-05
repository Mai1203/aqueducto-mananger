import { supabase } from "@/lib/supabaseClient"
import { DashboardMetrics, DashboardTrends, UltimoPago } from "./types"

function getPreviousMonth() {
  const today = new Date()
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const year = prev.getFullYear()
  const month = String(prev.getMonth() + 1).padStart(2, "0")
  const firstDay = `${year}-${month}-01`
  const lastDay = new Date(year, prev.getMonth() + 1, 0).toISOString().split("T")[0]
  return { firstDay, lastDay, monthKey: `${year}-${month}` }
}

function calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) {
    if (current === 0) return { value: 0, isPositive: true }
    return { value: 100, isPositive: true }
  }
  const change = ((current - previous) / previous) * 100
  return {
    value: Math.abs(Math.round(change)),
    isPositive: change >= 0,
  }
}

export async function getDashboardMetrics(): Promise<{ metrics: DashboardMetrics; trends: DashboardTrends }> {

  const currentMonth = new Date().toISOString().slice(0, 7)
  const prevMonth = getPreviousMonth()

  // pagos del mes actual
  const { data: pagosMes, error: errorPagos } = await supabase
    .from("pagos")
    .select("valor_pagado, fecha_pago")
    .gte("fecha_pago", `${currentMonth}-01`)

  if (errorPagos) {
    console.error("Error obteniendo pagos del mes:", errorPagos)
    throw new Error("No se pudieron cargar los ingresos del mes")
  }

  const totalRecaudado =
    pagosMes?.reduce((sum, p) => sum + Number(p.valor_pagado), 0) || 0

  // pagos del mes anterior para comparación
  const { data: pagosMesAnterior, error: errorPagosAnterior } = await supabase
    .from("pagos")
    .select("valor_pagado, fecha_pago")
    .gte("fecha_pago", prevMonth.firstDay)
    .lte("fecha_pago", prevMonth.lastDay)

  if (errorPagosAnterior) {
    console.error("Error obteniendo pagos del mes anterior:", errorPagosAnterior)
    throw new Error("No se pudieron cargar los ingresos del mes anterior")
  }

  const totalRecaudadoAnterior =
    pagosMesAnterior?.reduce((sum, p) => sum + Number(p.valor_pagado), 0) || 0

  // facturas pendientes actuales
  const { data: pendientes, error: errorPendientes } = await supabase
    .from("facturas")
    .select("total, fecha_generacion")
    .eq("estado", "pendiente")

  if (errorPendientes) {
    console.error("Error obteniendo facturas pendientes:", errorPendientes)
    throw new Error("No se pudieron cargar las facturas pendientes")
  }

  const totalPendiente =
    pendientes?.reduce((sum, f) => sum + Number(f.total), 0) || 0

  // facturas pendientes del mes anterior para comparación
  const { data: pendientesAnterior, error: errorPendientesAnterior } = await supabase
    .from("facturas")
    .select("total, fecha_generacion")
    .eq("estado", "pendiente")
    .gte("fecha_generacion", prevMonth.firstDay)
    .lte("fecha_generacion", prevMonth.lastDay)

  if (errorPendientesAnterior) {
    console.error("Error obteniendo facturas pendientes del mes anterior:", errorPendientesAnterior)
    throw new Error("No se pudieron cargar las facturas pendientes del mes anterior")
  }

  const totalPendienteAnterior =
    pendientesAnterior?.reduce((sum, f) => sum + Number(f.total), 0) || 0

  // facturas vencidas (pendientes y con fecha_vencimiento pasada)
  const today = new Date().toISOString().split("T")[0]
  const { count: facturasVencidas, error: errorVencidas } = await supabase
    .from("facturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", today)

  if (errorVencidas) {
    console.error("Error obteniendo facturas vencidas:", errorVencidas)
    throw new Error("No se pudieron cargar las facturas vencidas")
  }

  const fechaFinMesAnterior = prevMonth.lastDay
  const { count: facturasVencidasAnterior, error: errorVencidasAnterior } = await supabase
    .from("facturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", fechaFinMesAnterior)

  if (errorVencidasAnterior) {
    console.error("Error obteniendo facturas vencidas del mes anterior:", errorVencidasAnterior)
    throw new Error("No se pudieron cargar las facturas vencidas del mes anterior")
  }

  // usuarios activos
  const { count: usuariosActivos, error: errorUsuarios } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true })
    .eq("estado", "activo")

  if (errorUsuarios) {
    console.error("Error obteniendo usuarios activos:", errorUsuarios)
    throw new Error("No se pudieron cargar los usuarios activos")
  }

  const { count: usuariosActivosAnterior, error: errorUsuariosAnterior } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true })
    .eq("estado", "activo")
    .lte("fecha_registro", fechaFinMesAnterior)

  if (errorUsuariosAnterior) {
    console.error("Error obteniendo usuarios activos del mes anterior:", errorUsuariosAnterior)
    throw new Error("No se pudieron cargar los usuarios activos del mes anterior")
  }

  const trends: DashboardTrends = {
    totalRecaudado: calculateTrend(totalRecaudado, totalRecaudadoAnterior),
    totalPendiente: calculateTrend(totalPendiente, totalPendienteAnterior),
    facturasVencidas: calculateTrend(facturasVencidas || 0, facturasVencidasAnterior || 0),
    usuariosActivos: calculateTrend(usuariosActivos || 0, usuariosActivosAnterior || 0),
  }

  return {
    metrics: {
      totalRecaudado,
      totalRecaudadoAnterior,
      totalPendiente,
      totalPendienteAnterior,
      facturasVencidas: facturasVencidas || 0,
      facturasVencidasAnterior: facturasVencidasAnterior || 0,
      usuariosActivos: usuariosActivos || 0,
      usuariosActivosAnterior: usuariosActivosAnterior || 0,
    },
    trends,
  }
}

export async function getUltimosPagos(): Promise<UltimoPago[]> {
  const { data, error } = await supabase.rpc("get_ultimos_pagos_por_cliente")

  if (error) {
    console.error("Error obteniendo últimos pagos:", error)
    throw new Error("No se pudieron cargar los últimos pagos")
  }

  if (!data) return []

  return data
}

export async function getPagosMensuales(): Promise<{ mes: string; total: number }[]> {
  const currentYear = new Date().getFullYear()

  const { data, error } = await supabase
    .from("pagos")
    .select("valor_pagado, fecha_pago")
    .gte("fecha_pago", `${currentYear}-01-01`)
    .lte("fecha_pago", `${currentYear}-12-31`)
    .order("fecha_pago", { ascending: true })

  if (error) {
    console.error("Error obteniendo pagos mensuales:", error)
    throw new Error("No se pudieron cargar los pagos mensuales")
  }

  if (!data) return []

  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  const grouped: Record<number, number> = {}

  data.forEach((p) => {
    // fecha_pago viene como "YYYY-MM-DD", parseamos sin conversión de zona horaria
    const mes = parseInt(p.fecha_pago.slice(5, 7)) - 1 // 0-11
    grouped[mes] = (grouped[mes] || 0) + Number(p.valor_pagado)
  })

  const mesActual = new Date().getMonth()
  return Array.from({ length: mesActual + 1 }, (_, i) => ({
    mes: mesesNombres[i],
    total: grouped[i] || 0,
  }))
}