import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Locality } from "./territoryTypes";
import type { useLocalities } from "./useLocalities";
type State = ReturnType<typeof useLocalities>;
type Props = {
  applySearch: (event: FormEvent<HTMLFormElement>) => void;
  nameFilter: string;
  setNameFilter: (value: string) => void;
  postalCodeFilter: string;
  setPostalCodeFilter: (value: string) => void;
  localitiesQuery: State["localitiesQuery"];
  localities: Locality[];
  busy: boolean;
  beginEdit: (value: Locality) => void;
  removeLocality: (value: Locality) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  deleteMutation: State["deleteMutation"];
};
export function LocalityList({
  applySearch,
  nameFilter,
  setNameFilter,
  postalCodeFilter,
  setPostalCodeFilter,
  localitiesQuery,
  localities,
  busy,
  beginEdit,
  removeLocality,
  page,
  setPage,
  totalPages,
  deleteMutation,
}: Props) {
  return (
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
                    <button type="button" disabled={busy} onClick={() => removeLocality(locality)}>
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
  );
}
