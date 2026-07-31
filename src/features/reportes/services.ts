import { supabase } from "@/lib/supabaseClient"
import { IngresoMensual, ClienteMoroso } from "./types"
import { Factura } from "@/features/facturacion/types"

export async function getIngresosMensuales(): Promise<IngresoMensual[]> {
  const currentYear = new Date().getFullYear()

  // Pagos reales del año
  const { data: pagos, error: errorPagos } = await supabase
    .from("pagos")
    .select("valor_pagado, fecha_pago")
    .gte("fecha_pago", `${currentYear}-01-01`)
    .lte("fecha_pago", `${currentYear}-12-31`)

  if (errorPagos) {
    console.error("Error obteniendo pagos para reportes:", errorPagos)
    throw new Error("No se pudieron cargar los ingresos reales")
  }

  // Total facturado por mes (proyectado = lo que se debía cobrar)
  const { data: facturas, error: errorFacturas } = await supabase
    .from("facturas")
    .select("valor_base, periodo")
    .gte("periodo", `${currentYear}-01`)
    .lte("periodo", `${currentYear}-12`)

  if (errorFacturas) {
    console.error("Error obteniendo facturas para reportes:", errorFacturas)
    throw new Error("No se pudieron cargar los ingresos proyectados")
  }

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
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      total,
      matriculas (
        cliente_id,
        clientes (
          id,
          nombre
        )
      )
    `)
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", new Date().toISOString().split("T")[0])

  if (error) {
    console.error("Error obteniendo top morosos:", error)
    throw new Error("No se pudo cargar la lista de morosos")
  }

  if (!data) return []

  const grouped: Record<string, { nombre: string; total_deuda: number; facturas_pendientes: number }> = {}

  data.forEach((f: any) => {
    const clienteId = f.matriculas?.clientes?.id
    const nombre = f.matriculas?.clientes?.nombre ?? "Desconocido"
    if (!clienteId) return

    if (!grouped[clienteId]) {
      grouped[clienteId] = { nombre, total_deuda: 0, facturas_pendientes: 0 }
    }
    grouped[clienteId].total_deuda += Number(f.total)
    grouped[clienteId].facturas_pendientes += 1
  })

  return Object.entries(grouped)
    .map(([id, clientData]) => ({ id, ...clientData }))
    .sort((a, b) => b.total_deuda - a.total_deuda)
    .slice(0, 5)
}

export async function getReportePendientesYMorosos(): Promise<{ morosos: ClienteMoroso[], pendientes: ClienteMoroso[] }> {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      total,
      fecha_vencimiento,
      matriculas (
        cliente_id,
        clientes (
          id,
          nombre
        )
      )
    `)
    .eq("estado", "pendiente")

  if (error) {
    console.error("Error obteniendo reportes de pendientes:", error)
    throw new Error("No se pudo cargar la lista completa de pendientes y morosos")
  }

  if (!data) return { morosos: [], pendientes: [] }

  const groupedMorosos: Record<string, { nombre: string; total_deuda: number; facturas_pendientes: number }> = {}
  const groupedPendientes: Record<string, { nombre: string; total_deuda: number; facturas_pendientes: number }> = {}

  const today = new Date().toISOString().split("T")[0]

  data.forEach((f: any) => {
    const clienteId = f.matriculas?.clientes?.id
    const nombre = f.matriculas?.clientes?.nombre ?? "Desconocido"
    if (!clienteId) return

    if (f.fecha_vencimiento < today) {
      if (!groupedMorosos[clienteId]) {
        groupedMorosos[clienteId] = { nombre, total_deuda: 0, facturas_pendientes: 0 }
      }
      groupedMorosos[clienteId].total_deuda += Number(f.total)
      groupedMorosos[clienteId].facturas_pendientes += 1
    } else {
      if (!groupedPendientes[clienteId]) {
        groupedPendientes[clienteId] = { nombre, total_deuda: 0, facturas_pendientes: 0 }
      }
      groupedPendientes[clienteId].total_deuda += Number(f.total)
      groupedPendientes[clienteId].facturas_pendientes += 1
    }
  })

  const morososArray = Object.entries(groupedMorosos)
    .map(([id, clientData]) => ({ id, ...clientData }))
    .sort((a, b) => b.total_deuda - a.total_deuda)

  const pendientesArray = Object.entries(groupedPendientes)
    .map(([id, clientData]) => ({ id, ...clientData }))
    .sort((a, b) => b.total_deuda - a.total_deuda)

  return { morosos: morososArray, pendientes: pendientesArray }
}

export async function getFacturasPendientesPorMatricula(matriculaId: string): Promise<Factura[]> {
  const { data, error } = await supabase
    .from("facturas")
    .select(`
      id,
      periodo,
      valor_base,
      recargo,
      descuento,
      total,
      estado,
      fecha_vencimiento,
      fecha_generacion,
      created_at,
      matricula_id,
      matricula:matriculas (
        id,
        numero_matricula,
        cliente:clientes (
          id,
          nombre
        )
      )
    `)
    .eq("matricula_id", matriculaId)
    .eq("estado", "pendiente")
    .order("fecha_generacion", { ascending: true })

  if (error) {
    console.error("Error obteniendo facturas pendientes por matrícula:", error)
    throw new Error("No se pudieron cargar las facturas pendientes")
  }

  return (data as unknown as Factura[]) || []
}