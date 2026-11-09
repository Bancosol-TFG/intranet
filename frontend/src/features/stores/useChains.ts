import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chainsApi } from "./chainsApi";
import type { Chain } from "./storesTypes";

type Options = {
  search: string;
  page: number;
  code: string;
  editingChain: Chain | null;
  setPage: (page: number) => void;
  resetForm: () => void;
};

export function useChains({ search, page, code, editingChain, setPage, resetForm }: Options) {
  const queryClient = useQueryClient();
  const chainsQuery = useQuery({
    queryKey: ["chains", search, page],
    queryFn: () => chainsApi.list({ code: search, page }),
  });
  const refreshChains = () => queryClient.invalidateQueries({ queryKey: ["chains"] });
  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { code };
      return editingChain ? chainsApi.update(editingChain.id, input) : chainsApi.create(input);
    },
    onSuccess: async () => {
      setPage(0);
      resetForm();
      await refreshChains();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: chainsApi.remove,
    onSuccess: async (_, chainId) => {
      setPage(0);
      if (editingChain?.id === chainId) resetForm();
      await refreshChains();
    },
  });

  return { chainsQuery, saveMutation, deleteMutation };
}
