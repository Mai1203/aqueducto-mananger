import { supabase } from "@/lib/supabaseClient"

// 🔎 Buscar clientes con sus matrículas asociadas
export async function buscarClientes(query: string) {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from("clientes")
    .select(`
      id, 
      nombre, 
      cedula, 
      matriculas (
        id,
        numero_matricula,
        direccion_lote,
        estado,
        categoria:categorias (
          nombre_categoria,
          valor_mensual
        )
      )
    `)
    .or(`nombre.ilike.%${query}%,cedula.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error("Error buscando clientes:", error)
    throw new Error("No se pudo realizar la búsqueda de clientes.")
  }

  return (data || []).map(c => {
    const rawMatriculas = Array.isArray(c.matriculas) ? c.matriculas : []
    const matriculasFormatted = rawMatriculas.map((m: any) => {
      const cat = Array.isArray(m.categoria) ? m.categoria[0] : m.categoria
      return {
        id: m.id,
        numero_matricula: m.numero_matricula,
        direccion_lote: m.direccion_lote,
        estado: m.estado || "activa",
        valor_mensual: Number(cat?.valor_mensual) || 0,
        nombre_categoria: cat?.nombre_categoria || ""
      }
    })

    return {
      id: c.id,
      nombre: c.nombre,
      cedula: c.cedula,
      matriculas: matriculasFormatted
    }
  })
}


// 💰 Obtener deuda de una matrícula
export async function obtenerDeudaMatricula(matriculaId?: string | null, clienteId?: string | null) {
  if (!matriculaId) {
    return { facturas: [], deuda_total: 0 }
  }

  const { data, error } = await supabase
    .from("facturas_con_saldo")
    .select("id, periodo, total, saldo_pendiente, fecha_vencimiento, matricula_id")
    .eq("matricula_id", matriculaId)
    .gt("saldo_pendiente", 0)
    .order("periodo", { ascending: true })

  if (error) {
    console.error("Error obteniendo deuda de la matrícula:", error)
    throw new Error("No se pudo cargar la información de deuda.")
  }

  const facturas = data || []
  const deuda_total = facturas.reduce(
    (sum, f) => sum + Number(f.saldo_pendiente),
    0
  )

  return {
    facturas,
    deuda_total,
  }
}

// Mantener exportación por compatibilidad
export async function obtenerDeudaCliente(clienteId: string) {
  return obtenerDeudaMatricula(null, clienteId)
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

  if (error) {
    console.error("Error registrando pago:", error)
    throw new Error("No se pudo registrar el pago. Por favor intente de nuevo.")
  }

  return data
}

// 🗓️ Registrar pago por adelantado
export async function registrarPagoAdelantado(input: {
  cliente_id: string
  matricula_id?: string | null
  meses?: number
  monto?: number
  metodo_pago: "efectivo" | "transferencia"
  registrado_por: string
}) {
  let valorMensual = 0

  // 1. Obtener valor mensual de la matrícula seleccionada
  if (input.matricula_id) {
    const { data: mat, error: matError } = await supabase
      .from("matriculas")
      .select(`
        id,
        categoria:categorias (
          valor_mensual
        )
      `)
      .eq("id", input.matricula_id)
      .maybeSingle()

    if (!matError && mat) {
      const categoria = Array.isArray(mat.categoria) ? mat.categoria[0] : (mat.categoria as any)
      valorMensual = Number(categoria?.valor_mensual) || 0
    }
  }

  // Si no se obtuvo de matrícula seleccionada, intentar con la primera matrícula del cliente
  if (valorMensual <= 0) {
    const { data: mats, error: matError } = await supabase
      .from("matriculas")
      .select(`
        id,
        categoria:categorias (
          valor_mensual
        )
      `)
      .eq("cliente_id", input.cliente_id)
      .limit(1)

    if (!matError && mats && mats.length > 0) {
      const categoria = Array.isArray(mats[0].categoria) ? mats[0].categoria[0] : (mats[0].categoria as any)
      valorMensual = Number(categoria?.valor_mensual) || 0
    }
  }

  if (valorMensual <= 0) {
    throw new Error("La matrícula no tiene una tarifa asignada o es $0.")
  }

  const results = []
  let montoDisponible = input.monto || 0
  let mesesRestantes = input.meses || 0
  const isPorCuotas = !!input.meses

  // 2. Procesar facturas pendientes existentes
  if (!input.matricula_id) {
    throw new Error("Se requiere una matrícula para registrar el pago.")
  }

  const { data: facturasPendientes, error: pError } = await supabase
    .from("facturas_con_saldo")
    .select("*")
    .eq("matricula_id", input.matricula_id)
    .gt("saldo_pendiente", 0)
    .order("periodo", { ascending: true })

  if (pError) throw pError

  if (facturasPendientes && facturasPendientes.length > 0) {
    for (const f of facturasPendientes) {
      if (!isPorCuotas && montoDisponible <= 0) break
      if (isPorCuotas && mesesRestantes <= 0) break

      let valorAPagar = 0
      if (isPorCuotas) {
        valorAPagar = Number(f.saldo_pendiente)
        mesesRestantes--
      } else {
        valorAPagar = Math.min(Number(f.saldo_pendiente), montoDisponible)
        montoDisponible -= valorAPagar
      }

      if (valorAPagar <= 0) continue

      // Registrar el pago
      const { error: pInsertError } = await supabase
        .from("pagos")
        .insert({
          factura_id: f.id,
          valor_pagado: valorAPagar,
          metodo_pago: input.metodo_pago,
          registrado_por: input.registrado_por,
        })

      if (pInsertError) throw pInsertError

      // Si se completó el pago de la factura, marcarla como pagada
      if (valorAPagar >= Number(f.saldo_pendiente)) {
        const { error: fUpdateError } = await supabase
          .from("facturas")
          .update({ estado: "pagado" })
          .eq("id", f.id)
        if (fUpdateError) throw fUpdateError
      }

      results.push({ ...f, valor_pagado: valorAPagar })
    }
  }

  // 3. Crear facturas futuras si aún queda saldo o meses
  if ((isPorCuotas && mesesRestantes > 0) || (!isPorCuotas && montoDisponible > 0)) {
    const { data: ultimaFactura } = await supabase
      .from("facturas")
      .select("periodo")
      .eq("matricula_id", input.matricula_id)
      .order("periodo", { ascending: false })
      .limit(1)

    let startPeriod = new Date().toISOString().slice(0, 7)
    if (ultimaFactura && ultimaFactura.length > 0) {
      startPeriod = ultimaFactura[0].periodo
    }

    let currentYear = parseInt(startPeriod.split("-")[0])
    let currentMonth = parseInt(startPeriod.split("-")[1])

    while ((isPorCuotas && mesesRestantes > 0) || (!isPorCuotas && montoDisponible > 0)) {
      currentMonth++
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }
      const periodo = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`

      let valorAPagar = 0
      if (isPorCuotas) {
        valorAPagar = valorMensual
        mesesRestantes--
      } else {
        valorAPagar = Math.min(valorMensual, montoDisponible)
        montoDisponible -= valorAPagar
      }

      if (valorAPagar <= 0) break

      const facturaInsertObj: any = {
        matricula_id: input.matricula_id,
        periodo,
        valor_base: valorMensual,
        total: valorMensual,
        estado: valorAPagar >= valorMensual ? "pagado" : "pendiente",
        fecha_vencimiento: new Date(currentYear, currentMonth - 1, 20).toISOString().split("T")[0]
      }

      // Insertar factura
      const { data: factura, error: fError } = await supabase
        .from("facturas")
        .insert(facturaInsertObj)
        .select()
        .single()

      if (fError) throw fError

      // Registrar pago
      const { error: pError } = await supabase
        .from("pagos")
        .insert({
          factura_id: factura.id,
          valor_pagado: valorAPagar,
          metodo_pago: input.metodo_pago,
          registrado_por: input.registrado_por,
        })

      if (pError) throw pError

      results.push({ ...factura, valor_pagado: valorAPagar })
    }
  }

  return results
}

