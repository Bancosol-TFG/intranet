const API_PREFIX = "/api";

export type PageResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_PREFIX}${path}`, { ...init, headers });
  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response.status));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function errorMessage(status: number): string {
  if (status === 400) return "Revisa los datos del formulario.";
  if (status === 404) return "No se ha encontrado el registro.";
  if (status === 409) return "La operación entra en conflicto con otros registros.";
  return "No se ha podido completar la operación. Inténtalo de nuevo.";
}
