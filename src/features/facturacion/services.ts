import { supabase } from "@/lib/supabaseClient";
import { Factura } from "./types";

// 🔹 Obtener facturas
export async function getFacturas(): Promise<Factura[]> {
    const { data, error } = await supabase
        .from("facturas")
        .select(`
      *,
      matricula:matriculas (
        id,
        numero_matricula,
        cliente:clientes (
          id,
          nombre
        )
      )
    `)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data as unknown as Factura[];
}

// 🔹 Generar facturación mensual
export async function generarFacturacion(periodo: string) {
    const { data: matriculas, error } = await supabase
        .from("matriculas")
        .select(`
      id,
      categoria:categorias (
        valor_mensual
      )
    `)
        .eq("estado", "activa");

    if (error) throw new Error(error.message);

    for (const mat of matriculas) {
        const categoria = Array.isArray(mat.categoria)
            ? mat.categoria[0]
            : mat.categoria as any;

        const valorBase = categoria?.valor_mensual || 0;

        const { error: insertError } = await supabase
            .from("facturas")
            .insert({
                matricula_id: mat.id,
                periodo,
                valor_base: valorBase,
                recargo: 0,
                descuento: 0,
                total: valorBase,
                estado: "pendiente",
                fecha_vencimiento: calcularFechaVencimiento(),
            });

        if (insertError && !insertError.message.includes("duplicate")) {
            throw new Error(insertError.message);
        }
    }
}

function calcularFechaVencimiento() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 20);
    return fecha.toISOString().split("T")[0];
}