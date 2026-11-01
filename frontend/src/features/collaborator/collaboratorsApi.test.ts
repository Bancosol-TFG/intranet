import { afterEach, describe, expect, it, vi } from "vitest";
import { contactsApi } from "./collaboratorsApi";

afterEach(() => vi.unstubAllGlobals());

describe("contacts API", () => {
  it("creates a contact for the selected collaborator", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 7 }) });
    vi.stubGlobal("fetch", fetchMock);
    const input = { name: "Ana", email: null, phoneNumber: null };

    await contactsApi.create(12, input);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/collaborators/12/contacts",
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
  });
});
