"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 mb-5 ring-8 ring-rose-50/50">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Ocurrió un error inesperado</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {error.message || "No pudimos cargar esta sección. Por favor intenta de nuevo."}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={reset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Reintentar
                    </Button>
                    <Link href="/">
                        <Button>Ir al inicio</Button>
                    </Link>
                </div>
                {error.digest && (
                    <p className="mt-4 text-xs text-slate-400">
                        ID: <code className="font-mono">{error.digest}</code>
                    </p>
                )}
            </div>
        </div>
    );
}
