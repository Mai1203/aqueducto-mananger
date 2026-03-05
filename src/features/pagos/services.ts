import { supabase } from "@/lib/supabaseClient"

// 🔎 Buscar clientes
export async function buscarClientes(query: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre, cedula, direccion")
    .or(`nombre.ilike.%${query}%,cedula.ilike.%${query}%`)
    .limit(10)

  if (error) throw error

  return data
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