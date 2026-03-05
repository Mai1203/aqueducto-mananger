import { supabase } from "@/lib/supabaseClient"
import { Usuario } from "./types"

export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select(`
      *,
      categorias (
        id,
        nombre_categoria
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Usuario[]
}

function parseSbError(error: { code?: string; message: string }): Error {
  // Violación de restricción UNIQUE (PostgreSQL code 23505)
  if (error.code === "23505") {
    if (error.message.includes("cedula")) {
      return new Error("Ya existe un usuario con esa cédula.")
    }
    return new Error("Ya existe un registro con ese valor único.")
  }
  return new Error(error.message)
}

export async function createUsuario(usuario: Omit<Usuario, "id">) {
  const { error } = await supabase
    .from("clientes")
    .insert([usuario])

  if (error) throw parseSbError(error)
}

export async function updateUsuario(id: string, usuario: Partial<Usuario>) {
  const { error } = await supabase
    .from("clientes")
    .update(usuario)
    .eq("id", id)

  if (error) throw error
}

export async function deleteUsuario(id: string) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id)

  if (error) throw error
}