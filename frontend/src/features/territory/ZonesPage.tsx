import { ZoneList } from "./ZoneList";
import { ZoneForm } from "./ZoneForm";
import type { Zone } from "./territoryTypes";
import { useZones } from "./useZones";
import { useState, type FormEvent } from "react";

export function ZonesPage() {
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [search, setSearch] = useState({ name: "", code: "" });
  const [page, setPage] = useState(0);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { zonesQuery, saveMutation, deleteMutation } = useZones({
    search,
    page,
    name,
    code,
    editingZone,
    setPage,
    resetForm,
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const zones = zonesQuery.data?.content ?? [];
  const totalPages = zonesQuery.data?.page.totalPages ?? 0;

  function resetForm() {
    setEditingZone(null);
    setName("");
    setCode("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function beginEdit(zone: Zone) {
    setEditingZone(zone);
    setName(zone.name);
    setCode(zone.code);
  }

  function removeZone(zone: Zone) {
    if (window.confirm(`¿Quieres borrar la zona ${zone.name}?`)) deleteMutation.mutate(zone.id);
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch({ name: nameFilter.trim(), code: codeFilter.trim() });
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Zonas</h1>
        <p>Gestiona las zonas y sus códigos.</p>
      </header>
      <ZoneForm
        editingZone={editingZone}
        name={name}
        setName={setName}
        code={code}
        setCode={setCode}
        busy={busy}
        submitForm={submitForm}
        resetForm={resetForm}
        saveMutation={saveMutation}
      />
      <ZoneList
        applySearch={applySearch}
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        codeFilter={codeFilter}
        setCodeFilter={setCodeFilter}
        zonesQuery={zonesQuery}
        zones={zones}
        busy={busy}
        beginEdit={beginEdit}
        removeZone={removeZone}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        deleteMutation={deleteMutation}
      />
    </main>
  );
}
