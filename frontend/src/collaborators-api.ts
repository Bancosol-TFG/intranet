import { request, type PageResponse } from "./api/client";

export type Collaborator = {
  id: number;
  name: string;
  address: string;
  localityId: number;
  localityName: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
};

export type CollaboratorInput = Omit<Collaborator, "id" | "localityName">;
export type ContactInput = Omit<Contact, "id">;

export function listCollaborators(name: string, localityId: string, page: number) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: "10",
    sort: "name,asc",
  });
  if (name) searchParams.set("name", name);
  if (localityId) searchParams.set("localityId", localityId);
  return request<PageResponse<Collaborator>>(`/collaborators?${searchParams}`);
}

export function listContacts(collaboratorId: number, page: number) {
  return request<PageResponse<Contact>>(
    `/collaborators/${collaboratorId}/contacts?page=${page}&size=10&sort=name,asc`,
  );
}

export function listLocalities(name: string, page: number) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: "10",
    sort: "name,asc",
  });
  if (name) searchParams.set("name", name);
  return request<PageResponse<{ id: number; name: string }>>(`/localities?${searchParams}`);
}

export function createCollaborator(input: CollaboratorInput) {
  return request<Collaborator>("/collaborators", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCollaborator(collaboratorId: number, input: CollaboratorInput) {
  return request<Collaborator>(`/collaborators/${collaboratorId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteCollaborator(collaboratorId: number) {
  return request<void>(`/collaborators/${collaboratorId}`, { method: "DELETE" });
}

export function createContact(collaboratorId: number, input: ContactInput) {
  return request<Contact>(`/collaborators/${collaboratorId}/contacts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateContact(collaboratorId: number, contactId: number, input: ContactInput) {
  return request<Contact>(`/collaborators/${collaboratorId}/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteContact(collaboratorId: number, contactId: number) {
  return request<void>(`/collaborators/${collaboratorId}/contacts/${contactId}`, {
    method: "DELETE",
  });
}
