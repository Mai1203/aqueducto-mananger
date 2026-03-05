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

  // Cada función propaga el error para que el componente lo capture y lo muestre
  const add = async (usuario: Omit<Usuario, "id">) => {
    await createUsuario(usuario) // throws si hay error (e.g. cédula duplicada)
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