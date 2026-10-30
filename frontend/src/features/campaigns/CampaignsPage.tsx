import "./campaigns.css";
import { CampaignList } from "./CampaignList";
import { CampaignForm } from "./CampaignForm";
import { useState } from "react";
import type { Campaign } from "./campaignTypes";
import { useCampaigns } from "./useCampaigns";
import { useAllCampaignTypes } from "./useCampaignTypes";

const EMPTY_FORM = {
  name: "",
  campaignTypeId: "",
  startDate: "",
  endDate: "",
};

export function CampaignsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [message, setMessage] = useState("");

  const campaignTypes = useAllCampaignTypes();

  const { campaigns, saveCampaign, deleteCampaign } = useCampaigns({
    search,
    typeFilter,
    page,
    onSaveSuccess: (isEditing) => {
      setMessage(isEditing ? "Campaña actualizada." : "Campaña creada.");
      cancelEditing();
    },
    onDeleteSuccess: () => setMessage("Campaña eliminada."),
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
    saveCampaign.mutate({
      campaignId: editing?.id,
      payload: {
        name: form.name,
        campaignTypeId: Number(form.campaignTypeId),
        startDate: form.startDate,
        endDate: form.endDate,
      },
    });
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

      <CampaignForm
        editing={editing}
        form={form}
        updateForm={updateForm}
        submitCampaign={submitCampaign}
        saveCampaign={saveCampaign}
        cancelEditing={cancelEditing}
        campaignTypes={campaignTypes}
        message={message}
      />

      <CampaignList
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        submitSearch={submitSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        campaignTypes={campaignTypes}
        campaigns={campaigns}
        startEditing={startEditing}
        confirmDelete={confirmDelete}
        page={page}
        setPage={setPage}
      />
    </main>
  );
}
