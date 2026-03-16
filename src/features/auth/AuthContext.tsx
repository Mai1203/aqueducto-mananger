'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type UserRole = 'admin' | 'cajero' | null

interface AuthContextType {
  user: any
  role: UserRole
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async (supabaseUser: any) => {
    try {
      if (!supabaseUser) {
        setUser(null)
        setRole(null)
        return
      }

      setUser(supabaseUser)

      const { data: perfil, error } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", supabaseUser.id)
        .single()

      if (error) {
        console.error("Error cargando perfil:", error)
      }

      setRole(perfil?.rol ?? null)
    } catch (err) {
      console.error("Excepción en loadUser:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // usuario actual
    supabase.auth.getSession().then(({ data }) => {
      loadUser(data.session?.user ?? null)
    })

    // escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await loadUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}