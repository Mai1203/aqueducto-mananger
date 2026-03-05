'use client'

import { useState } from 'react'
import { Droplet, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'

import { useLogin } from '@/features/auth/useLogin'

export default function LoginPage() {
    const { handleLogin, isLoading, error } = useLogin()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left panel - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-sky-600/10 mix-blend-multiply"></div>
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-3 bg-sky-500/20 rounded-xl backdrop-blur-sm border border-sky-500/20">
                        <Droplet className="h-8 w-8 text-sky-400" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">AguaRural</span>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
                        Gestión inteligente<br />para tu acueducto
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Un sistema moderno y minimalista para el control de pagos, usuarios y facturación de acueductos rurales.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} AguaRural. Todos los derechos reservados.
                </div>
            </div>

            {/* Right panel - Login form */}
            <div className="flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
                <div className="w-full max-w-md space-y-8 bg-white p-8 lg:p-0 rounded-2xl lg:rounded-none shadow-sm lg:shadow-none border border-slate-100 lg:border-none">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="p-3 bg-sky-100 rounded-xl">
                                <Droplet className="h-8 w-8 text-sky-600" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">AguaRural</span>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Bienvenido de nuevo
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Ingresa tus credenciales para acceder al sistema
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (!isLoading) {
                                handleLogin(email, password)
                            }
                        }}
                        className="space-y-6 mt-8"
                    >
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-600 animate-in fade-in duration-300">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                        placeholder="admin@aguarural.co"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="password">
                                        Contraseña
                                    </label>
                                    {/*<a href="#" className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </a>*/}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
