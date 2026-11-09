import { createFileRoute } from "@tanstack/react-router";
import { RolePermissionsPage } from "../features/roles/RolePermissionsPage";

export const Route = createFileRoute("/roles")({
  component: RolePermissionsPage,
});
