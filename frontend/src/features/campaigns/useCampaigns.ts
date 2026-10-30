import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "./campaignsApi";
import type { CampaignPayload } from "./campaignTypes";

type CampaignsOptions = {
  search: string;
  typeFilter: string;
  page: number;
  onSaveSuccess: (isEditing: boolean) => void;
  onDeleteSuccess: () => void;
  onError: (error: Error) => void;
};

type SaveCampaignInput = {
  campaignId?: number;
  payload: CampaignPayload;
};

export function useCampaigns(options: CampaignsOptions) {
  const queryClient = useQueryClient();
  const campaigns = useQuery({
    queryKey: ["campaigns", options.search, options.typeFilter, options.page],
    queryFn: () => campaignsApi.list(options.search, options.typeFilter, options.page),
  });

  const saveCampaign = useMutation({
    mutationFn: ({ campaignId, payload }: SaveCampaignInput) =>
      campaignId !== undefined
        ? campaignsApi.update(campaignId, payload)
        : campaignsApi.create(payload),
    onSuccess: async (_campaign, input) => {
      options.onSaveSuccess(input.campaignId !== undefined);
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: options.onError,
  });

  const deleteCampaign = useMutation({
    mutationFn: (campaignId: number) => campaignsApi.delete(campaignId),
    onSuccess: async () => {
      options.onDeleteSuccess();
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: options.onError,
  });

  return { campaigns, saveCampaign, deleteCampaign };
}
