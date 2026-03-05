export type EstadoFactura = "pendiente" | "pagado";

export interface Factura {
  id: string;
  cliente_id: string;
  periodo: string;
  valor_base: number;
  recargo: number;
  descuento: number;
  total: number;
  estado: EstadoFactura;
  fecha_generacion: string;
  fecha_vencimiento: string;
  created_at: string;

  cliente?: {
    nombre: string;
  };
}