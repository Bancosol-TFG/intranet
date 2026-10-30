import { createFileRoute } from "@tanstack/react-router";
import { CollaboratorsPage } from "../features/collaborator/CollaboratorsPage";
export const Route = createFileRoute("/collaborators")({ component: CollaboratorsPage });
