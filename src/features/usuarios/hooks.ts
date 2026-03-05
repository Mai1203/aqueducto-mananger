import { useEffect, useState } from "react"
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "./services"
import { Usuario } from "./types"

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsuarios = async () => {
    setLoading(true)
    const data = await getUsuarios()
    setUsuarios(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

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