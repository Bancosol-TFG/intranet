import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { RolePermissionsPage } from "./RolePermissionsPage";
import { rolesApi } from "./rolesApi";

vi.mock("./rolesApi", () => ({
  rolesApi: {
    listRoles: vi.fn(),
    createRole: vi.fn(),
    listPermissions: vi.fn(),
    listRolePermissions: vi.fn(),
    assignPermission: vi.fn(),
    revokePermission: vi.fn(),
  },
}));

const permission = { id: 3, name: "ZONE_LIST", description: "Consultar zonas" };
const roles = {
  content: [
    { id: 1, name: "Uno" },
    { id: 2, name: "Dos" },
  ],
  page: { size: 100, number: 0, totalElements: 2, totalPages: 1 },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(rolesApi.listRoles).mockResolvedValue(roles);
  vi.mocked(rolesApi.listPermissions).mockResolvedValue([permission]);
  vi.mocked(rolesApi.listRolePermissions).mockResolvedValue([]);
});

describe("gestión de roles", () => {
  it("crea roles y asigna y retira permisos", async () => {
    vi.mocked(rolesApi.createRole).mockResolvedValue({ id: 2, name: "Dos" });
    vi.mocked(rolesApi.assignPermission).mockResolvedValue();
    vi.mocked(rolesApi.revokePermission).mockResolvedValue();
    render(<RolePermissionsPage />);
    const checkbox = await screen.findByRole("checkbox", { name: /ZONE_LIST/ });
    await waitFor(() => expect(checkbox).toBeEnabled());
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
    expect(rolesApi.assignPermission).toHaveBeenCalledWith(1, 3);
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(rolesApi.revokePermission).toHaveBeenCalledWith(1, 3);
    fireEvent.change(screen.getByLabelText("Crear un rol"), { target: { value: " Dos " } });
    fireEvent.click(screen.getByRole("button", { name: "Crear rol" }));
    await waitFor(() => expect(rolesApi.createRole).toHaveBeenCalledWith("Dos"));
    await waitFor(() => expect(screen.getByLabelText("Rol seleccionado")).toHaveValue("2"));
  });

  it("ignora respuestas tardías al cambiar de rol", async () => {
    const first = deferred<(typeof permission)[]>();
    vi.mocked(rolesApi.listRolePermissions).mockImplementation((id) =>
      id === 1 ? first.promise : Promise.resolve([]),
    );
    render(<RolePermissionsPage />);
    await screen.findByRole("checkbox", { name: /ZONE_LIST/ });
    fireEvent.change(screen.getByLabelText("Rol seleccionado"), { target: { value: "2" } });
    await waitFor(() => expect(screen.getByRole("checkbox")).toBeEnabled());
    first.resolve([permission]);
    await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
  });

  it("impide cambiar de rol mientras se guarda una asignación", async () => {
    const pending = deferred<void>();
    vi.mocked(rolesApi.assignPermission).mockReturnValue(pending.promise);
    render(<RolePermissionsPage />);
    const checkbox = await screen.findByRole("checkbox");
    await waitFor(() => expect(checkbox).toBeEnabled());
    fireEvent.click(checkbox);
    expect(screen.getByLabelText("Rol seleccionado")).toBeDisabled();
    expect(checkbox).toBeDisabled();
    pending.resolve();
    await waitFor(() => expect(screen.getByLabelText("Rol seleccionado")).toBeEnabled());
  });

  it("muestra 403 y bloquea cambios si no se pueden consultar asignaciones", async () => {
    vi.mocked(rolesApi.listRolePermissions).mockRejectedValue(new ApiError(403, "Error"));
    render(<RolePermissionsPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No tienes autorización");
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("muestra el error de sesión caducada", async () => {
    vi.mocked(rolesApi.listRoles).mockRejectedValue(new Error("La sesión ha caducado."));
    render(<RolePermissionsPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("La sesión ha caducado.");
  });
});
