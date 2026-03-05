"use client";

import { useEffect, useState, useCallback } from "react";
import { getFacturas } from "./services";
import { Factura } from "./types";

export function useFacturas() {
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getFacturas();
            setFacturas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { facturas, loading, reload };
}