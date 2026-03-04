import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sky-50 mb-6 ring-8 ring-sky-50/50">
                    <Droplet className="w-10 h-10 text-sky-400" />
                </div>
                <p className="text-6xl font-black text-slate-100 mb-2 leading-none">404</p>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Página no encontrada</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    La sección que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
                </p>
                <Link href="/">
                    <Button>Volver al Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
