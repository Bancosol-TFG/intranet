export type Role = {
  id: number;
  name: string;
};

export type Permission = {
  id: number;
  name: string;
  description: string | null;
};

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
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function errorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return "No tienes autorización para gestionar roles y permisos.";
  }
  if (status === 400) {
    return "Revisa los datos introducidos.";
  }
  if (status === 404) {
    return "El rol o el permiso ya no existe.";
  }
  if (status === 409) {
    return "Ya existe un rol con ese nombre.";
  }
  return "No se ha podido completar la operación.";
}

export const rolesApi = {
  listRoles() {
    const params = new URLSearchParams({ page: "0", size: "100", sort: "name,asc" });
    return request<PageResponse<Role>>(`/roles?${params.toString()}`);
  },

  createRole(name: string) {
    return request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  listPermissions() {
    return request<Permission[]>("/permissions");
  },

  listRolePermissions(roleId: number) {
    return request<Permission[]>(`/roles/${roleId}/permissions`);
  },

  assignPermission(roleId: number, permissionId: number) {
    return request<void>(`/roles/${roleId}/permissions/${permissionId}`, { method: "PUT" });
  },

  revokePermission(roleId: number, permissionId: number) {
    return request<void>(`/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" });
  },
};
