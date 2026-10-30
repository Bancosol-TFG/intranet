import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collaboratorsApi } from "./collaboratorsApi";
import type { Collaborator } from "./collaboratorTypes";
import type { Dispatch, SetStateAction } from "react";
type Options = {
  filter: string;
  page: number;
  editing: Collaborator | null;
  name: string;
  address: string;
  localityId: string;
  setPage: (value: number) => void;
  setSelected: Dispatch<SetStateAction<Collaborator | null>>;
  reset: () => void;
  resetContact: () => void;
};
export function useCollaborators({
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
}: Options) {
  const queryClient = useQueryClient();
  const collaboratorsQuery = useQuery({
    queryKey: ["collaborators", filter, page],
    queryFn: () => collaboratorsApi.list(filter, "", page),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["collaborators"] });
  const save = useMutation({
    mutationFn: () =>
      editing
        ? collaboratorsApi.update(editing.id, { name, address, localityId: Number(localityId) })
        : collaboratorsApi.create({ name, address, localityId: Number(localityId) }),
    onSuccess: async () => {
      setPage(0);
      reset();
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: collaboratorsApi.delete,
    onSuccess: async (_result, deletedCollaboratorId) => {
      setPage(0);
      setSelected(null);
      resetContact();
      if (editing?.id === deletedCollaboratorId) reset();
      await refresh();
    },
  });
  return { collaboratorsQuery, save, remove };
}
