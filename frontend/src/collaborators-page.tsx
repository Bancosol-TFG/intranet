import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  createContact,
  updateContact,
  deleteContact,
  listCollaborators,
  listContacts,
  listLocalities,
  type Collaborator,
  type Contact,
} from "./collaborators-api";
export function CollaboratorsPage() {
  const queryClient = useQueryClient();
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
  const collaboratorsQuery = useQuery({
    queryKey: ["collaborators", filter, page],
    queryFn: () => listCollaborators(filter, "", page),
  });
  const localitiesQuery = useQuery({
    queryKey: ["localities", localitySearch, localityPage],
    queryFn: () => listLocalities(localitySearch, localityPage),
  });
  const contacts = useQuery({
    queryKey: ["contacts", selected?.id, contactPage],
    queryFn: () => listContacts(selected!.id, contactPage),
    enabled: !!selected,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["collaborators"] });
  const save = useMutation({
    mutationFn: () =>
      editing
        ? updateCollaborator(editing.id, { name, address, localityId: Number(localityId) })
        : createCollaborator({ name, address, localityId: Number(localityId) }),
    onSuccess: async () => {
      setPage(0);
      reset();
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: deleteCollaborator,
    onSuccess: async (_result, deletedCollaboratorId) => {
      setPage(0);
      setSelected(null);
      resetContact();
      if (editing?.id === deletedCollaboratorId) reset();
      await refresh();
    },
  });
  const saveContact = useMutation({
    mutationFn: () =>
      editingContact
        ? updateContact(selected!.id, editingContact.id, {
            name: contactName,
            email: email || null,
            phoneNumber: phoneNumber || null,
          })
        : createContact(selected!.id, {
            name: contactName,
            email: email || null,
            phoneNumber: phoneNumber || null,
          }),
    onSuccess: async () => {
      setContactPage(0);
      resetContact();
      await queryClient.invalidateQueries({ queryKey: ["contacts", selected?.id] });
    },
  });
  const removeContact = useMutation({
    mutationFn: (id: number) => deleteContact(selected!.id, id),
    onSuccess: async (_result, deletedContactId) => {
      setContactPage(0);
      if (editingContact?.id === deletedContactId) resetContact();
      await queryClient.invalidateQueries({ queryKey: ["contacts", selected?.id] });
    },
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
      <section className="panel">
        <h2>Listado</h2>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(0);
            setFilter(search.trim());
          }}
        >
          <label>
            Buscar por nombre
            <input value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <button>Buscar</button>
        </form>
        {collaboratorsQuery.isPending && <p role="status">Cargando colaboradores…</p>}
        {collaboratorsQuery.isError && (
          <p role="alert" className="error-message">
            {collaboratorsQuery.error.message}
          </p>
        )}
        {collaboratorsQuery.data?.content.length === 0 && (
          <p role="status">No hay colaboradores.</p>
        )}
        {!!collaboratorsQuery.data?.content.length && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Localidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {collaboratorsQuery.data.content.map((collaborator) => (
                  <tr key={collaborator.id}>
                    <td>{collaborator.name}</td>
                    <td>{collaborator.address}</td>
                    <td>{collaborator.localityName}</td>
                    <td className="actions">
                      <button
                        disabled={save.isPending || remove.isPending}
                        onClick={() => beginEdit(collaborator)}
                      >
                        Editar
                      </button>
                      <button
                        disabled={saveContact.isPending || removeContact.isPending}
                        onClick={() => {
                          resetContact();
                          setSelected(collaborator);
                          setContactPage(0);
                        }}
                      >
                        Contactos
                      </button>
                      <button
                        disabled={
                          save.isPending ||
                          remove.isPending ||
                          saveContact.isPending ||
                          removeContact.isPending
                        }
                        onClick={() =>
                          window.confirm(`¿Borrar a ${collaborator.name}?`) &&
                          remove.mutate(collaborator.id)
                        }
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav className="pagination" aria-label="Paginación de colaboradores">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>
            Página {collaboratorsQuery.data?.page.totalPages ? page + 1 : 0} de{" "}
            {collaboratorsQuery.data?.page.totalPages ?? 0}
          </span>
          <button
            disabled={
              !collaboratorsQuery.data || page + 1 >= collaboratorsQuery.data.page.totalPages
            }
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </nav>
        {remove.isError && (
          <p role="alert" className="error-message">
            {remove.error.message}
          </p>
        )}
      </section>
      {selected && (
        <section className="panel">
          <h2>Contactos de {selected.name}</h2>
          <button
            disabled={saveContact.isPending || removeContact.isPending}
            onClick={() => {
              setSelected(null);
              resetContact();
            }}
          >
            Cerrar
          </button>
          <form className="form-grid" onSubmit={submitContact}>
            <label>
              Nombre
              <input
                required
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Teléfono
              <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
            </label>
            <div className="actions">
              <button disabled={saveContact.isPending || removeContact.isPending}>
                {editingContact ? "Guardar contacto" : "Añadir contacto"}
              </button>
              {editingContact && (
                <button
                  type="button"
                  disabled={saveContact.isPending || removeContact.isPending}
                  onClick={resetContact}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
          {saveContact.isError && (
            <p role="alert" className="error-message">
              {saveContact.error.message}
            </p>
          )}
          {removeContact.isError && (
            <p role="alert" className="error-message">
              {removeContact.error.message}
            </p>
          )}
          {contacts.isPending && <p role="status">Cargando contactos…</p>}
          {contacts.isError && (
            <p role="alert" className="error-message">
              {contacts.error.message}
            </p>
          )}
          {contacts.data?.content.length === 0 && <p role="status">No hay contactos.</p>}
          {!!contacts.data?.content.length && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.data.content.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phoneNumber}</td>
                      <td className="actions">
                        <button
                          disabled={saveContact.isPending || removeContact.isPending}
                          onClick={() => {
                            setEditingContact(contact);
                            setContactName(contact.name);
                            setEmail(contact.email ?? "");
                            setPhoneNumber(contact.phoneNumber ?? "");
                          }}
                        >
                          Editar
                        </button>
                        <button
                          disabled={saveContact.isPending || removeContact.isPending}
                          onClick={() => {
                            if (editingContact?.id === contact.id) resetContact();
                            removeContact.mutate(contact.id);
                          }}
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <nav className="pagination" aria-label="Paginación de contactos">
            <button disabled={contactPage === 0} onClick={() => setContactPage(contactPage - 1)}>
              Anterior
            </button>
            <span>
              Página {contacts.data?.page.totalPages ? contactPage + 1 : 0} de{" "}
              {contacts.data?.page.totalPages ?? 0}
            </span>
            <button
              disabled={!contacts.data || contactPage + 1 >= contacts.data.page.totalPages}
              onClick={() => setContactPage(contactPage + 1)}
            >
              Siguiente
            </button>
          </nav>
        </section>
      )}
    </main>
  );
}
