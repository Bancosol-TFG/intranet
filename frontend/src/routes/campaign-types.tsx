import { createFileRoute } from "@tanstack/react-router";
import { CampaignTypesPage } from "../features/campaigns/CampaignTypesPage";

export const Route = createFileRoute("/campaign-types")({
  component: CampaignTypesPage,
});
