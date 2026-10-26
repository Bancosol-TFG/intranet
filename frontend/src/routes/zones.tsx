import { createFileRoute } from "@tanstack/react-router";
import { ZonesPage } from "../zones-page";

export const Route = createFileRoute("/zones")({
  component: ZonesPage,
});
