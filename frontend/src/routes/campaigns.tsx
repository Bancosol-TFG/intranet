import { createFileRoute } from "@tanstack/react-router";
import { CampaignsPage } from "../campaigns-page";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
});
