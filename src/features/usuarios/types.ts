export interface Usuario {
  id: string
  nombre: string
  cedula: string
  telefono?: string
  estado: "activo" | "suspendido"
  created_at?: string
}