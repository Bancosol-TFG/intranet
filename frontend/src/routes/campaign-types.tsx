import { createFileRoute } from "@tanstack/react-router";
import { CampaignTypesPage } from "../campaign-types-page";

export const Route = createFileRoute("/campaign-types")({
  component: CampaignTypesPage,
});
