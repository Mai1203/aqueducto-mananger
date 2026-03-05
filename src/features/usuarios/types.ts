export interface Usuario {
  id: string
  nombre: string
  cedula: string
  direccion: string
  telefono?: string
  categoria_id: string
  estado: "activo" | "suspendido"
  created_at?: string
}