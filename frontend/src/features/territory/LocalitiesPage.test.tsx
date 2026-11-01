import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalitiesPage } from "./LocalitiesPage";

afterEach(() => vi.unstubAllGlobals());

describe("localidades", () => {
  it("muestra localidades y solicita la creación con los datos introducidos", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) =>
        ({
          ok: true,
          status: init?.method === "POST" ? 201 : 200,
          json: async () =>
            init?.method === "POST"
              ? { id: 2, name: "Nerja", postalCode: "29780" }
              : {
                  content: [{ id: 1, name: "Málaga", postalCode: "29001" }],
                  page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
                },
        }) as Response,
    );
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <LocalitiesPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Málaga")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Nombre", { exact: true }), "Nerja");
    await userEvent.type(screen.getByLabelText("Código postal", { exact: true }), "29780");
    await userEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/localities",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Nerja", postalCode: "29780" }),
      }),
    );
  });
});
