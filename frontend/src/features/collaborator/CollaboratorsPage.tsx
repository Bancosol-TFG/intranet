import { CollaboratorList } from "./CollaboratorList";
import { CollaboratorForm } from "./CollaboratorForm";
import { ContactsSection } from "./ContactsSection";
import { useState, type FormEvent } from "react";
import type { Collaborator, Contact } from "./collaboratorTypes";
import { useCollaborators } from "./useCollaborators";
import { useCollaboratorLocalities } from "./useCollaboratorLocalities";
import { useContacts } from "./useContacts";
export function CollaboratorsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [localitySearch, setLocalitySearch] = useState("");
  const [localityPage, setLocalityPage] = useState(0);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [selected, setSelected] = useState<Collaborator | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactPage, setContactPage] = useState(0);
  const { collaboratorsQuery, save, remove } = useCollaborators({
    filter,
    page,
    editing,
    name,
    address,
    localityId,
    setPage,
    setSelected,
    reset,
    resetContact,
  });
  const localitiesQuery = useCollaboratorLocalities(localitySearch, localityPage);
  const { contacts, saveContact, removeContact } = useContacts({
    selected,
    contactPage,
    editingContact,
    contactName,
    email,
    phoneNumber,
    setContactPage,
    resetContact,
  });
  function reset() {
    setEditing(null);
    setName("");
    setAddress("");
    setLocalityId("");
    setSelectedLocality(null);
  }
  function resetContact() {
    setEditingContact(null);
    setContactName("");
    setEmail("");
    setPhoneNumber("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }
  function submitContact(event: FormEvent) {
    event.preventDefault();
    saveContact.mutate();
  }
  function beginEdit(collaborator: Collaborator) {
    setEditing(collaborator);
    setName(collaborator.name);
    setAddress(collaborator.address);
    setLocalityId(String(collaborator.localityId));
    setSelectedLocality({ id: collaborator.localityId, name: collaborator.localityName });
  }
  return (
    <main className="page">
      <header className="page-header">
        <h1>Colaboradores</h1>
        <p>Gestiona colaboradores y sus contactos.</p>
      </header>
      <CollaboratorForm
        editing={editing}
        submit={submit}
        name={name}
        setName={setName}
        address={address}
        setAddress={setAddress}
        localitySearch={localitySearch}
        setLocalitySearch={setLocalitySearch}
        setLocalityPage={setLocalityPage}
        localityId={localityId}
        setLocalityId={setLocalityId}
        setSelectedLocality={setSelectedLocality}
        localitiesQuery={localitiesQuery}
        selectedLocality={selectedLocality}
        localityPage={localityPage}
        save={save}
        remove={remove}
        reset={reset}
      />
      <CollaboratorList
        search={search}
        setSearch={setSearch}
        setFilter={setFilter}
        page={page}
        setPage={setPage}
        collaboratorsQuery={collaboratorsQuery}
        save={save}
        remove={remove}
        saveContact={saveContact}
        removeContact={removeContact}
        beginEdit={beginEdit}
        resetContact={resetContact}
        setSelected={setSelected}
        setContactPage={setContactPage}
      />
      {selected && (
        <ContactsSection
          selected={selected}
          setSelected={setSelected}
          resetContact={resetContact}
          submitContact={submitContact}
          contactName={contactName}
          setContactName={setContactName}
          email={email}
          setEmail={setEmail}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          editingContact={editingContact}
          setEditingContact={setEditingContact}
          contacts={contacts}
          saveContact={saveContact}
          removeContact={removeContact}
          contactPage={contactPage}
          setContactPage={setContactPage}
        />
      )}
    </main>
  );
}
