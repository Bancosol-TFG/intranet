import { LocalityList } from "./LocalityList";
import { LocalityForm } from "./LocalityForm";
import type { Locality } from "./territoryTypes";
import { useLocalities } from "./useLocalities";
import { useState, type FormEvent } from "react";

export function LocalitiesPage() {
  const [nameFilter, setNameFilter] = useState("");
  const [postalCodeFilter, setPostalCodeFilter] = useState("");
  const [search, setSearch] = useState({ name: "", postalCode: "" });
  const [page, setPage] = useState(0);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [name, setName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const { localitiesQuery, saveMutation, deleteMutation } = useLocalities({
    search,
    page,
    name,
    postalCode,
    editingLocality,
    setPage,
    resetForm,
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const localities = localitiesQuery.data?.content ?? [];
  const totalPages = localitiesQuery.data?.page.totalPages ?? 0;

  function resetForm() {
    setEditingLocality(null);
    setName("");
    setPostalCode("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function beginEdit(locality: Locality) {
    setEditingLocality(locality);
    setName(locality.name);
    setPostalCode(locality.postalCode);
  }

  function removeLocality(locality: Locality) {
    if (window.confirm(`¿Quieres borrar la localidad ${locality.name}?`))
      deleteMutation.mutate(locality.id);
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch({ name: nameFilter.trim(), postalCode: postalCodeFilter.trim() });
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Localidades</h1>
        <p>Gestiona las localidades y sus códigos postales.</p>
      </header>
      <LocalityForm
        editingLocality={editingLocality}
        name={name}
        setName={setName}
        postalCode={postalCode}
        setPostalCode={setPostalCode}
        busy={busy}
        submitForm={submitForm}
        resetForm={resetForm}
        saveMutation={saveMutation}
      />
      <LocalityList
        applySearch={applySearch}
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        postalCodeFilter={postalCodeFilter}
        setPostalCodeFilter={setPostalCodeFilter}
        localitiesQuery={localitiesQuery}
        localities={localities}
        busy={busy}
        beginEdit={beginEdit}
        removeLocality={removeLocality}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        deleteMutation={deleteMutation}
      />
    </main>
  );
}
