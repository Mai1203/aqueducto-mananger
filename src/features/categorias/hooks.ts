import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Category } from "./types"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./services"
import { useAuth } from "@/features/auth/AuthContext"

export function useCategories() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: !authLoading && !!user?.id,
  })

  const addMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Category> }) =>
      updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const add = async (category: Omit<Category, "id">) => {
    await addMutation.mutateAsync(category)
  }

  const update = async (id: string, category: Partial<Category>) => {
    await updateMutation.mutateAsync({ id, category })
  }

  const remove = async (id: string) => {
    await removeMutation.mutateAsync(id)
  }

  return { categories, loading: isLoading || authLoading, add, update, remove }
}