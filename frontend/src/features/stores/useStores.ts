import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { storesApi } from "./storesApi";
import type { Store, StoreFilters, StoreRequest } from "./storesTypes";

type Options = {
  search: Omit<StoreFilters, "page">;
  page: number;
  input: StoreRequest;
  editingStore: Store | null;
  setPage: (page: number) => void;
  resetForm: () => void;
};

export function useStores({ search, page, input, editingStore, setPage, resetForm }: Options) {
  const queryClient = useQueryClient();
  const storesQuery = useQuery({
    queryKey: ["stores", search, page],
    queryFn: () => storesApi.list({ ...search, page }),
  });
  const refreshStores = () => queryClient.invalidateQueries({ queryKey: ["stores"] });
  const saveMutation = useMutation({
    mutationFn: () =>
      editingStore ? storesApi.update(editingStore.id, input) : storesApi.create(input),
    onSuccess: async () => {
      setPage(0);
      resetForm();
      await refreshStores();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: storesApi.delete,
    onSuccess: async (_, storeId) => {
      setPage(0);
      if (editingStore?.id === storeId) resetForm();
      await refreshStores();
    },
  });

  return { storesQuery, saveMutation, deleteMutation };
}
