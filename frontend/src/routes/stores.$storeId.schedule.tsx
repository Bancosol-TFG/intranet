import { createFileRoute } from "@tanstack/react-router";
import { StoreSchedulePage } from "../features/stores/StoreSchedulePage";

export const Route = createFileRoute("/stores/$storeId/schedule")({
  component: SchedulePage,
});

function SchedulePage() {
  const { storeId } = Route.useParams();
  return <StoreSchedulePage storeId={Number(storeId)} />;
}
