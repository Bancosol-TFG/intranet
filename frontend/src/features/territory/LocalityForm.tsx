import type { FormEvent } from "react";
import type { Locality } from "./territoryTypes";
import type { useLocalities } from "./useLocalities";
type Props = {
  editingLocality: Locality | null;
  name: string;
  setName: (value: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  busy: boolean;
  submitForm: (event: FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
  saveMutation: ReturnType<typeof useLocalities>["saveMutation"];
};
export function LocalityForm({
  editingLocality,
  name,
  setName,
  postalCode,
  setPostalCode,
  busy,
  submitForm,
  resetForm,
  saveMutation,
}: Props) {
  return (
    <section className="panel" aria-labelledby="locality-form-title">
      <h2 id="locality-form-title">{editingLocality ? "Editar localidad" : "Crear localidad"}</h2>
      <form className="form-grid" onSubmit={submitForm}>
        <label>
          Nombre
          <input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Código postal
          <input
            required
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={busy}>
            {editingLocality ? "Guardar cambios" : "Crear"}
          </button>
          {editingLocality && (
            <button type="button" disabled={busy} onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      {saveMutation.isError && (
        <p className="error-message" role="alert">
          {saveMutation.error.message}
        </p>
      )}
    </section>
  );
}
