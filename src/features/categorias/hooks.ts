import { useEffect, useState } from "react"
import { Category } from "./types"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./services"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    setLoading(true)
    const data = await getCategories()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const add = async (category: Omit<Category, "id">) => {
    await createCategory(category)
    fetchCategories()
  }

  const update = async (id: string, category: Partial<Category>) => {
    await updateCategory(id, category)
    fetchCategories()
  }

  const remove = async (id: string) => {
    await deleteCategory(id)
    fetchCategories()
  }

  return { categories, loading, add, update, remove }
}