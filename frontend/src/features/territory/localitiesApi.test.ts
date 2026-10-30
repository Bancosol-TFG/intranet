import { afterEach, describe, expect, it, vi } from "vitest";
import { localitiesApi } from "./localitiesApi";

afterEach(() => vi.unstubAllGlobals());

describe("localities API", () => {
  it("sends the name filter and pagination to the localities endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        content: [],
        page: { size: 10, number: 2, totalElements: 0, totalPages: 0 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await localitiesApi.list({ name: "Málaga", postalCode: "", page: 2 });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/localities");
    expect(requestedUrl.searchParams.get("name")).toBe("Málaga");
    expect(requestedUrl.searchParams.get("page")).toBe("2");
    expect(requestedUrl.searchParams.has("postalCode")).toBe(false);
  });
});
