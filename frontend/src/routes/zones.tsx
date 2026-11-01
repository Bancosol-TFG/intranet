import { createFileRoute } from "@tanstack/react-router";
import { ZonesPage } from "../features/territory/ZonesPage";

export const Route = createFileRoute("/zones")({
  component: ZonesPage,
});
