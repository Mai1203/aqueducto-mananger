import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Matricula } from "./types"
import {
  getMatriculas,
  createMatricula,
  updateMatricula,
  deleteMatricula,
} from "./services"
import { useAuth } from "@/features/auth/AuthContext"

export function useMatriculas() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: matriculas = [], isLoading } = useQuery({
    queryKey: ["matriculas"],
    queryFn: getMatriculas,
    enabled: !authLoading && !!user?.id,
  })

  const addMutation = useMutation({
    mutationFn: createMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, matricula }: { id: string; matricula: Partial<Omit<Matricula, "id" | "created_at" | "cliente" | "categoria">> }) =>
      updateMatricula(id, matricula),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] })
    },
  })

  const add = async (matricula: Omit<Matricula, "id" | "created_at" | "cliente" | "categoria">) => {
    await addMutation.mutateAsync(matricula)
  }

  const update = async (id: string, matricula: Partial<Omit<Matricula, "id" | "created_at" | "cliente" | "categoria">>) => {
    await updateMutation.mutateAsync({ id, matricula })
  }

  const remove = async (id: string) => {
    await removeMutation.mutateAsync(id)
  }

  return { matriculas, loading: isLoading || authLoading, add, update, remove }
}
