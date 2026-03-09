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
    if (!supabaseUser) {
      setUser(null)
      setRole(null)
      setLoading(false)
      return
    }

    setUser(supabaseUser)

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', supabaseUser.id)
      .single()

    setRole(perfil?.rol ?? null)
    setLoading(false)
  }

  useEffect(() => {
    // usuario actual
    supabase.auth.getUser().then(({ data }) => {
      loadUser(data.user)
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