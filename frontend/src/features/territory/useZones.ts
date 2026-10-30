import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zonesApi } from "./zonesApi";
import type { Zone } from "./territoryTypes";

type Options = {
  search: { name: string; code: string };
  page: number;
  name: string;
  code: string;
  editingZone: Zone | null;
  setPage: (page: number) => void;
  resetForm: () => void;
};
export function useZones({ search, page, name, code, editingZone, setPage, resetForm }: Options) {
  const queryClient = useQueryClient();
  const zonesQuery = useQuery({
    queryKey: ["zones", search, page],
    queryFn: () => zonesApi.list({ ...search, page }),
  });
  const refreshZones = () => queryClient.invalidateQueries({ queryKey: ["zones"] });
  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { name, code };
      return editingZone ? zonesApi.update(editingZone.id, input) : zonesApi.create(input);
    },
    onSuccess: async () => {
      setPage(0);
      resetForm();
      await refreshZones();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: zonesApi.delete,
    onSuccess: async (_, zoneId) => {
      setPage(0);
      if (editingZone?.id === zoneId) resetForm();
      await refreshZones();
    },
  });
  return { zonesQuery, saveMutation, deleteMutation };
}
