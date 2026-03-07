export interface IngresoMensual {
  mes: string
  ingreso: number
  proyectado: number
}

export interface ClienteMoroso {
  id: string
  nombre: string
  total_deuda: number
  facturas_pendientes: number
}