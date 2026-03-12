import { supabase } from "@/lib/supabaseClient"
import { IngresoMensual, ClienteMoroso } from "./types"

export async function getIngresosMensuales(): Promise<IngresoMensual[]> {
  const currentYear = new Date().getFullYear()

  // Pagos reales del año
  const { data: pagos } = await supabase
    .from("pagos")
    .select("valor_pagado, fecha_pago")
    .gte("fecha_pago", `${currentYear}-01-01`)
    .lte("fecha_pago", `${currentYear}-12-31`)

  // Total facturado por mes (proyectado = lo que se debía cobrar)
  const { data: facturas } = await supabase
    .from("facturas")
    .select("valor_base, periodo")
    .gte("periodo", `${currentYear}-01`)
    .lte("periodo", `${currentYear}-12`)

  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  const ingresos: Record<number, number> = {}
  const proyectado: Record<number, number> = {}

  pagos?.forEach((p) => {
    const mes = parseInt(p.fecha_pago.slice(5, 7)) - 1
    ingresos[mes] = (ingresos[mes] || 0) + Number(p.valor_pagado)
  })

  facturas?.forEach((f) => {
    const mes = parseInt(f.periodo.slice(5, 7)) - 1
    proyectado[mes] = (proyectado[mes] || 0) + Number(f.valor_base)
  })

  const mesActual = new Date().getMonth()
  return Array.from({ length: mesActual + 1 }, (_, i) => ({
    mes: mesesNombres[i],
    ingreso: ingresos[i] || 0,
    proyectado: proyectado[i] || 0,
  }))
}

export async function getTopMorosos(): Promise<ClienteMoroso[]> {
  const { data } = await supabase
    .from("facturas")
    .select(`
      total,
      clientes (
        id,
        nombre
      )
    `)
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", new Date().toISOString().split("T")[0])

  if (!data) return []

  // Agrupar por cliente
  const grouped: Record<string, { nombre: string; total_deuda: number; facturas_pendientes: number }> = {}

  data.forEach((f: any) => {
    const clienteId = f.clientes?.id
    const nombre = f.clientes?.nombre ?? "Desconocido"
    if (!clienteId) return

    if (!grouped[clienteId]) {
      grouped[clienteId] = { nombre, total_deuda: 0, facturas_pendientes: 0 }
    }
    grouped[clienteId].total_deuda += Number(f.total)
    grouped[clienteId].facturas_pendientes += 1
  })

  return Object.entries(grouped)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total_deuda - a.total_deuda)
    .slice(0, 5)
}