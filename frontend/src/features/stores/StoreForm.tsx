import type { FormEvent } from "react";

import type { Store } from "./storesTypes";
import type { useStoreOptions } from "./useStoreOptions";
import type { useStores } from "./useStores";

export type StoreFormValues = {
  name: string;
  address: string;
  checkoutShelfs: string;
  chainId: string;
  localityId: string;
  zoneId: string;
};

type Props = {
  editingStore: Store | null;
  form: StoreFormValues;
  updateForm: (field: keyof StoreFormValues, value: string) => void;
  busy: boolean;
  submitForm: (event: FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
  options: ReturnType<typeof useStoreOptions>;
  saveMutation: ReturnType<typeof useStores>["saveMutation"];
};

export function StoreForm({
  editingStore,
  form,
  updateForm,
  busy,
  submitForm,
  resetForm,
  options,
  saveMutation,
}: Props) {
  const { chainsQuery, localitiesQuery, zonesQuery } = options;
  const optionsPending = chainsQuery.isPending || localitiesQuery.isPending || zonesQuery.isPending;
  const optionsError = chainsQuery.error ?? localitiesQuery.error ?? zonesQuery.error;
  const cannotSave = busy || optionsPending || Boolean(optionsError);

  return (
    <section className="panel" aria-labelledby="store-form-title">
      <h2 id="store-form-title">{editingStore ? "Editar tienda" : "Crear tienda"}</h2>
      <form className="form-grid" onSubmit={submitForm}>
        <label>
          Nombre
          <input
            required
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
          />
        </label>
        <label>
          Dirección
          <input
            required
            value={form.address}
            onChange={(event) => updateForm("address", event.target.value)}
          />
        </label>
        <label>
          Número de cajas
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.checkoutShelfs}
            onChange={(event) => updateForm("checkoutShelfs", event.target.value)}
          />
        </label>
        <label>
          Cadena
          <select
            required
            disabled={busy || !chainsQuery.isSuccess}
            value={form.chainId}
            onChange={(event) => updateForm("chainId", event.target.value)}
          >
            <option value="">Selecciona una cadena</option>
            {chainsQuery.data?.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          Localidad
          <select
            required
            disabled={busy || !localitiesQuery.isSuccess}
            value={form.localityId}
            onChange={(event) => updateForm("localityId", event.target.value)}
          >
            <option value="">Selecciona una localidad</option>
            {localitiesQuery.data?.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.name} ({locality.postalCode})
              </option>
            ))}
          </select>
        </label>
        <label>
          Zona (opcional)
          <select
            disabled={busy || !zonesQuery.isSuccess}
            value={form.zoneId}
            onChange={(event) => updateForm("zoneId", event.target.value)}
          >
            <option value="">Sin zona</option>
            {zonesQuery.data?.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.code})
              </option>
            ))}
          </select>
        </label>
        <div className="actions">
          <button type="submit" disabled={cannotSave}>
            {editingStore ? "Guardar cambios" : "Crear"}
          </button>
          {editingStore && (
            <button type="button" disabled={busy} onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      {optionsPending && (
        <p className="status" role="status">
          Cargando cadenas, localidades y zonas…
        </p>
      )}
      {chainsQuery.isSuccess && chainsQuery.data.length === 0 && (
        <p className="status" role="status">
          Crea una cadena antes de dar de alta una tienda.
        </p>
      )}
      {localitiesQuery.isSuccess && localitiesQuery.data.length === 0 && (
        <p className="status" role="status">
          Crea una localidad antes de dar de alta una tienda.
        </p>
      )}
      {optionsError && (
        <p className="error-message" role="alert">
          {optionsError.message}
        </p>
      )}
      {saveMutation.isError && (
        <p className="error-message" role="alert">
          {saveMutation.error.message}
        </p>
      )}
    </section>
  );
}
