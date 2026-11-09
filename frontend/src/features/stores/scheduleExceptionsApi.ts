import { request, type PageResponse } from "../../shared/api/client";

import type {
  EffectiveSchedule,
  ScheduleException,
  ScheduleExceptionFilters,
  ScheduleExceptionRequest,
} from "./storesTypes";

function listExceptions(
  storeId: number,
  filters: ScheduleExceptionFilters,
): Promise<PageResponse<ScheduleException>> {
  const params = new URLSearchParams({ page: String(filters.page), size: "100" });
  params.append("sort", "date,asc");
  params.append("sort", "openingTime,asc");
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return request(`/stores/${storeId}/schedule-exceptions?${params.toString()}`);
}

function createException(
  storeId: number,
  input: ScheduleExceptionRequest,
): Promise<ScheduleException> {
  return request(`/stores/${storeId}/schedule-exceptions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

function updateException(
  storeId: number,
  exceptionId: number,
  input: ScheduleExceptionRequest,
): Promise<ScheduleException> {
  return request(`/stores/${storeId}/schedule-exceptions/${exceptionId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

function deleteException(storeId: number, exceptionId: number): Promise<void> {
  return request(`/stores/${storeId}/schedule-exceptions/${exceptionId}`, { method: "DELETE" });
}

function getEffectiveSchedule(storeId: number, date: string): Promise<EffectiveSchedule> {
  const params = new URLSearchParams({ date });
  return request(`/stores/${storeId}/schedule?${params.toString()}`);
}

export const scheduleExceptionsApi = {
  list: listExceptions,
  create: createException,
  update: updateException,
  delete: deleteException,
  effective: getEffectiveSchedule,
};
