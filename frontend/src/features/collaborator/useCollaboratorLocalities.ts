import { useQuery } from "@tanstack/react-query";
import { localitiesApi } from "../territory/localitiesApi";
export function useCollaboratorLocalities(localitySearch: string, localityPage: number) {
  const localitiesQuery = useQuery({
    queryKey: ["localities", localitySearch, localityPage],
    queryFn: () => localitiesApi.list({ name: localitySearch, postalCode: "", page: localityPage }),
  });
  return localitiesQuery;
}
