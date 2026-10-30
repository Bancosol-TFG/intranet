import type { FormEvent } from "react";
import type { CampaignType } from "./campaignTypes";

type Props = {
  editing: CampaignType | null;
  name: string;
  setName: (name: string) => void;
  isPending: boolean;
  message: string;
  submitCampaignType: (event: FormEvent<HTMLFormElement>) => void;
  cancelEditing: () => void;
};

export function CampaignTypeForm({
  editing,
  name,
  setName,
  isPending,
  message,
  submitCampaignType,
  cancelEditing,
}: Props) {
  return (
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
        <button type="submit" disabled={isPending}>
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
  );
}
