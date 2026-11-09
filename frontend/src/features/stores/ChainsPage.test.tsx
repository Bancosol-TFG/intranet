import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { chainsApi } from "./chainsApi";
import { ChainsPage } from "./ChainsPage";

vi.mock("./chainsApi", () => ({
  chainsApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const CHAIN = { id: 7, name: "Mercadona", code: "MER" };
const CHAIN_PAGE = {
  content: [CHAIN],
  page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ChainsPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(chainsApi.list).mockResolvedValue(CHAIN_PAGE);
});

afterEach(() => vi.restoreAllMocks());

describe("chains page", () => {
  it("shows the name and code and applies the code filter", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole("cell", { name: "Mercadona" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "MER" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Buscar por código"), " MER ");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => expect(chainsApi.list).toHaveBeenCalledWith({ code: "MER", page: 0 }));
  });

  it("requires both fields and creates a chain with its name and code", async () => {
    const user = userEvent.setup();
    vi.mocked(chainsApi.create).mockResolvedValue({ id: 8, name: "Carrefour", code: "CAR" });
    renderPage();

    expect(screen.getByLabelText("Nombre")).toBeRequired();
    expect(screen.getByLabelText("Código", { exact: true })).toBeRequired();
    await user.click(screen.getByRole("button", { name: "Crear" }));
    expect(chainsApi.create).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Nombre"), "Carrefour");
    await user.click(screen.getByRole("button", { name: "Crear" }));
    expect(chainsApi.create).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Código", { exact: true }), "CAR");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() =>
      expect(chainsApi.create).toHaveBeenCalledWith({ name: "Carrefour", code: "CAR" }),
    );
    await waitFor(() => expect(screen.getByLabelText("Nombre")).toHaveValue(""));
    expect(screen.getByLabelText("Código", { exact: true })).toHaveValue("");
  });

  it("loads both fields for editing and saves the changed name", async () => {
    const user = userEvent.setup();
    vi.mocked(chainsApi.update).mockResolvedValue({ ...CHAIN, name: "Carrefour" });
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText("Nombre")).toHaveValue("Mercadona");
    expect(screen.getByLabelText("Código", { exact: true })).toHaveValue("MER");
    await user.clear(screen.getByLabelText("Nombre"));
    await user.type(screen.getByLabelText("Nombre"), "Carrefour");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(chainsApi.update).toHaveBeenCalledWith(7, { name: "Carrefour", code: "MER" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Crear cadena" })).toBeInTheDocument(),
    );
  });

  it("confirms a removal with the name and code and refreshes the list", async () => {
    const user = userEvent.setup();
    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(chainsApi.remove).mockImplementation(async () => {
      vi.mocked(chainsApi.list).mockResolvedValue({
        content: [],
        page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
      });
    });
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Dar de baja" }));

    expect(confirmMock).toHaveBeenCalledWith("¿Quieres dar de baja la cadena Mercadona (MER)?");
    await waitFor(() => expect(vi.mocked(chainsApi.remove).mock.calls[0]?.[0]).toBe(7));
    expect(await screen.findByText("No hay cadenas.")).toBeInTheDocument();
  });

  it("shows a save conflict and preserves the entered values", async () => {
    const user = userEvent.setup();
    vi.mocked(chainsApi.create).mockRejectedValue(
      new Error("La operación entra en conflicto con los datos existentes."),
    );
    renderPage();
    await user.type(screen.getByLabelText("Nombre"), "Carrefour");
    await user.type(screen.getByLabelText("Código", { exact: true }), "MER");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La operación entra en conflicto con los datos existentes.",
    );
    expect(screen.getByLabelText("Nombre")).toHaveValue("Carrefour");
    expect(screen.getByLabelText("Código", { exact: true })).toHaveValue("MER");
  });
});
