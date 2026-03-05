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

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', user.id)
          .single()

        setRole(perfil?.rol ?? null)
      }

      setLoading(false)
    }

    loadUser()
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