export type EstadoFactura = "pendiente" | "pagado";

export interface Factura {
  id: string;
  periodo: string;
  valor_base: number;
  recargo: number;
  descuento: number;
  total: number;
  estado: EstadoFactura;
  fecha_generacion: string;
  fecha_vencimiento: string;
  created_at: string;
  matricula_id?: string | null;

  matricula?: {
    id?: string;
    numero_matricula?: string | null;
    cliente?: {
      id?: string;
      nombre?: string;
    } | null;
  } | null;
}