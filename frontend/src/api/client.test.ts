import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "./client";
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

describe("cliente de API", () => {
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
