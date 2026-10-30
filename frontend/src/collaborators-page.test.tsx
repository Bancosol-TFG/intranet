import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CollaboratorsPage } from "./collaborators-page";

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CollaboratorsPage />
    </QueryClientProvider>,
  );
}
afterEach(() => vi.unstubAllGlobals());
const page = (content: unknown[], totalElements = content.length) =>
  Response.json({
    content,
    page: { size: 10, number: 0, totalElements, totalPages: totalElements ? 1 : 0 },
  });

describe("gestión de colaboradores", () => {
  it("busca localidades y crea un colaborador y un contacto", async () => {
    let collaborator: {
      id: number;
      name: string;
      address: string;
      localityId: number;
      localityName: string;
    } | null = null;
    let contact: {
      id: number;
      name: string;
      email: string | null;
      phoneNumber: string | null;
    } | null = null;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.startsWith("http://localhost:8080/collaborators?") && method === "GET")
        return page(collaborator ? [collaborator] : []);
      if (url.startsWith("http://localhost:8080/localities?") && method === "GET") {
        const search = new URL(url, "http://localhost").searchParams.get("name");
        return page(
          search?.startsWith("Sevilla")
            ? [{ id: 9, name: "Sevilla Norte" }]
            : search
              ? [{ id: 10, name: "Madrid Centro" }]
              : [{ id: 8, name: "Otra localidad" }],
        );
      }
      if (url === "http://localhost:8080/collaborators" && method === "POST") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          address: string;
          localityId: number;
        };
        collaborator = { id: 3, ...body, localityName: "Sevilla Norte" };
        return Response.json(collaborator, { status: 201 });
      }
      if (url === "http://localhost:8080/collaborators/3/contacts?page=0&size=10&sort=name,asc" && method === "GET")
        return page(contact ? [contact] : []);
      if (url === "http://localhost:8080/collaborators/3/contacts" && method === "POST") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          email: string | null;
          phoneNumber: string | null;
        };
        contact = { id: 4, ...body };
        return Response.json(contact, { status: 201 });
      }
      if (url === "http://localhost:8080/collaborators/3/contacts/4" && method === "DELETE")
        return new Response(null, { status: 500 });
      throw new Error(`Petición inesperada: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    await screen.findByText("No hay colaboradores.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Asociación Sur" } });
    fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: "Calle Uno" } });
    fireEvent.change(screen.getByLabelText("Buscar localidad"), { target: { value: "Sevilla" } });
    await screen.findByRole("option", { name: "Sevilla Norte" });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("Buscar localidad"), {
      target: { value: "Sevilla Norte" },
    });
    await screen.findByRole("option", { name: "Sevilla Norte" });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("Buscar localidad"), { target: { value: "Madrid" } });
    await screen.findByRole("option", { name: "Madrid Centro" });
    expect(screen.getByRole("combobox")).toHaveValue("9");
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByText("Asociación Sur")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/collaborators",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Asociación Sur", address: "Calle Uno", localityId: 9 }),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Contactos" }));
    fireEvent.change(screen.getAllByLabelText("Nombre")[1], { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.org" },
    });
    fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "+34 600 000 000" } });
    fireEvent.click(screen.getByRole("button", { name: "Añadir contacto" }));
    expect(await screen.findByText("ana@example.org")).toBeInTheDocument();
    const contactsPanel = screen
      .getByRole("heading", { name: "Contactos de Asociación Sur" })
      .closest("section");
    fireEvent.click(within(contactsPanel!).getByRole("button", { name: "Borrar" }));
    expect(await within(contactsPanel!).findByRole("alert")).toHaveTextContent(
      "No se ha podido completar la operación.",
    );
  });

  it("muestra el error 400 y conserva el formulario del colaborador", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("http://localhost:8080/collaborators?")) return page([]);
      if (url.startsWith("http://localhost:8080/localities?")) return page([{ id: 1, name: "Madrid" }]);
      if (url === "http://localhost:8080/collaborators" && init?.method === "POST")
        return new Response(null, { status: 400 });
      throw new Error(`Petición inesperada: ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    await screen.findByText("No hay colaboradores.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Pendiente" } });
    fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: "Calle Dos" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Revisa los datos del formulario.");
    expect(screen.getByLabelText("Nombre")).toHaveValue("Pendiente");
    expect(screen.getByLabelText("Dirección")).toHaveValue("Calle Dos");
  });
  it("edita y da de baja al colaborador y su contacto desde la interfaz", async () => {
    let collaborator: {
      id: number;
      name: string;
      address: string;
      localityId: number;
      localityName: string;
    } | null = null;
    let contact: {
      id: number;
      name: string;
      email: string | null;
      phoneNumber: string | null;
    } | null = null;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.startsWith("http://localhost:8080/collaborators?") && method === "GET")
        return page(collaborator ? [collaborator] : []);
      if (url.startsWith("http://localhost:8080/localities?") && method === "GET")
        return page([{ id: 1, name: "Madrid" }]);
      if (url === "http://localhost:8080/collaborators" && method === "POST") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          address: string;
          localityId: number;
        };
        collaborator = { id: 21, ...body, localityName: "Madrid" };
        return Response.json(collaborator, { status: 201 });
      }
      if (url === "http://localhost:8080/collaborators/21" && method === "PUT") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          address: string;
          localityId: number;
        };
        collaborator = { id: 21, ...body, localityName: "Madrid" };
        return Response.json(collaborator);
      }
      if (url === "http://localhost:8080/collaborators/21" && method === "DELETE") {
        collaborator = null;
        return new Response(null, { status: 204 });
      }
      if (url.startsWith("http://localhost:8080/collaborators/21/contacts?") && method === "GET")
        return page(contact ? [contact] : []);
      if (url === "http://localhost:8080/collaborators/21/contacts" && method === "POST") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          email: string | null;
          phoneNumber: string | null;
        };
        contact = { id: 22, ...body };
        return Response.json(contact, { status: 201 });
      }
      if (url === "http://localhost:8080/collaborators/21/contacts/22" && method === "PUT") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          email: string | null;
          phoneNumber: string | null;
        };
        contact = { id: 22, ...body };
        return Response.json(contact);
      }
      if (url === "http://localhost:8080/collaborators/21/contacts/22" && method === "DELETE") {
        contact = null;
        return new Response(null, { status: 204 });
      }
      throw new Error(`Petición inesperada: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    renderPage();
    await screen.findByText("No hay colaboradores.");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Entidad original" } });
    fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: "Calle Uno" } });
    await screen.findByRole("option", { name: "Madrid" });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByText("Entidad original")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Entidad actualizada" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Entidad actualizada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Contactos" }));
    await screen.findByText("No hay contactos.");
    fireEvent.change(screen.getAllByLabelText("Nombre")[1], {
      target: { value: "Persona original" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Añadir contacto" }));
    expect(await screen.findByText("Persona original")).toBeInTheDocument();
    const contactsPanel = screen
      .getByRole("heading", { name: "Contactos de Entidad actualizada" })
      .closest("section");
    fireEvent.click(within(contactsPanel!).getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getAllByLabelText("Nombre")[1], {
      target: { value: "Persona actualizada" },
    });
    fireEvent.click(within(contactsPanel!).getByRole("button", { name: "Guardar contacto" }));
    expect(await screen.findByText("Persona actualizada")).toBeInTheDocument();
    fireEvent.click(within(contactsPanel!).getByRole("button", { name: "Borrar" }));
    expect(await within(contactsPanel!).findByText("No hay contactos.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));
    expect(await screen.findByText("No hay colaboradores.")).toBeInTheDocument();
  });

  it("descarta el formulario de contacto al cambiar de colaborador", async () => {
    const collaborators = [
      {
        id: 31,
        name: "Primera entidad",
        address: "Calle A",
        localityId: 1,
        localityName: "Madrid",
      },
      {
        id: 32,
        name: "Segunda entidad",
        address: "Calle B",
        localityId: 1,
        localityName: "Madrid",
      },
    ];
    const firstContact = { id: 41, name: "Contacto anterior", email: null, phoneNumber: null };
    let contactForSecond: {
      id: number;
      name: string;
      email: string | null;
      phoneNumber: string | null;
    } | null = null;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.startsWith("http://localhost:8080/collaborators?") && method === "GET") return page(collaborators);
      if (url.startsWith("http://localhost:8080/localities?") && method === "GET")
        return page([{ id: 1, name: "Madrid" }]);
      if (url.startsWith("http://localhost:8080/collaborators/31/contacts?") && method === "GET")
        return page([firstContact]);
      if (url.startsWith("http://localhost:8080/collaborators/32/contacts?") && method === "GET")
        return page(contactForSecond ? [contactForSecond] : []);
      if (url === "http://localhost:8080/collaborators/32/contacts" && method === "POST") {
        const body = JSON.parse(String(init?.body)) as {
          name: string;
          email: string | null;
          phoneNumber: string | null;
        };
        contactForSecond = { id: 42, ...body };
        return Response.json(contactForSecond, { status: 201 });
      }
      throw new Error(`Petición inesperada: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    await screen.findByText("Primera entidad");
    fireEvent.click(screen.getAllByRole("button", { name: "Contactos" })[0]);
    await screen.findByText("Contacto anterior");
    const firstPanel = screen
      .getByRole("heading", { name: "Contactos de Primera entidad" })
      .closest("section")!;
    fireEvent.click(within(firstPanel).getByRole("button", { name: "Editar" }));
    const contactNameInput = screen.getAllByLabelText("Nombre")[1];
    expect(contactNameInput).toHaveValue("Contacto anterior");

    fireEvent.click(screen.getAllByRole("button", { name: "Contactos" })[1]);
    await screen.findByText("No hay contactos.");
    expect(contactNameInput).toHaveValue("");
    fireEvent.change(contactNameInput, { target: { value: "Contacto nuevo" } });
    fireEvent.click(screen.getByRole("button", { name: "Añadir contacto" }));
    expect(await screen.findByText("Contacto nuevo")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/collaborators/32/contacts",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
