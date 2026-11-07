import { afterEach, describe, expect, it, vi } from "vitest";
import { rolesApi } from "./roles-api";

type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("API de gestión de roles", () => {
  it("consulta los roles con orden y paginación", async () => {
    const rolesResponse = {
      content: [{ id: 4, name: "Coordinación" }],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    };
    const fetchMock = vi.fn<FetchFunction>(async () => jsonResponse(rolesResponse));
    vi.stubGlobal("fetch", fetchMock);

    await expect(rolesApi.listRoles()).resolves.toEqual(rolesResponse);

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string, "http://localhost");
    expect(requestUrl.pathname).toBe("/api/roles");
    expect(requestUrl.searchParams.get("page")).toBe("0");
    expect(requestUrl.searchParams.get("size")).toBe("100");
    expect(requestUrl.searchParams.get("sort")).toBe("name,asc");
  });

  it("crea un rol enviando el nombre como JSON", async () => {
    const createdRole = { id: 9, name: "Coordinación" };
    const fetchMock = vi.fn<FetchFunction>(async () => jsonResponse(createdRole, 201));
    vi.stubGlobal("fetch", fetchMock);

    await expect(rolesApi.createRole("Coordinación")).resolves.toEqual(createdRole);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/roles",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Coordinación" }),
      }),
    );
  });

  it("consulta permisos disponibles y los asignados a un rol", async () => {
    const permissions = [{ id: 3, name: "ZONE_LIST", description: "Consultar zonas" }];
    const fetchMock = vi
      .fn<FetchFunction>()
      .mockResolvedValueOnce(jsonResponse(permissions))
      .mockResolvedValueOnce(jsonResponse(permissions));
    vi.stubGlobal("fetch", fetchMock);

    await expect(rolesApi.listPermissions()).resolves.toEqual(permissions);
    await expect(rolesApi.listRolePermissions(9)).resolves.toEqual(permissions);
    expect(fetchMock.mock.calls.map(([requestUrl]) => requestUrl)).toEqual([
      "/api/permissions",
      "/api/roles/9/permissions",
    ]);
  });

  it("asigna y retira un permiso con PUT y DELETE", async () => {
    const fetchMock = vi
      .fn<FetchFunction>()
      .mockResolvedValueOnce(jsonResponse(undefined, 204))
      .mockResolvedValueOnce(jsonResponse(undefined, 204));
    vi.stubGlobal("fetch", fetchMock);

    await expect(rolesApi.assignPermission(9, 3)).resolves.toBeUndefined();
    await expect(rolesApi.revokePermission(9, 3)).resolves.toBeUndefined();
    expect(fetchMock.mock.calls.map(([, requestInit]) => requestInit?.method)).toEqual([
      "PUT",
      "DELETE",
    ]);
  });

  it("expone un error reconocible cuando la API deniega el acceso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<FetchFunction>(async () => jsonResponse({}, 403)),
    );

    await expect(rolesApi.listPermissions()).rejects.toMatchObject({
      status: 403,
      message: "No tienes autorización para gestionar roles y permisos.",
    });
  });
});
