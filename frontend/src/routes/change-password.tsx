import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordPage } from "../features/auth/ChangePasswordPage";

export const Route = createFileRoute("/change-password")({
  component: ChangePasswordPage,
});
