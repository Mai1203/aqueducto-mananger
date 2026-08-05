export interface DashboardMetrics {
  totalRecaudado: number
  totalRecaudadoAnterior: number
  totalPendiente: number
  totalPendienteAnterior: number
  facturasVencidas: number
  facturasVencidasAnterior: number
  usuariosActivos: number
  usuariosActivosAnterior: number
}

export interface DashboardTrends {
  totalRecaudado: { value: number; isPositive: boolean }
  totalPendiente: { value: number; isPositive: boolean }
  facturasVencidas: { value: number; isPositive: boolean }
  usuariosActivos: { value: number; isPositive: boolean }
}

export interface UltimoPago {
  id: string
  valor_pagado: number
  fecha_pago: string
  cliente_nombre: string
}