import { afterEach, describe, expect, it, vi } from "vitest";

import { chainsApi } from "./chainsApi";

const CHAIN = { id: 7, name: "Mercadona", code: "CAD-01" };
const CHAIN_PAGE = {
  content: [CHAIN],
  page: { size: 10, number: 2, totalElements: 21, totalPages: 3 },
};

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(status === 204 ? null : JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("chains API", () => {
  it("lists chains with the code filter, pagination and code ordering", async () => {
    const fetchMock = mockResponse(CHAIN_PAGE);

    await expect(chainsApi.list({ code: "CAD & 01", page: 2 })).resolves.toEqual(CHAIN_PAGE);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/chains");
    expect(Object.fromEntries(requestedUrl.searchParams)).toEqual({
      page: "2",
      size: "10",
      sort: "code,asc",
      code: "CAD & 01",
    });
  });

  it("omits the code filter when it is empty", async () => {
    const fetchMock = mockResponse(CHAIN_PAGE);

    await chainsApi.list({ code: "", page: 0 });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.has("code")).toBe(false);
    expect(requestedUrl.searchParams.get("page")).toBe("0");
  });

  it("gets a chain by its identifier", async () => {
    const fetchMock = mockResponse(CHAIN);

    await expect(chainsApi.get(7)).resolves.toEqual(CHAIN);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/chains/7");
  });

  it("creates a chain with its name and code", async () => {
    const fetchMock = mockResponse(CHAIN, 201);

    await expect(chainsApi.create({ name: "Mercadona", code: "CAD-01" })).resolves.toEqual(CHAIN);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/chains");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ name: "Mercadona", code: "CAD-01" }),
    });
  });

  it("updates the chain using PUT", async () => {
    const updatedChain = { ...CHAIN, name: "Carrefour", code: "CAD-02" };
    const fetchMock = mockResponse(updatedChain);

    await expect(chainsApi.update(7, { name: "Carrefour", code: "CAD-02" })).resolves.toEqual(
      updatedChain,
    );

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/chains/7");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify({ name: "Carrefour", code: "CAD-02" }),
    });
  });

  it("removes a chain and accepts a response with no content", async () => {
    const fetchMock = mockResponse(null, 204);

    await expect(chainsApi.remove(7)).resolves.toBeUndefined();

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/chains/7");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });

  it("preserves the shared client error when removal conflicts with existing data", async () => {
    mockResponse(null, 409);

    await expect(chainsApi.remove(7)).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "La operación entra en conflicto con los datos existentes.",
    });
  });
});
