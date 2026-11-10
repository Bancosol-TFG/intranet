import { createFileRoute } from "@tanstack/react-router";
import { ChainsPage } from "../features/stores/ChainsPage";

export const Route = createFileRoute("/chains")({
  component: ChainsPage,
});
