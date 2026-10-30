import { clearSession, getAccessToken, startSession, type AuthResponse } from "./session";

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

const SESSION_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];
const LOGIN_PATH = "/login";

let pendingRefresh: Promise<boolean> | null = null;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response = await send(path, init);

  if (response.status === 401 && !SESSION_PATHS.includes(path)) {
    if (!(await refreshSession())) {
      window.location.assign(LOGIN_PATH);
      throw new Error("La sesión ha caducado.");
    }
    response = await send(path, init);
  }

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function refreshSession(): Promise<boolean> {
  pendingRefresh ??= renewSession().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

async function renewSession(): Promise<boolean> {
  const response = await send("/auth/refresh", { method: "POST" });
  if (!response.ok) {
    clearSession();
    return false;
  }
  startSession((await response.json()) as AuthResponse);
  return true;
}

function send(path: string, init?: RequestInit): Promise<Response> {
  const accessToken = getAccessToken();
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 401) {
    return "El correo o la contraseña no son correctos.";
  }
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
