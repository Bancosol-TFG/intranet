import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { localitiesApi } from "./localitiesApi";
import type { Locality } from "./territoryTypes";

type Options = {
  search: { name: string; postalCode: string };
  page: number;
  name: string;
  postalCode: string;
  editingLocality: Locality | null;
  setPage: (page: number) => void;
  resetForm: () => void;
};
export function useLocalities({
  search,
  page,
  name,
  postalCode,
  editingLocality,
  setPage,
  resetForm,
}: Options) {
  const queryClient = useQueryClient();
  const localitiesQuery = useQuery({
    queryKey: ["localities", search, page],
    queryFn: () => localitiesApi.list({ ...search, page }),
  });
  const refreshLocalities = () => queryClient.invalidateQueries({ queryKey: ["localities"] });
  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { name, postalCode };
      return editingLocality
        ? localitiesApi.update(editingLocality.id, input)
        : localitiesApi.create(input);
    },
    onSuccess: async () => {
      setPage(0);
      resetForm();
      await refreshLocalities();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: localitiesApi.delete,
    onSuccess: async (_, localityId) => {
      setPage(0);
      if (editingLocality?.id === localityId) resetForm();
      await refreshLocalities();
    },
  });
  return { localitiesQuery, saveMutation, deleteMutation };
}
