export interface DashboardMetrics {
  totalRecaudado: number
  totalPendiente: number
  facturasVencidas: number
  usuariosActivos: number
}

export interface UltimoPago {
  id: string
  valor_pagado: number
  fecha_pago: string
  cliente_nombre: string
}