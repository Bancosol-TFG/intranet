import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../../shared/api/client";
import { schedulesApi } from "./schedulesApi";
import { storesApi } from "./storesApi";
import type { ScheduleSlotRequest } from "./storesTypes";

const SCHEDULE_ERROR_MESSAGES: Record<number, string> = {
  400: "La hora de cierre debe ser posterior a la de apertura",
  404: "La tienda no existe",
  409: "El tramo se solapa con otro del mismo día",
};

type UpdateInput = {
  scheduleId: number;
  input: ScheduleSlotRequest;
};

async function scheduleOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiError && SCHEDULE_ERROR_MESSAGES[error.status]) {
      throw new ApiError(error.status, SCHEDULE_ERROR_MESSAGES[error.status]);
    }
    throw error;
  }
}

export function useStoreSchedule(storeId: number) {
  const queryClient = useQueryClient();
  const storeQuery = useQuery({
    queryKey: ["stores", storeId],
    queryFn: () => storesApi.get(storeId),
  });
  const schedulesQuery = useQuery({
    queryKey: ["stores", storeId, "schedules"],
    queryFn: () => scheduleOperation(() => schedulesApi.list(storeId)),
    enabled: storeQuery.isSuccess,
  });
  const refreshSchedules = () =>
    queryClient.invalidateQueries({ queryKey: ["stores", storeId, "schedules"] });
  const createMutation = useMutation({
    mutationFn: (input: ScheduleSlotRequest) =>
      scheduleOperation(() => schedulesApi.create(storeId, input)),
    onSuccess: refreshSchedules,
  });
  const updateMutation = useMutation({
    mutationFn: ({ scheduleId, input }: UpdateInput) =>
      scheduleOperation(() => schedulesApi.update(storeId, scheduleId, input)),
    onSuccess: refreshSchedules,
  });
  const deleteMutation = useMutation({
    mutationFn: (scheduleId: number) =>
      scheduleOperation(() => schedulesApi.delete(storeId, scheduleId)),
    onSuccess: refreshSchedules,
  });

  return { storeQuery, schedulesQuery, createMutation, updateMutation, deleteMutation };
}
