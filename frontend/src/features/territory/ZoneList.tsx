import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Zone } from "./territoryTypes";
import type { useZones } from "./useZones";
type State = ReturnType<typeof useZones>;
type Props = {
  applySearch: (event: FormEvent<HTMLFormElement>) => void;
  nameFilter: string;
  setNameFilter: (value: string) => void;
  codeFilter: string;
  setCodeFilter: (value: string) => void;
  zonesQuery: State["zonesQuery"];
  zones: Zone[];
  busy: boolean;
  beginEdit: (value: Zone) => void;
  removeZone: (value: Zone) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  deleteMutation: State["deleteMutation"];
};
export function ZoneList({
  applySearch,
  nameFilter,
  setNameFilter,
  codeFilter,
  setCodeFilter,
  zonesQuery,
  zones,
  busy,
  beginEdit,
  removeZone,
  page,
  setPage,
  totalPages,
  deleteMutation,
}: Props) {
  return (
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
  );
}
