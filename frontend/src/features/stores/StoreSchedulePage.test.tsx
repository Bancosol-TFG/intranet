import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../shared/api/client";
import { schedulesApi } from "./schedulesApi";
import { scheduleExceptionsApi } from "./scheduleExceptionsApi";
import { storesApi } from "./storesApi";
import { StoreSchedulePage } from "./StoreSchedulePage";

vi.mock("./storesApi", () => ({ storesApi: { get: vi.fn() } }));
vi.mock("./schedulesApi", () => ({
  schedulesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));
vi.mock("./scheduleExceptionsApi", () => ({
  scheduleExceptionsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    effective: vi.fn(),
  },
}));

const SLOT = { id: 12, openingTime: "09:00:00", closingTime: "14:00:00" };
const STORE = {
  id: 8,
  name: "Tienda centro",
  address: "Calle principal",
  checkoutShelfs: 4,
  chain: { id: 7, name: "Mercadona", code: "MER" },
  locality: { id: 2, name: "Málaga", postalCode: "29001" },
  zone: null,
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rootRoute = createRootRoute();
  const scheduleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/stores/$storeId/schedule",
    component: () => <StoreSchedulePage storeId={8} />,
  });
  const storesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/stores",
    component: () => <h1>Tiendas</h1>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([storesRoute, scheduleRoute]),
    history: createMemoryHistory({ initialEntries: ["/stores/8/schedule"] }),
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(storesApi.get).mockResolvedValue(STORE);
  vi.mocked(schedulesApi.list).mockResolvedValue([{ weekDay: 1, slots: [SLOT] }]);
  vi.mocked(scheduleExceptionsApi.list).mockResolvedValue({
    content: [],
    page: { size: 100, number: 0, totalElements: 0, totalPages: 0 },
  });
  vi.mocked(scheduleExceptionsApi.effective).mockImplementation(async (storeId, date) => ({
    storeId,
    date,
    source: "WEEKLY",
    closed: false,
    slots: [{ openingTime: "09:00:00", closingTime: "14:00:00" }],
  }));
});

describe("schedule exceptions", () => {
  it("creates two opening slots on the selected date", async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleExceptionsApi.create).mockImplementation(async (_storeId, input) => ({
      id: 20,
      ...input,
    }));
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Añadir excepción" }));
    await user.type(screen.getByLabelText("Fecha de excepción"), "2031-05-12");
    await user.click(
      within(screen.getByRole("form", { name: "Nueva excepción" })).getByRole("button", {
        name: "Añadir tramo",
      }),
    );
    await user.type(screen.getByLabelText("Apertura del tramo 1"), "10:00");
    await user.type(screen.getByLabelText("Cierre del tramo 1"), "15:00");
    await user.click(
      within(screen.getByRole("form", { name: "Nueva excepción" })).getByRole("button", {
        name: "Añadir tramo",
      }),
    );
    await user.type(screen.getByLabelText("Apertura del tramo 2"), "17:00");
    await user.type(screen.getByLabelText("Cierre del tramo 2"), "21:00");
    await user.click(screen.getByRole("button", { name: "Guardar excepción" }));
    await waitFor(() => expect(scheduleExceptionsApi.create).toHaveBeenCalledTimes(2));
    expect(scheduleExceptionsApi.create).toHaveBeenCalledWith(8, {
      date: "2031-05-12",
      closed: false,
      openingTime: "10:00",
      closingTime: "15:00",
    });
    expect(scheduleExceptionsApi.create).toHaveBeenCalledWith(8, {
      date: "2031-05-12",
      closed: false,
      openingTime: "17:00",
      closingTime: "21:00",
    });
  });

  it("creates a closure without hours", async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleExceptionsApi.create).mockImplementation(async (_storeId, input) => ({
      id: 20,
      ...input,
    }));
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Añadir excepción" }));
    await user.type(screen.getByLabelText("Fecha de excepción"), "2031-05-12");
    await user.click(screen.getByRole("checkbox", { name: "Cerrado todo el día" }));
    await user.click(screen.getByRole("button", { name: "Guardar excepción" }));
    await waitFor(() =>
      expect(scheduleExceptionsApi.create).toHaveBeenCalledWith(8, {
        date: "2031-05-12",
        closed: true,
        openingTime: null,
        closingTime: null,
      }),
    );
  });

  it("removes a slot when editing an exception day", async () => {
    const user = userEvent.setup();
    vi.mocked(scheduleExceptionsApi.list).mockResolvedValue({
      content: [
        {
          id: 20,
          date: "2031-05-12",
          closed: false,
          openingTime: "10:00:00",
          closingTime: "15:00:00",
        },
        {
          id: 21,
          date: "2031-05-12",
          closed: false,
          openingTime: "17:00:00",
          closingTime: "21:00:00",
        },
      ],
      page: { size: 100, number: 0, totalElements: 2, totalPages: 1 },
    });
    vi.mocked(scheduleExceptionsApi.delete).mockResolvedValue(undefined);
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Editar día" }));
    await user.click(screen.getByRole("button", { name: "Quitar tramo 2" }));
    await user.click(screen.getByRole("button", { name: "Guardar excepción" }));
    await waitFor(() => expect(scheduleExceptionsApi.delete).toHaveBeenCalledWith(8, 21));
    expect(scheduleExceptionsApi.update).not.toHaveBeenCalled();
  });

  it("shows the source and hours of an effective exception", async () => {
    vi.mocked(scheduleExceptionsApi.effective).mockImplementation(async (storeId, date) => ({
      storeId,
      date,
      source: "EXCEPTION",
      closed: false,
      slots: [{ openingTime: "10:00:00", closingTime: "15:00:00" }],
    }));
    renderPage();
    expect(await screen.findByText("Origen: Excepción")).toBeInTheDocument();
    expect(screen.getByText("10:00–15:00")).toBeInTheDocument();
  });
});
afterEach(() => vi.restoreAllMocks());

describe("store weekly schedule", () => {
  it("shows all seven days, closed days and a link back to stores", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(
      await screen.findByRole("heading", { name: "Horario de Tienda centro" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("09:00–14:00")).toBeInTheDocument();
    expect(screen.getAllByText("Cerrado")).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "Añadir tramo" })).toHaveLength(7);
    await user.click(screen.getByRole("link", { name: "Volver a tiendas" }));
    expect(await screen.findByRole("heading", { name: "Tiendas" })).toBeInTheDocument();
  });

  it("creates an additional slot using HH:mm and refreshes the day", async () => {
    const user = userEvent.setup();
    vi.mocked(schedulesApi.create).mockImplementation(async (_storeId, input) => {
      const created = { id: 13, ...input };
      vi.mocked(schedulesApi.list).mockResolvedValue([{ weekDay: 1, slots: [SLOT, created] }]);
      return created;
    });
    renderPage();
    const monday = await screen.findByRole("region", { name: "Lunes" });
    await user.click(within(monday).getByRole("button", { name: "Añadir tramo" }));
    await user.type(screen.getByLabelText("Hora de apertura"), "17:00");
    await user.type(screen.getByLabelText("Hora de cierre"), "21:00");
    await user.click(screen.getByRole("button", { name: "Crear tramo" }));
    await waitFor(() =>
      expect(schedulesApi.create).toHaveBeenCalledWith(8, {
        weekDay: 1,
        openingTime: "17:00",
        closingTime: "21:00",
      }),
    );
    expect(await screen.findByText("17:00–21:00")).toBeInTheDocument();
  });

  it("edits a slot with normalized times", async () => {
    const user = userEvent.setup();
    vi.mocked(schedulesApi.update).mockResolvedValue({
      ...SLOT,
      weekDay: 1,
      closingTime: "15:00:00",
    });
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Editar tramo" }));
    expect(screen.getByLabelText("Hora de apertura")).toHaveValue("09:00");
    await user.clear(screen.getByLabelText("Hora de cierre"));
    await user.type(screen.getByLabelText("Hora de cierre"), "15:00");
    await user.click(screen.getByRole("button", { name: "Guardar tramo" }));
    await waitFor(() =>
      expect(schedulesApi.update).toHaveBeenCalledWith(8, 12, {
        weekDay: 1,
        openingTime: "09:00",
        closingTime: "15:00",
      }),
    );
  });

  it("deletes a confirmed slot and displays the day as closed", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(schedulesApi.delete).mockImplementation(async () => {
      vi.mocked(schedulesApi.list).mockResolvedValue([]);
    });
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Borrar tramo" }));
    await waitFor(() => expect(schedulesApi.delete).toHaveBeenCalledWith(8, 12));
    await waitFor(() => expect(screen.getAllByText("Cerrado")).toHaveLength(7));
  });

  it("shows the overlap error and preserves the slot editor", async () => {
    const user = userEvent.setup();
    vi.mocked(schedulesApi.update).mockRejectedValue(new ApiError(409, "Conflict"));
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Editar tramo" }));
    await user.click(screen.getByRole("button", { name: "Guardar tramo" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El tramo se solapa con otro del mismo día",
    );
    expect(screen.getByLabelText("Hora de apertura")).toHaveValue("09:00");
  });

  it("replaces the schedule with the missing store message on 404", async () => {
    vi.mocked(storesApi.get).mockRejectedValue(new ApiError(404, "Not found"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("La tienda no existe");
    expect(screen.queryByRole("heading", { name: "Horario semanal" })).not.toBeInTheDocument();
    expect(schedulesApi.list).not.toHaveBeenCalled();
  });
});
