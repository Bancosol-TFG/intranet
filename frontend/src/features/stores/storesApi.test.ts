import { afterEach, describe, expect, it, vi } from "vitest";

import { storesApi } from "./storesApi";
import type { StoreRequest } from "./storesTypes";

const STORE = {
  id: 8,
  name: "Centro",
  address: "Calle principal, 1",
  checkoutShelfs: 4,
  chain: { id: 7, name: "Mercadona", code: "MER" },
  locality: { id: 2, name: "Málaga", postalCode: "29001" },
  zone: null,
};
const STORE_REQUEST: StoreRequest = {
  name: STORE.name,
  address: STORE.address,
  checkoutShelfs: STORE.checkoutShelfs,
  chainId: STORE.chain.id,
  localityId: STORE.locality.id,
  zoneId: null,
};
const STORE_PAGE = {
  content: [STORE],
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

describe("stores API", () => {
  it("lists stores with the name and chain filters, pagination and ordering", async () => {
    const fetchMock = mockResponse(STORE_PAGE);

    await expect(storesApi.list({ name: "Centro & Málaga", chainId: 7, page: 2 })).resolves.toEqual(
      STORE_PAGE,
    );

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/stores");
    expect(Object.fromEntries(requestedUrl.searchParams)).toEqual({
      page: "2",
      size: "10",
      sort: "name,asc",
      name: "Centro & Málaga",
      chainId: "7",
    });
  });

  it("omits empty filters", async () => {
    const fetchMock = mockResponse(STORE_PAGE);

    await storesApi.list({ name: "", chainId: null, page: 0 });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.has("name")).toBe(false);
    expect(requestedUrl.searchParams.has("chainId")).toBe(false);
  });

  it("gets a store with its chain, locality and optional zone", async () => {
    const fetchMock = mockResponse(STORE);

    await expect(storesApi.get(8)).resolves.toEqual(STORE);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores/8");
  });

  it("creates a store with a required locality and no zone", async () => {
    const fetchMock = mockResponse(STORE, 201);

    await expect(storesApi.create(STORE_REQUEST)).resolves.toEqual(STORE);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify(STORE_REQUEST),
    });
  });

  it("updates the chain, locality and zone using PUT", async () => {
    const input = { ...STORE_REQUEST, chainId: 9, localityId: 3, zoneId: 4 };
    const updatedStore = {
      ...STORE,
      chain: { id: 9, name: "Carrefour", code: "CAR" },
      locality: { id: 3, name: "Nerja", postalCode: "29780" },
      zone: { id: 4, name: "Costa", code: "COS" },
    };
    const fetchMock = mockResponse(updatedStore);

    await expect(storesApi.update(8, input)).resolves.toEqual(updatedStore);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores/8");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify(input),
    });
  });

  it("deletes a store and accepts a response with no content", async () => {
    const fetchMock = mockResponse(null, 204);

    await expect(storesApi.delete(8)).resolves.toBeUndefined();

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores/8");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });

  it("preserves the shared error when the store name conflicts", async () => {
    mockResponse(null, 409);

    await expect(storesApi.create(STORE_REQUEST)).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
    });
  });
});
