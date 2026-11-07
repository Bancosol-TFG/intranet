import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RolePermissionsPage } from "./role-permissions-page";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RolePermissionsPage />
  </StrictMode>,
);
