'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session && pathname !== '/login') {
                router.push('/login')
            } else {
                setIsLoading(false)
            }
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!session && pathname !== '/login') {
                    router.push('/login')
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [router, pathname])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return <>{children}</>
}
