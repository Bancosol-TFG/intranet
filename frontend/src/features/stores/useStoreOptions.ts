import { useQuery } from "@tanstack/react-query";

import type { PageResponse } from "../../shared/api/client";
import { localitiesApi } from "../territory/localitiesApi";
import { zonesApi } from "../territory/zonesApi";
import { chainsApi } from "./chainsApi";

async function loadAllOptions<T>(
  fetchPage: (page: number) => Promise<PageResponse<T>>,
): Promise<T[]> {
  const firstPage = await fetchPage(0);
  const options = [...firstPage.content];
  for (let page = 1; page < firstPage.page.totalPages; page += 1) {
    const nextPage = await fetchPage(page);
    options.push(...nextPage.content);
  }
  return options;
}

export function useStoreOptions() {
  const chainsQuery = useQuery({
    queryKey: ["chains", "options"],
    queryFn: () => loadAllOptions((page) => chainsApi.list({ code: "", page })),
  });
  const localitiesQuery = useQuery({
    queryKey: ["localities", "options"],
    queryFn: () => loadAllOptions((page) => localitiesApi.list({ name: "", postalCode: "", page })),
  });
  const zonesQuery = useQuery({
    queryKey: ["zones", "options"],
    queryFn: () => loadAllOptions((page) => zonesApi.list({ name: "", code: "", page })),
  });

  return { chainsQuery, localitiesQuery, zonesQuery };
}
