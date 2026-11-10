import { useState, type FormEvent } from "react";

import { ChainForm } from "./ChainForm";
import { ChainList } from "./ChainList";
import type { Chain } from "./storesTypes";
import { useChains } from "./useChains";

export function ChainsPage() {
  const [codeFilter, setCodeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editingChain, setEditingChain] = useState<Chain | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { chainsQuery, saveMutation, deleteMutation } = useChains({
    search,
    page,
    name,
    code,
    editingChain,
    setPage,
    resetForm,
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const chains = chainsQuery.data?.content ?? [];
  const totalPages = chainsQuery.data?.page.totalPages ?? 0;

  function resetForm() {
    setEditingChain(null);
    setName("");
    setCode("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function beginEdit(chain: Chain) {
    setEditingChain(chain);
    setName(chain.name);
    setCode(chain.code);
    saveMutation.reset();
  }

  function removeChain(chain: Chain) {
    if (window.confirm(`¿Quieres dar de baja la cadena ${chain.name} (${chain.code})?`)) {
      deleteMutation.mutate(chain.id);
    }
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch(codeFilter.trim());
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Cadenas</h1>
        <p>Gestiona las cadenas, sus nombres y sus códigos únicos.</p>
      </header>
      <ChainForm
        editingChain={editingChain}
        name={name}
        setName={setName}
        code={code}
        setCode={setCode}
        busy={busy}
        submitForm={submitForm}
        resetForm={resetForm}
        saveMutation={saveMutation}
      />
      <ChainList
        applySearch={applySearch}
        codeFilter={codeFilter}
        setCodeFilter={setCodeFilter}
        chainsQuery={chainsQuery}
        chains={chains}
        busy={busy}
        beginEdit={beginEdit}
        removeChain={removeChain}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        deleteMutation={deleteMutation}
      />
    </main>
  );
}
