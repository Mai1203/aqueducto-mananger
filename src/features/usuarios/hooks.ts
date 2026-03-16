import { useEffect, useState, useCallback } from "react"
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "./services"
import { Usuario } from "./types"
import { useAuth } from "@/features/auth/AuthContext"
import { supabase } from "@/lib/supabaseClient"

export function useUsuarios() {
  const { user, loading: authLoading } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsuarios = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }
      const data = await getUsuarios()
      setUsuarios(data)
    } catch (error) {
      console.error("Error fetching usuarios:", error)
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
    fetchUsuarios()

    const handleFocus = () => fetchUsuarios()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id, authLoading, fetchUsuarios])

  const add = async (usuario: Omit<Usuario, "id">) => {
    await createUsuario(usuario)
    fetchUsuarios()
  }

  const update = async (id: string, usuario: Partial<Usuario>) => {
    await updateUsuario(id, usuario)
    fetchUsuarios()
  }

  const remove = async (id: string) => {
    await deleteUsuario(id)
    fetchUsuarios()
  }

  return { usuarios, loading, add, update, remove }
}