import { createFileRoute } from "@tanstack/react-router";
import { LocalitiesPage } from "../features/territory/LocalitiesPage";

export const Route = createFileRoute("/localities")({
  component: LocalitiesPage,
});
