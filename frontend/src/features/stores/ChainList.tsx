import type { FormEvent } from "react";

import type { Chain } from "./storesTypes";
import type { useChains } from "./useChains";

type State = ReturnType<typeof useChains>;
type Props = {
  applySearch: (event: FormEvent<HTMLFormElement>) => void;
  codeFilter: string;
  setCodeFilter: (value: string) => void;
  chainsQuery: State["chainsQuery"];
  chains: Chain[];
  busy: boolean;
  beginEdit: (chain: Chain) => void;
  removeChain: (chain: Chain) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  deleteMutation: State["deleteMutation"];
};

export function ChainList({
  applySearch,
  codeFilter,
  setCodeFilter,
  chainsQuery,
  chains,
  busy,
  beginEdit,
  removeChain,
  page,
  setPage,
  totalPages,
  deleteMutation,
}: Props) {
  return (
    <section className="panel" aria-labelledby="chain-list-title">
      <h2 id="chain-list-title">Listado</h2>
      <form className="form-grid" onSubmit={applySearch}>
        <label>
          Buscar por código
          <input value={codeFilter} onChange={(event) => setCodeFilter(event.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>
      {chainsQuery.isPending && (
        <p className="status" role="status">
          Cargando cadenas…
        </p>
      )}
      {chainsQuery.isError && (
        <p className="error-message" role="alert">
          {chainsQuery.error.message}
        </p>
      )}
      {chainsQuery.isSuccess && chains.length === 0 && (
        <p className="status" role="status">
          No hay cadenas.
        </p>
      )}
      {chainsQuery.isSuccess && chains.length > 0 && (
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
              {chains.map((chain) => (
                <tr key={chain.id}>
                  <td>{chain.name}</td>
                  <td>{chain.code}</td>
                  <td className="actions">
                    <button type="button" disabled={busy} onClick={() => beginEdit(chain)}>
                      Editar
                    </button>
                    <button type="button" disabled={busy} onClick={() => removeChain(chain)}>
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <nav className="pagination" aria-label="Paginación de cadenas">
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
