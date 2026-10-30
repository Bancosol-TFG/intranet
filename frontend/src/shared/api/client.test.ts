import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "./client";

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
