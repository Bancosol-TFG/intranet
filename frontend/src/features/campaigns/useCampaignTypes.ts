import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignTypesApi } from "./campaignTypesApi";
import type { CampaignType } from "./campaignTypes";

type Options = {
  search: string;
  page: number;
  name: string;
  editing: CampaignType | null;
  setMessage: (message: string) => void;
  cancelEditing: () => void;
};
export function useCampaignTypes({
  search,
  page,
  name,
  editing,
  setMessage,
  cancelEditing,
}: Options) {
  const queryClient = useQueryClient();
  const campaignTypes = useQuery({
    queryKey: ["campaign-types", search, page],
    queryFn: () => campaignTypesApi.list(search, page),
  });

  const saveCampaignType = useMutation({
    mutationFn: () =>
      editing ? campaignTypesApi.update(editing.id, { name }) : campaignTypesApi.create({ name }),
    onSuccess: async () => {
      setMessage(editing ? "Tipo de campaña actualizado." : "Tipo de campaña creado.");
      cancelEditing();
      await queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
    },
    onError: (error) => setMessage(error.message),
  });

  const deleteCampaignType = useMutation({
    mutationFn: (campaignTypeId: number) => campaignTypesApi.delete(campaignTypeId),
    onSuccess: async () => {
      setMessage("Tipo de campaña eliminado.");
      await queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
    },
    onError: (error) => setMessage(error.message),
  });

  return { campaignTypes, saveCampaignType, deleteCampaignType };
}

export function useAllCampaignTypes() {
  return useQuery({
    queryKey: ["campaign-types", "all"],
    queryFn: () => campaignTypesApi.listAll(),
  });
}
