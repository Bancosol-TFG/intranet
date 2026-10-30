import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createZone, deleteZone, listZones, updateZone, type Zone } from "./zones-api";

export function ZonesPage() {
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [search, setSearch] = useState({ name: "", code: "" });
  const [page, setPage] = useState(0);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const zonesQuery = useQuery({
    queryKey: ["zones", search, page],
    queryFn: () => listZones({ ...search, page }),
  });
  const refreshZones = () => queryClient.invalidateQueries({ queryKey: ["zones"] });
  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { name, code };
      return editingZone ? updateZone(editingZone.id, input) : createZone(input);
    },
    onSuccess: async () => {
      setPage(0);
      resetForm();
      await refreshZones();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteZone,
    onSuccess: async (_, zoneId) => {
      setPage(0);
      if (editingZone?.id === zoneId) resetForm();
      await refreshZones();
    },
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const zones = zonesQuery.data?.content ?? [];
  const totalPages = zonesQuery.data?.page.totalPages ?? 0;

  function resetForm() {
    setEditingZone(null);
    setName("");
    setCode("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function beginEdit(zone: Zone) {
    setEditingZone(zone);
    setName(zone.name);
    setCode(zone.code);
  }

  function removeZone(zone: Zone) {
    if (window.confirm(`¿Quieres borrar la zona ${zone.name}?`)) deleteMutation.mutate(zone.id);
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch({ name: nameFilter.trim(), code: codeFilter.trim() });
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Zonas</h1>
        <p>Gestiona las zonas y sus códigos.</p>
      </header>
      <section className="panel" aria-labelledby="zone-form-title">
        <h2 id="zone-form-title">{editingZone ? "Editar zona" : "Crear zona"}</h2>
        <form className="form-grid" onSubmit={submitForm}>
          <label>
            Nombre
            <input required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Código
            <input required value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
          <div className="actions">
            <button type="submit" disabled={busy}>
              {editingZone ? "Guardar cambios" : "Crear"}
            </button>
            {editingZone && (
              <button type="button" disabled={busy} onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
        {saveMutation.isError && (
          <p className="error-message" role="alert">
            {saveMutation.error.message}
          </p>
        )}
      </section>
      <section className="panel" aria-labelledby="zone-list-title">
        <h2 id="zone-list-title">Listado</h2>
        <form className="form-grid" onSubmit={applySearch}>
          <label>
            Buscar por nombre
            <input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} />
          </label>
          <label>
            Buscar por código
            <input value={codeFilter} onChange={(event) => setCodeFilter(event.target.value)} />
          </label>
          <button type="submit">Buscar</button>
        </form>
        {zonesQuery.isPending && (
          <p className="status" role="status">
            Cargando zonas…
          </p>
        )}
        {zonesQuery.isError && (
          <p className="error-message" role="alert">
            {zonesQuery.error.message}
          </p>
        )}
        {zonesQuery.isSuccess && zones.length === 0 && (
          <p className="status" role="status">
            No hay zonas.
          </p>
        )}
        {zonesQuery.isSuccess && zones.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td>{zone.name}</td>
                    <td>{zone.code}</td>
                    <td className="actions">
                      <button type="button" disabled={busy} onClick={() => beginEdit(zone)}>
                        Editar
                      </button>
                      <button type="button" disabled={busy} onClick={() => removeZone(zone)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav className="pagination" aria-label="Paginación de zonas">
          <button type="button" disabled={page === 0 || busy} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span role="status">
            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages || busy}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </nav>
        {deleteMutation.isError && (
          <p className="error-message" role="alert">
            {deleteMutation.error.message}
          </p>
        )}
      </section>
    </main>
  );
}
