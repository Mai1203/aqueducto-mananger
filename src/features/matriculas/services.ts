import { supabase } from "@/lib/supabaseClient"
import { Matricula } from "./types"

export async function getMatriculas(): Promise<Matricula[]> {
  const { data, error } = await supabase
    .from("matriculas")
    .select(`
      *,
      cliente:clientes (
        nombre,
        direccion
      ),
      categoria:categorias (
        nombre_categoria
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo matrículas:", error)
    throw new Error("No se pudieron cargar las matrículas.")
  }

  return data as any[] as Matricula[]
}

export async function createMatricula(matricula: Omit<Matricula, "id" | "created_at" | "cliente" | "categoria">) {
  const { error } = await supabase
    .from("matriculas")
    .insert([matricula])

  if (error) {
    console.error("Error creando matrícula:", error)
    throw new Error("No se pudo registrar la matrícula.")
  }
}

export async function updateMatricula(id: string, matricula: Partial<Omit<Matricula, "id" | "created_at" | "cliente" | "categoria">>) {
  const { error } = await supabase
    .from("matriculas")
    .update(matricula)
    .eq("id", id)

  if (error) {
    console.error("Error actualizando matrícula:", error)
    throw new Error("No se pudo actualizar la matrícula.")
  }
}

export async function deleteMatricula(id: string) {
  const { error } = await supabase
    .from("matriculas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error eliminando matrícula:", error)
    throw new Error("No se pudo eliminar la matrícula.")
  }
}
