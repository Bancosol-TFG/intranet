import type { FormEvent } from "react";
import type { Collaborator, Contact } from "./collaboratorTypes";
import type { useContacts } from "./useContacts";
type ContactsState = ReturnType<typeof useContacts>;
type Props = {
  selected: Collaborator;
  setSelected: (value: Collaborator | null) => void;
  resetContact: () => void;
  submitContact: (event: FormEvent) => void;
  contactName: string;
  setContactName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  editingContact: Contact | null;
  setEditingContact: (value: Contact | null) => void;
  contacts: ContactsState["contacts"];
  saveContact: ContactsState["saveContact"];
  removeContact: ContactsState["removeContact"];
  contactPage: number;
  setContactPage: (value: number) => void;
};
export function ContactsSection({
  selected,
  setSelected,
  resetContact,
  submitContact,
  contactName,
  setContactName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  editingContact,
  setEditingContact,
  contacts,
  saveContact,
  removeContact,
  contactPage,
  setContactPage,
}: Props) {
  return (
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
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
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
  );
}
