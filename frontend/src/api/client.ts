export type PageResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "");

if (!BACKEND_URL) {
  throw new Error("VITE_BACKEND_URL must be defined.");
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 409) {
    return "Ya existe un registro con ese nombre.";
  }
  if (response.status === 404) {
    return "El registro ya no existe.";
  }
  if (response.status === 400) {
    return "Revisa los datos del formulario.";
  }
  return "No se ha podido completar la operación.";
}
