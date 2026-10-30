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
