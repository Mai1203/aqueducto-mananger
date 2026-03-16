import { supabase } from "@/lib/supabaseClient"
import { DashboardMetrics, UltimoPago } from "./types"

export async function getDashboardMetrics(): Promise<DashboardMetrics> {

  const currentMonth = new Date().toISOString().slice(0, 7)

  // pagos del mes
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

  // facturas pendientes
  const { data: pendientes, error: errorPendientes } = await supabase
    .from("facturas")
    .select("total")
    .eq("estado", "pendiente")

  if (errorPendientes) {
    console.error("Error obteniendo facturas pendientes:", errorPendientes)
    throw new Error("No se pudieron cargar las facturas pendientes")
  }

  const totalPendiente =
    pendientes?.reduce((sum, f) => sum + Number(f.total), 0) || 0

  // facturas vencidas (pendientes y con fecha_vencimiento pasada)
  const today = new Date().toISOString().split("T")[0] // solo fecha YYYY-MM-DD
  const { count: facturasVencidas, error: errorVencidas } = await supabase
    .from("facturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", today)

  if (errorVencidas) {
    console.error("Error obteniendo facturas vencidas:", errorVencidas)
    throw new Error("No se pudieron cargar las facturas vencidas")
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


  return {
    totalRecaudado,
    totalPendiente,
    facturasVencidas: facturasVencidas || 0,
    usuariosActivos: usuariosActivos || 0,
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