import { useState, type FormEvent } from "react";

import { StoreForm, type StoreFormValues } from "./StoreForm";
import { StoreList } from "./StoreList";
import type { Store, StoreFilters } from "./storesTypes";
import { useStoreOptions } from "./useStoreOptions";
import { useStores } from "./useStores";

const EMPTY_FORM: StoreFormValues = {
  name: "",
  address: "",
  checkoutShelfs: "0",
  chainId: "",
  localityId: "",
  zoneId: "",
};

export function StoresPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [chainFilter, setChainFilter] = useState("");
  const [search, setSearch] = useState<Omit<StoreFilters, "page">>({ name: "", chainId: null });
  const [page, setPage] = useState(0);
  const options = useStoreOptions();
  const { storesQuery, saveMutation, deleteMutation } = useStores({
    search,
    page,
    input: {
      name: form.name,
      address: form.address,
      checkoutShelfs: Number(form.checkoutShelfs),
      chainId: Number(form.chainId),
      localityId: Number(form.localityId),
      zoneId: form.zoneId ? Number(form.zoneId) : null,
    },
    editingStore,
    setPage,
    resetForm,
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const stores = storesQuery.data?.content ?? [];
  const totalPages = storesQuery.data?.page.totalPages ?? 0;

  function resetForm() {
    setEditingStore(null);
    setForm(EMPTY_FORM);
  }

  function updateForm(field: keyof StoreFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      busy ||
      !options.chainsQuery.isSuccess ||
      !options.localitiesQuery.isSuccess ||
      !options.zonesQuery.isSuccess
    )
      return;
    saveMutation.mutate();
  }

  function beginEdit(store: Store) {
    setEditingStore(store);
    setForm({
      name: store.name,
      address: store.address,
      checkoutShelfs: String(store.checkoutShelfs),
      chainId: String(store.chain.id),
      localityId: String(store.locality.id),
      zoneId: store.zone ? String(store.zone.id) : "",
    });
    saveMutation.reset();
  }

  function removeStore(store: Store) {
    if (window.confirm(`¿Quieres dar de baja la tienda ${store.name}?`)) {
      deleteMutation.mutate(store.id);
    }
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch({ name: nameFilter.trim(), chainId: chainFilter ? Number(chainFilter) : null });
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Tiendas</h1>
        <p>Gestiona las tiendas, sus cadenas, localidades y zonas.</p>
      </header>
      <StoreForm
        editingStore={editingStore}
        form={form}
        updateForm={updateForm}
        busy={busy}
        submitForm={submitForm}
        resetForm={resetForm}
        options={options}
        saveMutation={saveMutation}
      />
      <StoreList
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        chainFilter={chainFilter}
        setChainFilter={setChainFilter}
        applySearch={applySearch}
        chainsQuery={options.chainsQuery}
        storesQuery={storesQuery}
        stores={stores}
        busy={busy}
        beginEdit={beginEdit}
        removeStore={removeStore}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        deleteMutation={deleteMutation}
      />
    </main>
  );
}
