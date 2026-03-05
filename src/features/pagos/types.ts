export interface ClienteBusqueda {
  id: string
  nombre: string
  cedula: string
  direccion: string
}

export interface FacturaPendiente {
  id: string
  periodo: string
  total: number
  saldo_pendiente: number
  fecha_vencimiento: string
}

export interface ClienteDeuda {
  cliente: ClienteBusqueda
  deuda_total: number
  facturas: FacturaPendiente[]
}

export interface PagoInput {
  cliente_id: string
  monto: number
  metodo_pago: string
}