import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "./services"
import { Usuario } from "./types"
import { useAuth } from "@/features/auth/AuthContext"

export function useUsuarios() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
    enabled: !authLoading && !!user?.id,
  })

  const addMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, usuario }: { id: string; usuario: Partial<Usuario> }) =>
      updateUsuario(id, usuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
    },
  })

  const add = async (usuario: Omit<Usuario, "id">) => {
    await addMutation.mutateAsync(usuario)
  }

  const update = async (id: string, usuario: Partial<Usuario>) => {
    await updateMutation.mutateAsync({ id, usuario })
  }

  const remove = async (id: string) => {
    await removeMutation.mutateAsync(id)
  }

  return { usuarios, loading: isLoading || authLoading, add, update, remove }
}