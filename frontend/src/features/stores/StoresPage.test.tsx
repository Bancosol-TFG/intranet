import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PageResponse } from "../../shared/api/client";
import { localitiesApi } from "../territory/localitiesApi";
import { zonesApi } from "../territory/zonesApi";
import { chainsApi } from "./chainsApi";
import { storesApi } from "./storesApi";
import { StoresPage } from "./StoresPage";

vi.mock("./storesApi", () => ({
  storesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));
vi.mock("./chainsApi", () => ({ chainsApi: { list: vi.fn() } }));
vi.mock("../territory/localitiesApi", () => ({ localitiesApi: { list: vi.fn() } }));
vi.mock("../territory/zonesApi", () => ({ zonesApi: { list: vi.fn() } }));

const CHAIN = { id: 7, name: "Mercadona", code: "MER" };
const LOCALITY = { id: 2, name: "Málaga", postalCode: "29001" };
const ZONE = { id: 4, name: "Centro", code: "CEN" };
const STORE = {
  id: 8,
  name: "Tienda centro",
  address: "Calle principal, 1",
  checkoutShelfs: 4,
  chain: CHAIN,
  locality: LOCALITY,
  zone: ZONE,
};

function pageResponse<T>(content: T[], number = 0, totalPages = 1): PageResponse<T> {
  return { content, page: { size: 10, number, totalElements: content.length, totalPages } };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <StoresPage />
    </QueryClientProvider>,
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(screen.getByRole("button", { name: "Crear" })).toBeEnabled());
  await user.type(screen.getByLabelText("Nombre", { exact: true }), "Tienda nueva");
  await user.type(screen.getByLabelText("Dirección"), "Calle nueva, 2");
  await user.selectOptions(screen.getByLabelText("Cadena", { exact: true }), "7");
  await user.selectOptions(screen.getByLabelText("Localidad", { exact: true }), "2");
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(storesApi.list).mockResolvedValue(pageResponse([STORE]));
  vi.mocked(chainsApi.list).mockResolvedValue(pageResponse([CHAIN]));
  vi.mocked(localitiesApi.list).mockResolvedValue(pageResponse([LOCALITY]));
  vi.mocked(zonesApi.list).mockResolvedValue(pageResponse([ZONE]));
});

afterEach(() => vi.restoreAllMocks());

describe("stores page", () => {
  it("shows store relationships and applies name and chain filters", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole("cell", { name: "Tienda centro" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Mercadona (MER)" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Málaga (29001)" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Centro (CEN)" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Filtrar por cadena")).toBeEnabled());
    await user.type(screen.getByLabelText("Buscar por nombre"), " centro ");
    await user.selectOptions(screen.getByLabelText("Filtrar por cadena"), "7");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() =>
      expect(storesApi.list).toHaveBeenCalledWith({ name: "centro", chainId: 7, page: 0 }),
    );
  });

  it("creates a store with required relationships and an optional empty zone", async () => {
    const user = userEvent.setup();
    vi.mocked(storesApi.create).mockResolvedValue({ ...STORE, zone: null });
    renderPage();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Crear" }));
    await waitFor(() =>
      expect(storesApi.create).toHaveBeenCalledWith({
        name: "Tienda nueva",
        address: "Calle nueva, 2",
        checkoutShelfs: 0,
        chainId: 7,
        localityId: 2,
        zoneId: null,
      }),
    );
    await waitFor(() => expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue(""));
  });

  it("requires a locality and rejects negative or fractional checkout counts", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillRequiredFields(user);
    await user.selectOptions(screen.getByLabelText("Localidad", { exact: true }), "");
    await user.click(screen.getByRole("button", { name: "Crear" }));
    expect(storesApi.create).not.toHaveBeenCalled();
    await user.selectOptions(screen.getByLabelText("Localidad", { exact: true }), "2");
    const checkoutInput = screen.getByLabelText("Número de cajas");
    await user.clear(checkoutInput);
    await user.type(checkoutInput, "-1");
    await user.click(screen.getByRole("button", { name: "Crear" }));
    expect(storesApi.create).not.toHaveBeenCalled();
    await user.clear(checkoutInput);
    await user.type(checkoutInput, "1.5");
    await user.click(screen.getByRole("button", { name: "Crear" }));
    expect(storesApi.create).not.toHaveBeenCalled();
  });

  it("edits a store changing its chain and locality and removing its zone", async () => {
    const user = userEvent.setup();
    const otherChain = { id: 9, name: "Carrefour", code: "CAR" };
    const otherLocality = { id: 3, name: "Nerja", postalCode: "29780" };
    vi.mocked(chainsApi.list).mockResolvedValue(pageResponse([CHAIN, otherChain]));
    vi.mocked(localitiesApi.list).mockResolvedValue(pageResponse([LOCALITY, otherLocality]));
    vi.mocked(storesApi.update).mockResolvedValue({
      ...STORE,
      chain: otherChain,
      locality: otherLocality,
      zone: null,
    });
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Editar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeEnabled(),
    );
    expect(screen.getByLabelText("Zona (opcional)")).toHaveValue("4");
    await user.selectOptions(screen.getByLabelText("Cadena", { exact: true }), "9");
    await user.selectOptions(screen.getByLabelText("Localidad", { exact: true }), "3");
    await user.selectOptions(screen.getByLabelText("Zona (opcional)"), "");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(storesApi.update).toHaveBeenCalledWith(8, {
        name: STORE.name,
        address: STORE.address,
        checkoutShelfs: 4,
        chainId: 9,
        localityId: 3,
        zoneId: null,
      }),
    );
  });

  it("keeps second-page options available in all three selectors", async () => {
    const user = userEvent.setup();
    const otherChain = { id: 9, name: "Carrefour", code: "CAR" };
    const otherLocality = { id: 3, name: "Nerja", postalCode: "29780" };
    const otherZone = { id: 5, name: "Costa", code: "COS" };
    vi.mocked(chainsApi.list).mockImplementation(async ({ page }) =>
      pageResponse(page === 0 ? [CHAIN] : [otherChain], page, 2),
    );
    vi.mocked(localitiesApi.list).mockImplementation(async ({ page }) =>
      pageResponse(page === 0 ? [LOCALITY] : [otherLocality], page, 2),
    );
    vi.mocked(zonesApi.list).mockImplementation(async ({ page }) =>
      pageResponse(page === 0 ? [ZONE] : [otherZone], page, 2),
    );
    vi.mocked(storesApi.create).mockResolvedValue(STORE);
    renderPage();
    await fillRequiredFields(user);
    await user.selectOptions(screen.getByLabelText("Cadena", { exact: true }), "9");
    await user.selectOptions(screen.getByLabelText("Localidad", { exact: true }), "3");
    await user.selectOptions(screen.getByLabelText("Zona (opcional)"), "5");
    await user.click(screen.getByRole("button", { name: "Crear" }));
    await waitFor(() =>
      expect(storesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ chainId: 9, localityId: 3, zoneId: 5 }),
      ),
    );
  });

  it("shows a conflict and preserves the entered form", async () => {
    const user = userEvent.setup();
    vi.mocked(storesApi.create).mockRejectedValue(
      new Error("La operación entra en conflicto con los datos existentes."),
    );
    renderPage();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La operación entra en conflicto con los datos existentes.",
    );
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue("Tienda nueva");
  });

  it("confirms a deletion and removes the store from the refreshed list", async () => {
    const user = userEvent.setup();
    const confirmMock = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    vi.mocked(storesApi.delete).mockImplementation(async () => {
      vi.mocked(storesApi.list).mockResolvedValue(pageResponse([]));
    });
    renderPage();
    const deleteButton = await screen.findByRole("button", { name: "Dar de baja" });
    await user.click(deleteButton);
    expect(storesApi.delete).not.toHaveBeenCalled();
    await user.click(deleteButton);
    expect(confirmMock).toHaveBeenCalledWith("¿Quieres dar de baja la tienda Tienda centro?");
    expect(await screen.findByText("No hay tiendas.")).toBeInTheDocument();
    expect(vi.mocked(storesApi.delete).mock.calls[0]?.[0]).toBe(8);
  });

  it("blocks saving and displays an error if a selector fails to load", async () => {
    vi.mocked(zonesApi.list).mockRejectedValue(new Error("No se han podido cargar las zonas."));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se han podido cargar las zonas.",
    );
    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
    expect(storesApi.create).not.toHaveBeenCalled();
  });
});
