import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Campaign } from "./campaignTypes";
import type { useCampaigns } from "./useCampaigns";
import type { useAllCampaignTypes } from "./useCampaignTypes";
type Props = {
  searchInput: string;
  setSearchInput: (value: string) => void;
  submitSearch: (event: FormEvent<HTMLFormElement>) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  campaignTypes: ReturnType<typeof useAllCampaignTypes>;
  campaigns: ReturnType<typeof useCampaigns>["campaigns"];
  startEditing: (value: Campaign) => void;
  confirmDelete: (value: Campaign) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};
export function CampaignList({
  searchInput,
  setSearchInput,
  submitSearch,
  typeFilter,
  setTypeFilter,
  campaignTypes,
  campaigns,
  startEditing,
  confirmDelete,
  page,
  setPage,
}: Props) {
  return (
    <section className="panel" aria-labelledby="campaign-list-title">
      <h2 id="campaign-list-title">Campañas registradas</h2>
      <form className="search-form" onSubmit={submitSearch}>
        <label>
          Buscar por nombre
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nombre de la campaña"
          />
        </label>
        <label>
          Filtrar por tipo
          <select
            value={typeFilter}
            onChange={(event) => {
              setPage(0);
              setTypeFilter(event.target.value);
            }}
          >
            <option value="">Todos los tipos</option>
            {campaignTypes.data?.content.map((campaignType) => (
              <option key={campaignType.id} value={campaignType.id}>
                {campaignType.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="secondary">
          Buscar
        </button>
      </form>

      {campaigns.isPending ? <p>Cargando campañas…</p> : null}
      {campaigns.isError ? <p className="message">{campaigns.error.message}</p> : null}
      {campaigns.data?.content.length === 0 ? <p>No hay campañas.</p> : null}

      {campaigns.data?.content.length ? (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.data.content.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaign.campaignTypeName}</td>
                <td>{campaign.startDate}</td>
                <td>{campaign.endDate}</td>
                <td className="actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startEditing(campaign)}
                  >
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => confirmDelete(campaign)}>
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
          Página {page + 1} de {campaigns.data?.page.totalPages ?? 1}
        </span>
        <button
          type="button"
          className="secondary"
          disabled={!campaigns.data || page + 1 >= campaigns.data.page.totalPages}
          onClick={() => setPage((currentPage) => currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
