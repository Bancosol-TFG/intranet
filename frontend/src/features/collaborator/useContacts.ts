import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "./collaboratorsApi";
import type { Collaborator, Contact } from "./collaboratorTypes";
type Options = {
  selected: Collaborator | null;
  contactPage: number;
  editingContact: Contact | null;
  contactName: string;
  email: string;
  phoneNumber: string;
  setContactPage: (value: number) => void;
  resetContact: () => void;
};
export function useContacts({
  selected,
  contactPage,
  editingContact,
  contactName,
  email,
  phoneNumber,
  setContactPage,
  resetContact,
}: Options) {
  const queryClient = useQueryClient();
  const contacts = useQuery({
    queryKey: ["contacts", selected?.id, contactPage],
    queryFn: () => contactsApi.list(selected!.id, contactPage),
    enabled: !!selected,
  });
  const saveContact = useMutation({
    mutationFn: () =>
      editingContact
        ? contactsApi.update(selected!.id, editingContact.id, {
            name: contactName,
            email: email || null,
            phoneNumber: phoneNumber || null,
          })
        : contactsApi.create(selected!.id, {
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
    mutationFn: (id: number) => contactsApi.delete(selected!.id, id),
    onSuccess: async (_result, deletedContactId) => {
      setContactPage(0);
      if (editingContact?.id === deletedContactId) resetContact();
      await queryClient.invalidateQueries({ queryKey: ["contacts", selected?.id] });
    },
  });
  return { contacts, saveContact, removeContact };
}
