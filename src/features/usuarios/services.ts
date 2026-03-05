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

export async function createUsuario(usuario: Omit<Usuario, "id">) {
  const { error } = await supabase
    .from("clientes")
    .insert([usuario])

  if (error) throw error
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