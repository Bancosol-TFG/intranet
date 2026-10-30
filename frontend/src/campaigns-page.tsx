import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { campaignTypesApi } from "./api/campaign-types";
import { campaignsApi, type Campaign } from "./api/campaigns";

const EMPTY_FORM = {
  name: "",
  campaignTypeId: "",
  startDate: "",
  endDate: "",
};

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [message, setMessage] = useState("");

  const campaignTypes = useQuery({
    queryKey: ["campaign-types", "all"],
    queryFn: () => campaignTypesApi.listAll(),
  });

  const campaigns = useQuery({
    queryKey: ["campaigns", search, typeFilter, page],
    queryFn: () => campaignsApi.list(search, typeFilter, page),
  });

  const saveCampaign = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        campaignTypeId: Number(form.campaignTypeId),
        startDate: form.startDate,
        endDate: form.endDate,
      };
      return editing ? campaignsApi.update(editing.id, payload) : campaignsApi.create(payload);
    },
    onSuccess: async () => {
      setMessage(editing ? "Campaña actualizada." : "Campaña creada.");
      cancelEditing();
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => setMessage(error.message),
  });

  const deleteCampaign = useMutation({
    mutationFn: (campaignId: number) => campaignsApi.remove(campaignId),
    onSuccess: async () => {
      setMessage("Campaña eliminada.");
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => setMessage(error.message),
  });

  function updateForm(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function startEditing(campaign: Campaign) {
    setEditing(campaign);
    setForm({
      name: campaign.name,
      campaignTypeId: String(campaign.campaignTypeId),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    });
    setMessage("");
  }

  function cancelEditing() {
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  function submitCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCampaign.mutate();
  }

  function confirmDelete(campaign: Campaign) {
    if (window.confirm(`¿Eliminar la campaña "${campaign.name}"?`)) {
      deleteCampaign.mutate(campaign.id);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Campañas</h1>
          <p>Organiza las campañas por tipo y periodo de actividad.</p>
        </div>
      </header>

      <section className="panel" aria-labelledby="campaign-form-title">
        <h2 id="campaign-form-title">{editing ? "Editar campaña" : "Nueva campaña"}</h2>
        <form className="form-grid" onSubmit={submitCampaign}>
          <label>
            Nombre
            <input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Ej. Gran Recogida"
              required
            />
          </label>
          <label>
            Tipo de campaña
            <select
              value={form.campaignTypeId}
              onChange={(event) => updateForm("campaignTypeId", event.target.value)}
              required
            >
              <option value="">Selecciona un tipo</option>
              {campaignTypes.data?.content.map((campaignType) => (
                <option key={campaignType.id} value={campaignType.id}>
                  {campaignType.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha de inicio
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => updateForm("startDate", event.target.value)}
              required
            />
          </label>
          <label>
            Fecha de fin
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => updateForm("endDate", event.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saveCampaign.isPending}>
              {editing ? "Guardar" : "Crear"}
            </button>
            {editing ? (
              <button type="button" className="secondary" onClick={cancelEditing}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
        {campaignTypes.isError ? <p className="message">{campaignTypes.error.message}</p> : null}
        {message ? <p className="message">{message}</p> : null}
      </section>

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
                    <button
                      type="button"
                      className="danger"
                      onClick={() => confirmDelete(campaign)}
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
    </main>
  );
}
