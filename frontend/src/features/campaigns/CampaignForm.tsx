import type { FormEvent } from "react";
import type { Campaign } from "./campaignTypes";
import type { useAllCampaignTypes } from "./useCampaignTypes";
type Form = { name: string; campaignTypeId: string; startDate: string; endDate: string };
type Props = {
  editing: Campaign | null;
  form: Form;
  updateForm: (field: keyof Form, value: string) => void;
  submitCampaign: (event: FormEvent<HTMLFormElement>) => void;
  saveCampaign: { isPending: boolean };
  cancelEditing: () => void;
  campaignTypes: ReturnType<typeof useAllCampaignTypes>;
  message: string;
};
export function CampaignForm({
  editing,
  form,
  updateForm,
  submitCampaign,
  saveCampaign,
  cancelEditing,
  campaignTypes,
  message,
}: Props) {
  return (
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
  );
}
