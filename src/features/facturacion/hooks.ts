"use client";

import { useEffect, useState, useCallback } from "react";
import { getFacturas } from "./services";
import { Factura } from "./types";
import { useAuth } from "@/features/auth/AuthContext"
import { supabase } from "@/lib/supabaseClient"

export function useFacturas() {
    const { user, loading: authLoading } = useAuth()
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                return;
            }
            const data = await getFacturas();
            setFacturas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (authLoading) return;
        if (!user?.id) {
            setLoading(false);
            return;
        }
        reload();

        const handleFocus = () => reload();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user?.id, authLoading, reload]);

    return { facturas, loading, reload };
}