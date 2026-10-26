import { createFileRoute } from "@tanstack/react-router";
import { CollaboratorsPage } from "../collaborators-page";
export const Route = createFileRoute("/collaborators")({ component: CollaboratorsPage });
