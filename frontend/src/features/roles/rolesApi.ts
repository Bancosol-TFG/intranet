import { request, type PageResponse } from "../../shared/api/client";

export type Role = {
  id: number;
  name: string;
};

export type Permission = {
  id: number;
  name: string;
  description: string | null;
};

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
