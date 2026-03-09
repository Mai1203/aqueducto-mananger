import { supabase } from "@/lib/supabaseClient"

// 🔎 Buscar clientes
export async function buscarClientes(query: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select(`
      id, 
      nombre, 
      cedula, 
      direccion,
      categoria:categorias (
        valor_mensual
      )
    `)
    .or(`nombre.ilike.%${query}%,cedula.ilike.%${query}%`)
    .limit(10)

  if (error) throw error

  return data.map(c => ({
    ...c,
    valor_mensual: (c.categoria as any)?.valor_mensual || 0
  }))
}


// 💰 Obtener deuda de un cliente
export async function obtenerDeudaCliente(clienteId: string) {
  const { data, error } = await supabase
    .from("facturas_con_saldo") // 👈 usamos la vista
    .select("id, periodo, total, saldo_pendiente, fecha_vencimiento")
    .eq("cliente_id", clienteId)
    .gt("saldo_pendiente", 0) // solo facturas con saldo

  if (error) throw error

  const deuda_total = data.reduce(
    (sum, f) => sum + Number(f.saldo_pendiente),
    0
  )

  return {
    facturas: data,
    deuda_total,
  }
}


// 💳 Registrar pago
export async function registrarPago(input: {
  factura_id: string
  monto: number
  metodo_pago: "efectivo" | "transferencia"
  registrado_por: string
}) {
  const { data, error } = await supabase
    .from("pagos")
    .insert({
      factura_id: input.factura_id,
      valor_pagado: input.monto,
      metodo_pago: input.metodo_pago,
      registrado_por: input.registrado_por,
    })

  if (error) throw error

  return data
}

// 🗓️ Registrar pago por adelantado
export async function registrarPagoAdelantado(input: {
  cliente_id: string
  meses: number
  metodo_pago: "efectivo" | "transferencia"
  registrado_por: string
}) {
  // 1. Obtener valor mensual del cliente
  const { data: cliente, error: cliError } = await supabase
    .from("clientes")
    .select(`
      id,
      categoria:categorias (
        valor_mensual
      )
    `)
    .eq("id", input.cliente_id)
    .single()

  if (cliError) throw cliError

  const categoria = Array.isArray(cliente.categoria)
    ? cliente.categoria[0]
    : cliente.categoria as any

  const valorMensual = categoria?.valor_mensual || 0

  if (valorMensual <= 0) {
    throw new Error("El cliente no tiene una tarifa asignada o es $0.")
  }

  let mesesPorProcesar = input.meses
  const results = []

  // 2. Procesar facturas pendientes existentes primero
  const { data: facturasPendientes, error: pError } = await supabase
    .from("facturas")
    .select("*")
    .eq("cliente_id", input.cliente_id)
    .eq("estado", "pendiente")
    .order("periodo", { ascending: true })

  if (pError) throw pError

  if (facturasPendientes && facturasPendientes.length > 0) {
    for (const f of facturasPendientes) {
      if (mesesPorProcesar <= 0) break

      // Marcar factura como pagada
      const { error: fUpdateError } = await supabase
        .from("facturas")
        .update({ estado: "pagado" })
        .eq("id", f.id)

      if (fUpdateError) throw fUpdateError

      // Registrar el pago
      const { error: pInsertError } = await supabase
        .from("pagos")
        .insert({
          factura_id: f.id,
          valor_pagado: f.total,
          metodo_pago: input.metodo_pago,
          registrado_por: input.registrado_por,
        })

      if (pInsertError) throw pInsertError

      results.push(f)
      mesesPorProcesar--
    }
  }

  // 3. Si aún quedan meses por procesar, crear facturas futuras
  if (mesesPorProcesar > 0) {
    // Buscar la última factura generada (para saber el periodo de inicio)
    const { data: ultimaFactura } = await supabase
      .from("facturas")
      .select("periodo")
      .eq("cliente_id", input.cliente_id)
      .order("periodo", { ascending: false })
      .limit(1)

    let startPeriod = new Date().toISOString().slice(0, 7)
    if (ultimaFactura && ultimaFactura.length > 0) {
      startPeriod = ultimaFactura[0].periodo
    }

    let currentYear = parseInt(startPeriod.split("-")[0])
    let currentMonth = parseInt(startPeriod.split("-")[1])

    for (let i = 0; i < mesesPorProcesar; i++) {
      currentMonth++
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }
      const periodo = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`

      // Insertar factura directamente como pagada
      const { data: factura, error: fError } = await supabase
        .from("facturas")
        .insert({
          cliente_id: input.cliente_id,
          periodo,
          valor_base: valorMensual,
          total: valorMensual,
          estado: "pagado",
          fecha_vencimiento: new Date(currentYear, currentMonth - 1, 20).toISOString().split("T")[0]
        })
        .select()
        .single()

      if (fError) throw fError

      // Registrar pago
      const { error: pError } = await supabase
        .from("pagos")
        .insert({
          factura_id: factura.id,
          valor_pagado: valorMensual,
          metodo_pago: input.metodo_pago,
          registrado_por: input.registrado_por,
        })

      if (pError) throw pError

      results.push(factura)
    }
  }

  return results
}
