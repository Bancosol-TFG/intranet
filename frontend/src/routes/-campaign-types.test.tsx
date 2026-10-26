import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignTypesPage } from "../campaign-types-page";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <CampaignTypesPage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("página de tipos de campaña", () => {
  it("muestra los tipos devueltos por la API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          content: [{ id: 1, name: "Alimentación" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        }),
      ),
    );

    renderPage();

    expect(await screen.findByText("Alimentación")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("crea un tipo de campaña y refresca el listado", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") {
        return jsonResponse({ id: 2, name: "Recogida" }, 201);
      }
      return jsonResponse({
        content: [{ id: 2, name: "Recogida" }],
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    await userEvent.type(screen.getByLabelText("Nombre"), "Recogida");
    await userEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("Tipo de campaña creado.")).toBeInTheDocument();
    expect(await screen.findByText("Recogida")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/campaign-types",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Recogida" }),
      }),
    );
  });
});
