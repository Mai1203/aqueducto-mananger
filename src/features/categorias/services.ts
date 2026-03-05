import { supabase } from "@/lib/supabaseClient"
import { Category } from "./types"

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return data as Category[]
}

export async function createCategory(category: Omit<Category, "id">) {
  const { error } = await supabase
    .from("categorias")
    .insert([category])

  if (error) throw error
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const { error } = await supabase
    .from("categorias")
    .update(category)
    .eq("id", id)

  if (error) throw error
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)

  if (error) throw error
}