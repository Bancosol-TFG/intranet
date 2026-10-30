import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLocality,
  deleteLocality,
  listLocalities,
  updateLocality,
  type Locality,
} from "./localities-api";

export function LocalitiesPage() {
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [postalCodeFilter, setPostalCodeFilter] = useState("");
  const [search, setSearch] = useState({ name: "", postalCode: "" });
  const [page, setPage] = useState(0);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [name, setName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const localitiesQuery = useQuery({
    queryKey: ["localities", search, page],
    queryFn: () => listLocalities({ ...search, page }),
  });
  const refreshLocalities = () => queryClient.invalidateQueries({ queryKey: ["localities"] });
  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { name, postalCode };
      return editingLocality ? updateLocality(editingLocality.id, input) : createLocality(input);
    },
    onSuccess: async () => {
      setPage(0);
      resetForm();
      await refreshLocalities();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLocality,
    onSuccess: async (_, localityId) => {
      setPage(0);
      if (editingLocality?.id === localityId) resetForm();
      await refreshLocalities();
    },
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const localities = localitiesQuery.data?.content ?? [];
  const totalPages = localitiesQuery.data?.page.totalPages ?? 0;

  function resetForm() {
    setEditingLocality(null);
    setName("");
    setPostalCode("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function beginEdit(locality: Locality) {
    setEditingLocality(locality);
    setName(locality.name);
    setPostalCode(locality.postalCode);
  }

  function removeLocality(locality: Locality) {
    if (window.confirm(`¿Quieres borrar la localidad ${locality.name}?`))
      deleteMutation.mutate(locality.id);
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch({ name: nameFilter.trim(), postalCode: postalCodeFilter.trim() });
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Localidades</h1>
        <p>Gestiona las localidades y sus códigos postales.</p>
      </header>
      <section className="panel" aria-labelledby="locality-form-title">
        <h2 id="locality-form-title">{editingLocality ? "Editar localidad" : "Crear localidad"}</h2>
        <form className="form-grid" onSubmit={submitForm}>
          <label>
            Nombre
            <input required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Código postal
            <input
              required
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
            />
          </label>
          <div className="actions">
            <button type="submit" disabled={busy}>
              {editingLocality ? "Guardar cambios" : "Crear"}
            </button>
            {editingLocality && (
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
      <section className="panel" aria-labelledby="locality-list-title">
        <h2 id="locality-list-title">Listado</h2>
        <form className="form-grid" onSubmit={applySearch}>
          <label>
            Buscar por nombre
            <input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} />
          </label>
          <label>
            Buscar por código postal
            <input
              value={postalCodeFilter}
              onChange={(event) => setPostalCodeFilter(event.target.value)}
            />
          </label>
          <button type="submit">Buscar</button>
        </form>
        {localitiesQuery.isPending && (
          <p className="status" role="status">
            Cargando localidades…
          </p>
        )}
        {localitiesQuery.isError && (
          <p className="error-message" role="alert">
            {localitiesQuery.error.message}
          </p>
        )}
        {localitiesQuery.isSuccess && localities.length === 0 && (
          <p className="status" role="status">
            No hay localidades.
          </p>
        )}
        {localitiesQuery.isSuccess && localities.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código postal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {localities.map((locality) => (
                  <tr key={locality.id}>
                    <td>{locality.name}</td>
                    <td>{locality.postalCode}</td>
                    <td className="actions">
                      <button type="button" disabled={busy} onClick={() => beginEdit(locality)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeLocality(locality)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav className="pagination" aria-label="Paginación de localidades">
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
