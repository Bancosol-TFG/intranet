import type { FormEvent } from "react";

import type { Chain } from "./storesTypes";
import type { useChains } from "./useChains";

type Props = {
  editingChain: Chain | null;
  code: string;
  setCode: (value: string) => void;
  busy: boolean;
  submitForm: (event: FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
  saveMutation: ReturnType<typeof useChains>["saveMutation"];
};

export function ChainForm({
  editingChain,
  code,
  setCode,
  busy,
  submitForm,
  resetForm,
  saveMutation,
}: Props) {
  return (
    <section className="panel" aria-labelledby="chain-form-title">
      <h2 id="chain-form-title">{editingChain ? "Editar cadena" : "Crear cadena"}</h2>
      <form className="form-grid" onSubmit={submitForm}>
        <label>
          Código
          <input required value={code} onChange={(event) => setCode(event.target.value)} />
        </label>
        <div className="actions">
          <button type="submit" disabled={busy}>
            {editingChain ? "Guardar cambios" : "Crear"}
          </button>
          {editingChain && (
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
