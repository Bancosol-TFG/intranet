import { createFileRoute } from "@tanstack/react-router";
import { LocalitiesPage } from "../localities-page";

export const Route = createFileRoute("/localities")({
  component: LocalitiesPage,
});
