'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'

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
  const router = useRouter()
  const pathname = usePathname()

  const loadUser = useCallback(async (supabaseUser: any) => {
    try {
      if (!supabaseUser) {
        setUser(null)
        setRole(null)
        setLoading(false)
        if (pathname !== '/login') {
            router.push('/login')
        }
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
  }, [router, pathname])

  useEffect(() => {
    // Carga inicial
    supabase.auth.getSession().then(({ data }) => {
      loadUser(data.session?.user ?? null)
    })

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event in Provider:", event)
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setRole(null)
          setLoading(false)
          router.push('/login')
        } else if (session) {
          loadUser(session.user)
        } else {
          setLoading(false)
        }
      }
    )

    // Escuchar foco de la ventana para validar sesión
    const handleFocus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && pathname !== '/login') {
        router.push('/login')
      } else if (session) {
        loadUser(session.user)
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadUser, router, pathname])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}