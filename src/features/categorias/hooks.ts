import { useEffect, useState, useCallback } from "react"
import { Category } from "./types"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./services"
import { useAuth } from "@/features/auth/AuthContext"
import { supabase } from "@/lib/supabaseClient"

export function useCategories() {
  const { user, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      setLoading(false)
      return
    }
    fetchCategories()

    const handleFocus = () => fetchCategories()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id, authLoading, fetchCategories])

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