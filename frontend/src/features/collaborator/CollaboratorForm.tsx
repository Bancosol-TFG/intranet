import type { FormEvent } from "react";
import type { Collaborator } from "./collaboratorTypes";
import type { useCollaborators } from "./useCollaborators";
import type { useCollaboratorLocalities } from "./useCollaboratorLocalities";
type CollaboratorState = ReturnType<typeof useCollaborators>;
type LocalityOption = { id: number; name: string };
type Props = {
  editing: Collaborator | null;
  submit: (event: FormEvent) => void;
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  localitySearch: string;
  setLocalitySearch: (value: string) => void;
  setLocalityPage: (value: number) => void;
  localityId: string;
  setLocalityId: (value: string) => void;
  setSelectedLocality: (value: LocalityOption | null) => void;
  localitiesQuery: ReturnType<typeof useCollaboratorLocalities>;
  selectedLocality: LocalityOption | null;
  localityPage: number;
  save: CollaboratorState["save"];
  remove: CollaboratorState["remove"];
  reset: () => void;
};
export function CollaboratorForm({
  editing,
  submit,
  name,
  setName,
  address,
  setAddress,
  localitySearch,
  setLocalitySearch,
  setLocalityPage,
  localityId,
  setLocalityId,
  setSelectedLocality,
  localitiesQuery,
  selectedLocality,
  localityPage,
  save,
  remove,
  reset,
}: Props) {
  return (
    <section className="panel">
      <h2>{editing ? "Editar colaborador" : "Nuevo colaborador"}</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Nombre
          <input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Dirección
          <input required value={address} onChange={(event) => setAddress(event.target.value)} />
        </label>
        <label>
          Buscar localidad
          <input
            value={localitySearch}
            onChange={(event) => {
              setLocalitySearch(event.target.value);
              setLocalityPage(0);
            }}
          />
        </label>
        <label>
          Localidad
          <select
            required
            value={localityId}
            onChange={(event) => {
              const nextLocalityId = event.target.value;
              const selectedOption = event.target.selectedOptions[0];
              setLocalityId(nextLocalityId);
              setSelectedLocality(
                nextLocalityId
                  ? { id: Number(nextLocalityId), name: selectedOption?.textContent ?? "" }
                  : null,
              );
            }}
          >
            <option value="">Selecciona localidad</option>
            {localitiesQuery.data?.content.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.name}
              </option>
            ))}
            {selectedLocality &&
              !localitiesQuery.data?.content.some(
                (locality) => locality.id === selectedLocality.id,
              ) && <option value={selectedLocality.id}>{selectedLocality.name}</option>}
          </select>
          <span className="actions">
            <button
              type="button"
              disabled={localityPage === 0}
              onClick={() => setLocalityPage(localityPage - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={
                !localitiesQuery.data || localityPage + 1 >= localitiesQuery.data.page.totalPages
              }
              onClick={() => setLocalityPage(localityPage + 1)}
            >
              Siguiente
            </button>
            <span>
              Página {localitiesQuery.data?.page.totalPages ? localityPage + 1 : 0} de{" "}
              {localitiesQuery.data?.page.totalPages ?? 0}
            </span>
          </span>
        </label>
        <div className="actions">
          <button disabled={save.isPending}>{editing ? "Guardar" : "Crear"}</button>
          {editing && (
            <button type="button" disabled={save.isPending || remove.isPending} onClick={reset}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      {save.isError && (
        <p role="alert" className="error-message">
          {save.error.message}
        </p>
      )}
    </section>
  );
}
