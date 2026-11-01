import { request, type PageResponse } from "../../shared/api/client";

import type { Collaborator, Contact, CollaboratorInput, ContactInput } from "./collaboratorTypes";

function listCollaborators(name: string, localityId: string, page: number) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: "10",
    sort: "name,asc",
  });
  if (name) searchParams.set("name", name);
  if (localityId) searchParams.set("localityId", localityId);
  return request<PageResponse<Collaborator>>(`/collaborators?${searchParams}`);
}

function listContacts(collaboratorId: number, page: number) {
  return request<PageResponse<Contact>>(
    `/collaborators/${collaboratorId}/contacts?page=${page}&size=10&sort=name,asc`,
  );
}

function createCollaborator(input: CollaboratorInput) {
  return request<Collaborator>("/collaborators", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

function updateCollaborator(collaboratorId: number, input: CollaboratorInput) {
  return request<Collaborator>(`/collaborators/${collaboratorId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

function deleteCollaborator(collaboratorId: number) {
  return request<void>(`/collaborators/${collaboratorId}`, { method: "DELETE" });
}

function createContact(collaboratorId: number, input: ContactInput) {
  return request<Contact>(`/collaborators/${collaboratorId}/contacts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

function updateContact(collaboratorId: number, contactId: number, input: ContactInput) {
  return request<Contact>(`/collaborators/${collaboratorId}/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

function deleteContact(collaboratorId: number, contactId: number) {
  return request<void>(`/collaborators/${collaboratorId}/contacts/${contactId}`, {
    method: "DELETE",
  });
}

export const collaboratorsApi = {
  list: listCollaborators,
  create: createCollaborator,
  update: updateCollaborator,
  delete: deleteCollaborator,
};

export const contactsApi = {
  list: listContacts,
  create: createContact,
  update: updateContact,
  delete: deleteContact,
};
