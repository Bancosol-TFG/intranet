import { afterEach, describe, expect, it, vi } from "vitest";

import { schedulesApi } from "./schedulesApi";

const SLOT_REQUEST = { weekDay: 1, openingTime: "09:00", closingTime: "14:00" };
const SLOT = { id: 12, weekDay: 1, openingTime: "09:00:00", closingTime: "14:00:00" };
const WEEKLY_SCHEDULE = [
  { weekDay: 1, slots: [{ id: 12, openingTime: "09:00:00", closingTime: "14:00:00" }] },
  { weekDay: 2, slots: [] },
];

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(status === 204 ? null : JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("schedules API", () => {
  it("lists the weekly schedule for the requested store", async () => {
    const fetchMock = mockResponse(WEEKLY_SCHEDULE);

    await expect(schedulesApi.list(8)).resolves.toEqual(WEEKLY_SCHEDULE);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/stores/8/schedules");
    expect(requestedUrl.search).toBe("");
  });

  it("creates a slot with its weekday and times", async () => {
    const fetchMock = mockResponse(SLOT, 201);

    await expect(schedulesApi.create(8, SLOT_REQUEST)).resolves.toEqual(SLOT);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores/8/schedules");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify(SLOT_REQUEST),
    });
  });

  it("updates a slot within its store using PUT", async () => {
    const input = { weekDay: 2, openingTime: "10:00", closingTime: "15:00" };
    const updatedSlot = { id: 12, weekDay: 2, openingTime: "10:00:00", closingTime: "15:00:00" };
    const fetchMock = mockResponse(updatedSlot);

    await expect(schedulesApi.update(8, 12, input)).resolves.toEqual(updatedSlot);

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores/8/schedules/12");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify(input),
    });
  });

  it("deletes a slot and accepts a response with no content", async () => {
    const fetchMock = mockResponse(null, 204);

    await expect(schedulesApi.delete(8, 12)).resolves.toBeUndefined();

    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/stores/8/schedules/12");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });

  it.each([400, 404, 409])(
    "preserves HTTP status %i for feature error messages",
    async (status) => {
      mockResponse(null, status);

      await expect(schedulesApi.create(8, SLOT_REQUEST)).rejects.toMatchObject({
        name: "ApiError",
        status,
      });
    },
  );
});
