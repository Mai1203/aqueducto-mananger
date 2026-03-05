import { supabase } from "@/lib/supabaseClient"
import { DashboardMetrics, UltimoPago } from "./types"

export async function getDashboardMetrics(): Promise<DashboardMetrics> {

  const currentMonth = new Date().toISOString().slice(0, 7)

  // pagos del mes
  const { data: pagosMes } = await supabase
    .from("pagos")
    .select("valor_pagado, fecha_pago")
    .gte("fecha_pago", `${currentMonth}-01`)

  const totalRecaudado =
    pagosMes?.reduce((sum, p) => sum + Number(p.valor_pagado), 0) || 0

  // facturas pendientes
  const { data: pendientes } = await supabase
    .from("facturas")
    .select("total")
    .eq("estado", "pendiente")

  const totalPendiente =
    pendientes?.reduce((sum, f) => sum + Number(f.total), 0) || 0

  // facturas vencidas
  const today = new Date().toISOString()

  const { count: facturasVencidas } = await supabase
    .from("facturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", today)

  // usuarios activos
  const { count: usuariosActivos } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true })
    .eq("estado", "activo")

  return {
    totalRecaudado,
    totalPendiente,
    facturasVencidas: facturasVencidas || 0,
    usuariosActivos: usuariosActivos || 0
  }
}

export async function getUltimosPagos(): Promise<UltimoPago[]> {

  const { data } = await supabase
    .from("pagos")
    .select(`
      id,
      valor_pagado,
      fecha_pago,
      facturas(
        clientes(nombre)
      )
    `)
    .order("fecha_pago", { ascending: false })
    .limit(5)

  if (!data) return []

  return data.map((p: any) => ({
    id: p.id,
    valor_pagado: p.valor_pagado,
    fecha_pago: p.fecha_pago,
    cliente_nombre: p.facturas?.clientes?.nombre
  }))
}