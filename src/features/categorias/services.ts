import { supabase } from "@/lib/supabaseClient"
import { Category } from "./types"

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo categorías:", error)
    throw new Error("No se pudieron cargar las categorías.")
  }

  return data as Category[]
}

export async function createCategory(category: Omit<Category, "id">) {
  const { error } = await supabase
    .from("categorias")
    .insert([category])

  if (error) {
    console.error("Error creando categoría:", error)
    throw new Error("No se pudo crear la categoría.")
  }
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const { error } = await supabase
    .from("categorias")
    .update(category)
    .eq("id", id)

  if (error) {
    console.error("Error actualizando categoría:", error)
    throw new Error("No se pudo actualizar la categoría.")
  }
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error eliminando categoría:", error)
    throw new Error("No se pudo eliminar la categoría.")
  }
}