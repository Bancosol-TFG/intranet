import { afterEach, describe, expect, it, vi } from "vitest";

import { scheduleExceptionsApi } from "./scheduleExceptionsApi";
import type { ScheduleExceptionRequest } from "./storesTypes";

const CLOSED_DAY: ScheduleExceptionRequest = {
  date: "2026-12-20",
  closed: true,
  openingTime: null,
  closingTime: null,
};
const OPEN_SLOT: ScheduleExceptionRequest = {
  date: "2026-12-20",
  closed: false,
  openingTime: "10:00",
  closingTime: "15:00",
};

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(status === 204 ? null : JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("schedule exceptions API", () => {
  it("sends the date range, pagination and stable ordering", async () => {
    const result = { content: [], page: { size: 100, number: 1, totalElements: 0, totalPages: 0 } };
    const fetchMock = mockResponse(result);
    await expect(
      scheduleExceptionsApi.list(8, { from: "2026-12-01", to: "2026-12-31", page: 1 }),
    ).resolves.toEqual(result);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe("/stores/8/schedule-exceptions");
    expect(url.searchParams.get("from")).toBe("2026-12-01");
    expect(url.searchParams.get("to")).toBe("2026-12-31");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("size")).toBe("100");
    expect(url.searchParams.getAll("sort")).toEqual(["date,asc", "openingTime,asc"]);
  });

  it.each([CLOSED_DAY, OPEN_SLOT])("creates a closure or opening slot", async (input) => {
    const result = { id: 12, ...input };
    const fetchMock = mockResponse(result, 201);
    await expect(scheduleExceptionsApi.create(8, input)).resolves.toEqual(result);
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe(
      "/stores/8/schedule-exceptions",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify(input),
    });
  });

  it("updates an exception within its store", async () => {
    const result = { id: 12, ...OPEN_SLOT };
    const fetchMock = mockResponse(result);
    await expect(scheduleExceptionsApi.update(8, 12, OPEN_SLOT)).resolves.toEqual(result);
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe(
      "/stores/8/schedule-exceptions/12",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify(OPEN_SLOT),
    });
  });

  it("deletes an exception with a 204 response", async () => {
    const fetchMock = mockResponse(null, 204);
    await expect(scheduleExceptionsApi.delete(8, 12)).resolves.toBeUndefined();
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe(
      "/stores/8/schedule-exceptions/12",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });

  it.each(["EXCEPTION", "WEEKLY"])(
    "gets the effective schedule preserving source %s",
    async (source) => {
      const result = { storeId: 8, date: "2026-12-20", source, closed: true, slots: [] };
      const fetchMock = mockResponse(result);
      await expect(scheduleExceptionsApi.effective(8, "2026-12-20")).resolves.toEqual(result);
      const url = new URL(String(fetchMock.mock.calls[0][0]));
      expect(url.pathname).toBe("/stores/8/schedule");
      expect(url.searchParams.get("date")).toBe("2026-12-20");
    },
  );
});
