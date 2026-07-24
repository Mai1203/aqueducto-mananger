export interface Matricula {
  id: string
  numero_matricula: string
  cliente_id: string
  direccion_lote?: string | null
  categoria_id?: string | null
  estado: "activa" | "suspendida" | "inactiva"
  fecha_registro?: string | null
  observaciones?: string | null
  created_at?: string
  cliente?: {
    nombre: string
  }
  categoria?: {
    nombre_categoria: string
  }
}

