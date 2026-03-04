import { Bell, User } from "lucide-react";

interface TopbarProps {
    title?: string;
}

export function Topbar({ title }: TopbarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Spacer for mobile hamburger button */}
            <div className="w-10 md:hidden" />

            {title && (
                <h1 className="text-base font-semibold text-slate-900 md:hidden truncate">{title}</h1>
            )}

            <div className="flex flex-1 items-center justify-end gap-x-4">
                <button
                    type="button"
                    className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Notificaciones"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                </button>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                <button className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 ring-2 ring-sky-100">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 group-hover:text-slate-900 pr-1">
                        Administrador
                    </span>
                </button>
            </div>
        </header>
    );
}
