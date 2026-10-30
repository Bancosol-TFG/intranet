import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "./client";
import { clearSession, getCurrentUser } from "./session";

const SESSION = {
  accessToken: "new-token",
  expiresIn: 900,
  user: {
    id: 1,
    email: "a@b.es",
    firstName: "A",
    surname: null,
    roles: [],
    permissions: [],
    mustChangePassword: false,
  },
};

function jsonResponse(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

afterEach(() => vi.unstubAllGlobals());

describe("API client", () => {
  it("preserves the HTTP status and a general conflict message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));
    await expect(request("/example")).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "La operación entra en conflicto con los datos existentes.",
    } satisfies Partial<ApiError>);
  });

  it("handles a successful response with no content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    await expect(request<void>("/example", { method: "DELETE" })).resolves.toBeUndefined();
  });
});

describe("session renewal", () => {
  afterEach(() => {
    clearSession();
    vi.unstubAllGlobals();
  });

  it("renueva la sesión una sola vez y repite las peticiones que recibieron 401", async () => {
    const fetchMock = vi.fn((url: string, init: RequestInit) => {
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve(jsonResponse(200, SESSION));
      }
      const authorized =
        (init.headers as Record<string, string>).Authorization === "Bearer new-token";
      return Promise.resolve(authorized ? jsonResponse(200, { ok: true }) : jsonResponse(401));
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(Promise.all([request("/zones"), request("/stores")])).resolves.toEqual([
      { ok: true },
      { ok: true },
    ]);

    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/auth/refresh"))).toHaveLength(1);
    expect(getCurrentUser()?.id).toBe(1);
  });

  it("no intenta renovar la sesión cuando falla el inicio de sesión", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse(401)));
    vi.stubGlobal("fetch", fetchMock);

    await expect(request("/auth/login", { method: "POST" })).rejects.toThrow(
      "correo o la contraseña",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
