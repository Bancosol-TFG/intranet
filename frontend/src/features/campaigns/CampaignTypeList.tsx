import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CampaignType } from "./campaignTypes";
import type { useCampaignTypes } from "./useCampaignTypes";
type Props = {
  searchInput: string;
  setSearchInput: (value: string) => void;
  submitSearch: (event: FormEvent<HTMLFormElement>) => void;
  campaignTypes: ReturnType<typeof useCampaignTypes>["campaignTypes"];
  startEditing: (value: CampaignType) => void;
  confirmDelete: (value: CampaignType) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};
export function CampaignTypeList({
  searchInput,
  setSearchInput,
  submitSearch,
  campaignTypes,
  startEditing,
  confirmDelete,
  page,
  setPage,
}: Props) {
  return (
    <section className="panel" aria-labelledby="campaign-type-list-title">
      <h2 id="campaign-type-list-title">Tipos registrados</h2>
      <form className="search-form" onSubmit={submitSearch}>
        <label>
          Buscar por nombre
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nombre del tipo"
          />
        </label>
        <button type="submit" className="secondary">
          Buscar
        </button>
      </form>

      {campaignTypes.isPending ? <p>Cargando tipos de campaña…</p> : null}
      {campaignTypes.isError ? <p className="message">{campaignTypes.error.message}</p> : null}
      {campaignTypes.data?.content.length === 0 ? <p>No hay tipos de campaña.</p> : null}

      {campaignTypes.data?.content.length ? (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaignTypes.data.content.map((campaignType) => (
              <tr key={campaignType.id}>
                <td>{campaignType.name}</td>
                <td className="actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startEditing(campaignType)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => confirmDelete(campaignType)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <div className="pagination">
        <button
          type="button"
          className="secondary"
          disabled={page === 0}
          onClick={() => setPage((currentPage) => currentPage - 1)}
        >
          Anterior
        </button>
        <span>
          Página {page + 1} de {campaignTypes.data?.page.totalPages ?? 1}
        </span>
        <button
          type="button"
          className="secondary"
          disabled={!campaignTypes.data || page + 1 >= campaignTypes.data.page.totalPages}
          onClick={() => setPage((currentPage) => currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
