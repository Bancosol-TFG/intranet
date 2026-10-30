import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZonesPage } from "./zones-page";

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ZonesPage />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("gestión de zonas", () => {
  it("crea, actualiza y borra una zona desde la lista", async () => {
    let zone: { id: number; name: string; code: string } | null = null;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("http://localhost:8080/zones?") && init?.method === undefined) {
        return Response.json({
          content: zone ? [zone] : [],
          page: {
            size: 10,
            number: 0,
            totalElements: zone ? 1 : 0,
            totalPages: zone ? 1 : 0,
          },
        });
      }
      if (url === "http://localhost:8080/zones" && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { name: string; code: string };
        zone = { id: 1, ...body };
        return Response.json(zone, { status: 201 });
      }
      if (url === "http://localhost:8080/zones/1" && init?.method === "PUT") {
        zone = {
          id: 1,
          ...(JSON.parse(String(init.body)) as { name: string; code: string }),
        };
        return Response.json(zone);
      }
      if (url === "http://localhost:8080/zones/1" && init?.method === "DELETE") {
        zone = null;
        return new Response(null, { status: 204 });
      }
      throw new Error(`Petición inesperada: ${init?.method ?? "GET"} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    renderPage();

    await screen.findByText("No hay zonas.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Sevilla" } });
    fireEvent.change(screen.getByLabelText("Código"), { target: { value: "Z-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByText("Sevilla")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/zones",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Sevilla Este" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Sevilla Este")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/zones/1",
      expect.objectContaining({ method: "PUT" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));
    await waitFor(() => expect(screen.getByText("No hay zonas.")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/zones/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("vuelve a la primera página al borrar el último elemento de la última página", async () => {
    const zones = Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      name: index === 10 ? "Última zona" : `Zona ${index + 1}`,
      code: String(index + 1),
    }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("http://localhost:8080/zones?") && init?.method === undefined) {
        const page = Number(new URL(url, "http://localhost").searchParams.get("page"));
        const totalPages = Math.ceil(zones.length / 10);
        return Response.json({
          content: zones.slice(page * 10, page * 10 + 10),
          page: { size: 10, number: page, totalElements: zones.length, totalPages },
        });
      }
      if (url === "http://localhost:8080/zones/11" && init?.method === "DELETE") {
        zones.pop();
        return new Response(null, { status: 204 });
      }
      throw new Error(`Petición inesperada: ${init?.method ?? "GET"} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    renderPage();

    await screen.findByText("Página 1 de 2");
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(await screen.findByText("Última zona")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));

    await waitFor(() => expect(screen.getByText("Página 1 de 1")).toBeInTheDocument());
    expect(screen.queryByText("Última zona")).not.toBeInTheDocument();
  });

  it("muestra un error 400 y conserva los valores escritos", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith("http://localhost:8080/zones?") && init?.method === undefined) {
        return Response.json({
          content: [],
          page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
        });
      }
      if (String(input) === "http://localhost:8080/zones" && init?.method === "POST") {
        return new Response(null, { status: 400 });
      }
      throw new Error(`Petición inesperada: ${init?.method ?? "GET"} ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await screen.findByText("No hay zonas.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Nombre pendiente" } });
    fireEvent.change(screen.getByLabelText("Código"), { target: { value: "Z-02" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Revisa los datos del formulario.");
    expect(screen.getByLabelText("Nombre")).toHaveValue("Nombre pendiente");
    expect(screen.getByLabelText("Código")).toHaveValue("Z-02");
  });

  it("muestra un error 409 cuando el nombre ya existe", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith("http://localhost:8080/zones?") && init?.method === undefined) {
        return Response.json({
          content: [],
          page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
        });
      }
      if (String(input) === "http://localhost:8080/zones" && init?.method === "POST") {
        return new Response(null, { status: 409 });
      }
      throw new Error(`Petición inesperada: ${init?.method ?? "GET"} ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await screen.findByText("No hay zonas.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Zona existente" } });
    fireEvent.change(screen.getByLabelText("Código"), { target: { value: "ZN-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya existe un registro con ese nombre.",
    );
    expect(screen.getByLabelText("Nombre")).toHaveValue("Zona existente");
  });
});
