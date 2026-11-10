import type { FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import "./stores.css";

import type { Store } from "./storesTypes";
import type { useStoreOptions } from "./useStoreOptions";
import type { useStores } from "./useStores";

type State = ReturnType<typeof useStores>;
type Props = {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  chainFilter: string;
  setChainFilter: (value: string) => void;
  applySearch: (event: FormEvent<HTMLFormElement>) => void;
  chainsQuery: ReturnType<typeof useStoreOptions>["chainsQuery"];
  storesQuery: State["storesQuery"];
  stores: Store[];
  busy: boolean;
  beginEdit: (store: Store) => void;
  removeStore: (store: Store) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  deleteMutation: State["deleteMutation"];
};

export function StoreList({
  nameFilter,
  setNameFilter,
  chainFilter,
  setChainFilter,
  applySearch,
  chainsQuery,
  storesQuery,
  stores,
  busy,
  beginEdit,
  removeStore,
  page,
  setPage,
  totalPages,
  deleteMutation,
}: Props) {
  return (
    <section className="panel" aria-labelledby="store-list-title">
      <h2 id="store-list-title">Listado</h2>
      <form className="form-grid" onSubmit={applySearch}>
        <label>
          Buscar por nombre
          <input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} />
        </label>
        <label>
          Filtrar por cadena
          <select
            value={chainFilter}
            disabled={!chainsQuery.isSuccess}
            onChange={(event) => setChainFilter(event.target.value)}
          >
            <option value="">Todas las cadenas</option>
            {chainsQuery.data?.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.code})
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Buscar</button>
      </form>
      {chainsQuery.isError && (
        <p className="error-message" role="alert">
          {chainsQuery.error.message}
        </p>
      )}
      {storesQuery.isPending && (
        <p className="status" role="status">
          Cargando tiendas…
        </p>
      )}
      {storesQuery.isError && (
        <p className="error-message" role="alert">
          {storesQuery.error.message}
        </p>
      )}
      {storesQuery.isSuccess && stores.length === 0 && (
        <p className="status" role="status">
          No hay tiendas.
        </p>
      )}
      {storesQuery.isSuccess && stores.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Cajas</th>
                <th>Cadena</th>
                <th>Localidad</th>
                <th>Zona</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td>{store.checkoutShelfs}</td>
                  <td>
                    {store.chain.name} ({store.chain.code})
                  </td>
                  <td>
                    {store.locality.name} ({store.locality.postalCode})
                  </td>
                  <td>{store.zone ? `${store.zone.name} (${store.zone.code})` : "Sin zona"}</td>
                  <td className="actions store-actions">
                    <Link to="/stores/$storeId/schedule" params={{ storeId: String(store.id) }}>
                      Horarios
                    </Link>
                    <button type="button" disabled={busy} onClick={() => beginEdit(store)}>
                      Editar
                    </button>
                    <button type="button" disabled={busy} onClick={() => removeStore(store)}>
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <nav className="pagination" aria-label="Paginación de tiendas">
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
