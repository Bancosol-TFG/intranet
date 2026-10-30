import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignsPage } from "../campaigns-page";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function pageOf<T>(content: T[]) {
  return {
    content,
    page: { size: 10, number: 0, totalElements: content.length, totalPages: 1 },
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <CampaignsPage />
    </QueryClientProvider>,
  );
}

const campaignType = { id: 1, name: "Alimentación" };
const campaign = {
  id: 1,
  name: "Gran Recogida",
  campaignTypeId: 1,
  campaignTypeName: "Alimentación",
  startDate: "2026-11-02",
  endDate: "2026-11-20",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("página de campañas", () => {
  it("muestra las campañas y su tipo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("http://localhost:8080/campaign-types")) {
          return jsonResponse(pageOf([campaignType]));
        }
        return jsonResponse(pageOf([campaign]));
      }),
    );

    renderPage();

    expect(await screen.findByText("Gran Recogida")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Alimentación")).toBeInTheDocument();
    expect(within(table).getByText("2026-11-02")).toBeInTheDocument();
  });

  it("crea una campaña con tipo y fechas", async () => {
    let created = false;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("http://localhost:8080/campaign-types")) {
        return jsonResponse(pageOf([campaignType]));
      }
      if (init?.method === "POST") {
        created = true;
        return jsonResponse(campaign, 201);
      }
      return jsonResponse(pageOf(created ? [campaign] : []));
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    await screen.findAllByRole("option", { name: "Alimentación" });
    await userEvent.type(screen.getByLabelText("Nombre"), "Gran Recogida");
    await userEvent.selectOptions(screen.getAllByLabelText("Tipo de campaña")[0], "1");
    fireEvent.change(screen.getByLabelText("Fecha de inicio"), { target: { value: "2026-11-02" } });
    fireEvent.change(screen.getByLabelText("Fecha de fin"), { target: { value: "2026-11-20" } });
    await userEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("Campaña creada.")).toBeInTheDocument();
    expect(await screen.findByText("Gran Recogida")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/campaigns",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Gran Recogida",
          campaignTypeId: 1,
          startDate: "2026-11-02",
          endDate: "2026-11-20",
        }),
      }),
    );
  });
});
