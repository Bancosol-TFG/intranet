import type { FormEvent } from "react";
import type { Zone } from "./territoryTypes";
import type { useZones } from "./useZones";
type Props = {
  editingZone: Zone | null;
  name: string;
  setName: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  busy: boolean;
  submitForm: (event: FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
  saveMutation: ReturnType<typeof useZones>["saveMutation"];
};
export function ZoneForm({
  editingZone,
  name,
  setName,
  code,
  setCode,
  busy,
  submitForm,
  resetForm,
  saveMutation,
}: Props) {
  return (
    <section className="panel" aria-labelledby="zone-form-title">
      <h2 id="zone-form-title">{editingZone ? "Editar zona" : "Crear zona"}</h2>
      <form className="form-grid" onSubmit={submitForm}>
        <label>
          Nombre
          <input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Código
          <input required value={code} onChange={(event) => setCode(event.target.value)} />
        </label>
        <div className="actions">
          <button type="submit" disabled={busy}>
            {editingZone ? "Guardar cambios" : "Crear"}
          </button>
          {editingZone && (
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
