export interface MatriculaCliente {
  id: string
  numero_matricula: string
  direccion_lote?: string | null
  estado: "activa" | "suspendida" | "inactiva"
  valor_mensual: number
  nombre_categoria?: string
}

export interface ClienteBusqueda {
  id: string
  nombre: string
  cedula: string
  matriculas: MatriculaCliente[]
}

export interface FacturaPendiente {
  id: string
  periodo: string
  total: number
  saldo_pendiente: number
  fecha_vencimiento: string
  matricula_id?: string | null
}

export interface ClienteDeuda {
  cliente: ClienteBusqueda
  matricula_id?: string | null
  deuda_total: number
  facturas: FacturaPendiente[]
}

export interface PagoInput {
  cliente_id: string
  matricula_id?: string | null
  monto: number
  metodo_pago: string
}