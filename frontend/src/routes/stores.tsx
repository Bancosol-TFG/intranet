import { createFileRoute } from "@tanstack/react-router";
import { StoresPage } from "../features/stores/StoresPage";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});
