import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // 1. Redirigir a login si no hay sesión
  if (!session && !pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Validar rol si hay sesión
  if (session) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    const role = perfil?.rol

    const adminOnlyRoutes = ['/categorias', '/facturacion', '/usuarios']
    const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Si ya tiene sesión e intenta ir al login, redirigir al inicio
    if (pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}