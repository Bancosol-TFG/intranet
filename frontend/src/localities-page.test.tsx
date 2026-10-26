import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalitiesPage } from "./localities-page";

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalitiesPage />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("gestión de localidades", () => {
  it("crea, actualiza y borra una localidad desde la lista", async () => {
    let locality: { id: number; name: string; postalCode: string } | null = null;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("/api/localities?") && init?.method === undefined) {
        return Response.json({
          content: locality ? [locality] : [],
          page: {
            size: 10,
            number: 0,
            totalElements: locality ? 1 : 0,
            totalPages: locality ? 1 : 0,
          },
        });
      }
      if (url === "/api/localities" && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { name: string; postalCode: string };
        locality = { id: 1, ...body };
        return Response.json(locality, { status: 201 });
      }
      if (url === "/api/localities/1" && init?.method === "PUT") {
        locality = {
          id: 1,
          ...(JSON.parse(String(init.body)) as { name: string; postalCode: string }),
        };
        return Response.json(locality);
      }
      if (url === "/api/localities/1" && init?.method === "DELETE") {
        locality = null;
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

    await screen.findByText("No hay localidades.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Sevilla" } });
    fireEvent.change(screen.getByLabelText("Código postal"), { target: { value: "41001" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByText("Sevilla")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/localities",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Sevilla Este" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Sevilla Este")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/localities/1",
      expect.objectContaining({ method: "PUT" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));
    await waitFor(() => expect(screen.getByText("No hay localidades.")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/localities/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("vuelve a la primera página al borrar el último elemento de la última página", async () => {
    const localities = Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      name: index === 10 ? "Última localidad" : `Localidad ${index + 1}`,
      postalCode: String(index + 1),
    }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("/api/localities?") && init?.method === undefined) {
        const page = Number(new URL(url, "http://localhost").searchParams.get("page"));
        const totalPages = Math.ceil(localities.length / 10);
        return Response.json({
          content: localities.slice(page * 10, page * 10 + 10),
          page: { size: 10, number: page, totalElements: localities.length, totalPages },
        });
      }
      if (url === "/api/localities/11" && init?.method === "DELETE") {
        localities.pop();
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
    expect(await screen.findByText("Última localidad")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));

    await waitFor(() => expect(screen.getByText("Página 1 de 1")).toBeInTheDocument());
    expect(screen.queryByText("Última localidad")).not.toBeInTheDocument();
  });

  it("muestra un error 400 y conserva los valores escritos", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith("/api/localities?") && init?.method === undefined) {
        return Response.json({
          content: [],
          page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
        });
      }
      if (String(input) === "/api/localities" && init?.method === "POST") {
        return new Response(null, { status: 400 });
      }
      throw new Error(`Petición inesperada: ${init?.method ?? "GET"} ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await screen.findByText("No hay localidades.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Nombre pendiente" } });
    fireEvent.change(screen.getByLabelText("Código postal"), { target: { value: "00123" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Revisa los datos del formulario.");
    expect(screen.getByLabelText("Nombre")).toHaveValue("Nombre pendiente");
    expect(screen.getByLabelText("Código postal")).toHaveValue("00123");
  });
});
