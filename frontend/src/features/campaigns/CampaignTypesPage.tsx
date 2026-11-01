import "./campaigns.css";
import { CampaignTypeList } from "./CampaignTypeList";
import { CampaignTypeForm } from "./CampaignTypeForm";
import { useCampaignTypes } from "./useCampaignTypes";
import { useState } from "react";
import type { CampaignType } from "./campaignTypes";

export function CampaignTypesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<CampaignType | null>(null);
  const [message, setMessage] = useState("");

  const { campaignTypes, saveCampaignType, deleteCampaignType } = useCampaignTypes({
    search,
    page,
    name,
    editing,
    setMessage,
    cancelEditing,
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

      <CampaignTypeForm
        editing={editing}
        name={name}
        setName={setName}
        isPending={saveCampaignType.isPending}
        message={message}
        submitCampaignType={submitCampaignType}
        cancelEditing={cancelEditing}
      />

      <CampaignTypeList
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        submitSearch={submitSearch}
        campaignTypes={campaignTypes}
        startEditing={startEditing}
        confirmDelete={confirmDelete}
        page={page}
        setPage={setPage}
      />
    </main>
  );
}
