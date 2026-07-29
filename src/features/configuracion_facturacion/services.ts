import { supabase } from "@/lib/supabaseClient";
import { ConfiguracionFacturacion } from "./types";

export async function getConfiguracionFacturacion(): Promise<ConfiguracionFacturacion> {
  const { data, error } = await supabase
    .from("configuracion_facturacion")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Error obteniendo configuración de facturación:", error);
    throw new Error("No se pudo cargar la configuración de facturación.");
  }

  if (!data) {
    throw new Error("No se encontró la configuración de facturación.");
  }

  return data as ConfiguracionFacturacion;
}

export async function updateConfiguracionFacturacion(
  config: Partial<Omit<ConfiguracionFacturacion, "id" | "updated_at">>
): Promise<ConfiguracionFacturacion> {
  const { data, error } = await supabase
    .from("configuracion_facturacion")
    .update(config)
    .eq("id", 1)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error actualizando configuración de facturación:", error);
    throw new Error("No se pudo actualizar la configuración de facturación.");
  }

  if (!data) {
    throw new Error("No se encontró la configuración de facturación.");
  }

  return data as ConfiguracionFacturacion;
}