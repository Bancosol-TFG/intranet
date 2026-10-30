import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { campaignTypesApi, type CampaignType } from "./api/campaign-types";

export function CampaignTypesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<CampaignType | null>(null);
  const [message, setMessage] = useState("");

  const campaignTypes = useQuery({
    queryKey: ["campaign-types", search, page],
    queryFn: () => campaignTypesApi.list(search, page),
  });

  const saveCampaignType = useMutation({
    mutationFn: () =>
      editing ? campaignTypesApi.update(editing.id, { name }) : campaignTypesApi.create({ name }),
    onSuccess: async () => {
      setMessage(editing ? "Tipo de campaña actualizado." : "Tipo de campaña creado.");
      cancelEditing();
      await queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
    },
    onError: (error) => setMessage(error.message),
  });

  const deleteCampaignType = useMutation({
    mutationFn: (campaignTypeId: number) => campaignTypesApi.remove(campaignTypeId),
    onSuccess: async () => {
      setMessage("Tipo de campaña eliminado.");
      await queryClient.invalidateQueries({ queryKey: ["campaign-types"] });
    },
    onError: (error) => setMessage(error.message),
  });

  function startEditing(campaignType: CampaignType) {
    setEditing(campaignType);
    setName(campaignType.name);
    setMessage("");
  }

  function cancelEditing() {
    setEditing(null);
    setName("");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  function submitCampaignType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCampaignType.mutate();
  }

  function confirmDelete(campaignType: CampaignType) {
    if (window.confirm(`¿Eliminar el tipo de campaña "${campaignType.name}"?`)) {
      deleteCampaignType.mutate(campaignType.id);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Tipos de campaña</h1>
          <p>Clasifica las campañas para organizar la actividad de la intranet.</p>
        </div>
      </header>

      <section className="panel" aria-labelledby="campaign-type-form-title">
        <h2 id="campaign-type-form-title">
          {editing ? "Editar tipo de campaña" : "Nuevo tipo de campaña"}
        </h2>
        <form className="inline-form" onSubmit={submitCampaignType}>
          <label>
            Nombre
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Alimentación"
              required
            />
          </label>
          <button type="submit" disabled={saveCampaignType.isPending}>
            {editing ? "Guardar" : "Crear"}
          </button>
          {editing ? (
            <button type="button" className="secondary" onClick={cancelEditing}>
              Cancelar
            </button>
          ) : null}
        </form>
        {message ? <p className="message">{message}</p> : null}
      </section>

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
    </main>
  );
}
