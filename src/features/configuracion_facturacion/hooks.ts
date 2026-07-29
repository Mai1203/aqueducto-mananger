import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfiguracionFacturacion } from "./types";
import {
  getConfiguracionFacturacion,
  updateConfiguracionFacturacion,
} from "./services";
import { useAuth } from "@/features/auth/AuthContext";

export function useConfiguracionFacturacion() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["configuracion_facturacion"],
    queryFn: getConfiguracionFacturacion,
    enabled: !authLoading && !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: updateConfiguracionFacturacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion_facturacion"] });
    },
  });

  const update = async (
    config: Partial<Omit<ConfiguracionFacturacion, "id" | "updated_at">>
  ) => {
    await updateMutation.mutateAsync(config);
  };

  return {
    config,
    loading: isLoading || authLoading,
    update,
    updating: updateMutation.isPending,
  };
}