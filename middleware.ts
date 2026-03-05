import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set(name, value, options)
        },
        remove(name, options) {
          res.cookies.set(name, '', options)
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // 🔒 1️⃣ Si no hay sesión → login
  if (!session && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🔐 2️⃣ Si hay sesión → validar rol
  if (session) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    const role = perfil?.rol

    // 🚫 Rutas solo para admin
    const adminOnlyRoutes = ['/categorias', '/facturacion', '/usuarios']

    const isAdminRoute = adminOnlyRoutes.some(route =>
      pathname.startsWith(route)
    )

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}