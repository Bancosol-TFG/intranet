import { createFileRoute } from "@tanstack/react-router";
import { SchedulePage } from "../features/stores/StoreSchedulePage";

export const Route = createFileRoute("/stores/$storeId/schedule")({
  component: SchedulePage,
});
