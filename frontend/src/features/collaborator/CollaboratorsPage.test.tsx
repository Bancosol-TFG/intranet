import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CollaboratorsPage } from "./CollaboratorsPage";

const PAGE = { size: 10, number: 0, totalElements: 1, totalPages: 1 };

afterEach(() => vi.unstubAllGlobals());

describe("colaboradores y contactos", () => {
  it("muestra los contactos del colaborador seleccionado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const content = url.includes("/contacts")
          ? [{ id: 3, name: "Ana", email: "ana@example.com", phoneNumber: null }]
          : url.includes("/localities")
            ? [{ id: 1, name: "Málaga", postalCode: "29001" }]
            : [
                {
                  id: 2,
                  name: "Asociación",
                  address: "Calle Uno",
                  localityId: 1,
                  localityName: "Málaga",
                },
              ];
        return { ok: true, status: 200, json: async () => ({ content, page: PAGE }) } as Response;
      }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <CollaboratorsPage />
      </QueryClientProvider>,
    );

    await screen.findByText("Asociación");
    await userEvent.click(screen.getByRole("button", { name: "Contactos" }));
    expect(
      await screen.findByRole("heading", { name: "Contactos de Asociación" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("ana@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(
      screen.queryByRole("heading", { name: "Contactos de Asociación" }),
    ).not.toBeInTheDocument();
  });
});
