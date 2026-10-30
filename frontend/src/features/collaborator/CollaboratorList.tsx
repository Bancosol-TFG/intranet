import type { Collaborator } from "./collaboratorTypes";
import type { useCollaborators } from "./useCollaborators";
import type { useContacts } from "./useContacts";
type CollaboratorState = ReturnType<typeof useCollaborators>;
type ContactsState = ReturnType<typeof useContacts>;
type Props = {
  search: string;
  setSearch: (value: string) => void;
  setFilter: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  collaboratorsQuery: CollaboratorState["collaboratorsQuery"];
  save: CollaboratorState["save"];
  remove: CollaboratorState["remove"];
  saveContact: ContactsState["saveContact"];
  removeContact: ContactsState["removeContact"];
  beginEdit: (value: Collaborator) => void;
  resetContact: () => void;
  setSelected: (value: Collaborator | null) => void;
  setContactPage: (value: number) => void;
};
export function CollaboratorList({
  search,
  setSearch,
  setFilter,
  page,
  setPage,
  collaboratorsQuery,
  save,
  remove,
  saveContact,
  removeContact,
  beginEdit,
  resetContact,
  setSelected,
  setContactPage,
}: Props) {
  return (
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
      {collaboratorsQuery.data?.content.length === 0 && <p role="status">No hay colaboradores.</p>}
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
          disabled={!collaboratorsQuery.data || page + 1 >= collaboratorsQuery.data.page.totalPages}
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
  );
}
