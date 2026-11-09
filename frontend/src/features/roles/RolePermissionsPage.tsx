import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../shared/api/client";
import { rolesApi, type Permission, type Role } from "./rolesApi";
import "./roles.css";

export function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [loadedRoleId, setLoadedRoleId] = useState("");
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<number[]>([]);
  const [pendingPermissionIds, setPendingPermissionIds] = useState<number[]>([]);
  const [assignmentError, setAssignmentError] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const isLoadingAssignments = Boolean(selectedRoleId) && loadedRoleId !== selectedRoleId;

  useEffect(() => {
    let isActive = true;

    Promise.all([rolesApi.listRoles(), rolesApi.listPermissions()])
      .then(([rolesResponse, availablePermissions]) => {
        if (!isActive) {
          return;
        }

        setRoles(rolesResponse.content);
        setPermissions(availablePermissions);
        setSelectedRoleId(
          (currentRoleId) => currentRoleId || String(rolesResponse.content[0]?.id ?? ""),
        );
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(displayError(error));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    let isActive = true;

    rolesApi
      .listRolePermissions(Number(selectedRoleId))
      .then((assignedPermissions) => {
        if (isActive) {
          setAssignedPermissionIds(assignedPermissions.map((permission) => permission.id));
          setLoadedRoleId(selectedRoleId);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(displayError(error));
          setAssignedPermissionIds([]);
          setAssignmentError(true);
          setLoadedRoleId(selectedRoleId);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedRoleId]);

  async function createRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    setIsCreatingRole(true);

    try {
      const createdRole = await rolesApi.createRole(roleName.trim());
      const rolesResponse = await rolesApi.listRoles();
      setRoles(rolesResponse.content);
      setAssignmentError(false);
      setLoadedRoleId("");
      setAssignedPermissionIds([]);
      setSelectedRoleId(
        rolesResponse.content.some((role) => role.id === createdRole.id)
          ? String(createdRole.id)
          : "",
      );
      setRoleName("");
      setStatusMessage(`Se ha creado el rol «${createdRole.name}».`);
    } catch (error: unknown) {
      setErrorMessage(displayError(error));
    } finally {
      setIsCreatingRole(false);
    }
  }

  async function updatePermissionAssignment(permission: Permission, isAssigned: boolean) {
    if (!selectedRoleId) {
      return;
    }

    const roleId = Number(selectedRoleId);
    setErrorMessage("");
    setStatusMessage("");
    setPendingPermissionIds((currentIds) => [...currentIds, permission.id]);

    try {
      if (isAssigned) {
        await rolesApi.assignPermission(roleId, permission.id);
        setAssignedPermissionIds((currentIds) => [...currentIds, permission.id]);
        setStatusMessage(`Se ha asignado ${permission.name} al rol seleccionado.`);
      } else {
        await rolesApi.revokePermission(roleId, permission.id);
        setAssignedPermissionIds((currentIds) => currentIds.filter((id) => id !== permission.id));
        setStatusMessage(`Se ha retirado ${permission.name} del rol seleccionado.`);
      }
    } catch (error: unknown) {
      setErrorMessage(displayError(error));
    } finally {
      setPendingPermissionIds((currentIds) => currentIds.filter((id) => id !== permission.id));
    }
  }

  return (
    <main className="page roles-page">
      <header className="page-header">
        <h1>Gestión de roles y permisos</h1>
        <p>Selecciona un rol para consultar y modificar los permisos que tiene asignados.</p>
      </header>

      {errorMessage && (
        <p className="notice notice-error" role="alert">
          {errorMessage}
        </p>
      )}
      {statusMessage && (
        <p className="notice notice-success" role="status">
          {statusMessage}
        </p>
      )}

      <section className="panel" aria-labelledby="roles-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Acceso</p>
            <h2 id="roles-heading">Roles</h2>
          </div>
          <span className="item-count">{roles.length} cargados (máximo 100)</span>
        </div>

        <form className="role-form" onSubmit={createRole}>
          <label htmlFor="role-name">Crear un rol</label>
          <div className="form-row">
            <input
              autoComplete="off"
              id="role-name"
              maxLength={100}
              onChange={(event) => setRoleName(event.target.value)}
              placeholder="Nombre del rol"
              required
              value={roleName}
            />
            <button
              disabled={
                isLoading || isCreatingRole || pendingPermissionIds.length > 0 || !roleName.trim()
              }
              type="submit"
            >
              {isCreatingRole ? "Creando…" : "Crear rol"}
            </button>
          </div>
        </form>

        <label className="role-select-label" htmlFor="role-select">
          Rol seleccionado
        </label>
        <select
          disabled={
            isLoading || roles.length === 0 || pendingPermissionIds.length > 0 || isCreatingRole
          }
          id="role-select"
          onChange={(event) => {
            setErrorMessage("");
            setStatusMessage("");
            setAssignmentError(false);
            setLoadedRoleId("");
            setAssignedPermissionIds([]);
            setSelectedRoleId(event.target.value);
          }}
          value={selectedRoleId}
        >
          {roles.length === 0 && <option value="">No hay roles disponibles</option>}
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </section>

      <section className="panel" aria-labelledby="permissions-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Permisos disponibles</p>
            <h2 id="permissions-heading">
              {roles.find((role) => String(role.id) === selectedRoleId)?.name ??
                "Selecciona un rol"}
            </h2>
          </div>
          <span className="item-count">
            {loadedRoleId === selectedRoleId && !assignmentError
              ? assignedPermissionIds.length
              : "—"}{" "}
            asignados
          </span>
        </div>

        {isLoading && <p role="status">Cargando roles y permisos…</p>}
        {!isLoading && permissions.length === 0 && <p>No hay permisos disponibles.</p>}
        {!isLoading && permissions.length > 0 && (
          <div className="permission-list" aria-busy={isLoadingAssignments}>
            {permissions.map((permission) => {
              const isAssigned =
                loadedRoleId === selectedRoleId && assignedPermissionIds.includes(permission.id);
              const isPending = pendingPermissionIds.includes(permission.id);

              return (
                <label className="permission-item" key={permission.id}>
                  <input
                    checked={isAssigned}
                    disabled={
                      !selectedRoleId ||
                      isLoadingAssignments ||
                      assignmentError ||
                      isPending ||
                      isCreatingRole
                    }
                    onChange={(event) =>
                      updatePermissionAssignment(permission, event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="permission-copy">
                    <span className="permission-name">{permission.name}</span>
                    <span className="permission-description">
                      {permission.description || "Sin descripción."}
                    </span>
                  </span>
                  {isPending && <span className="pending-indicator">Guardando…</span>}
                </label>
              );
            })}
          </div>
        )}
      </section>
      <footer className="page-footer">
        La API requiere una sesión autenticada con los permisos de gestión correspondientes.
      </footer>
    </main>
  );
}

function displayError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 403
      ? "No tienes autorización para gestionar roles y permisos."
      : error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "No se ha podido completar la operación.";
}
