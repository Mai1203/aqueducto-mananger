import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from './auth.service'

export function useLogin() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await loginUser(email, password)

      if (data.session) {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}