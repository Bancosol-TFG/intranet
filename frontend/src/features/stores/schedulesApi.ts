import { request } from "../../shared/api/client";

import type { ScheduleDay, ScheduleResponse, ScheduleSlotRequest } from "./storesTypes";

function listSchedules(storeId: number): Promise<ScheduleDay[]> {
  return request(`/stores/${storeId}/schedules`);
}

function createSchedule(storeId: number, input: ScheduleSlotRequest): Promise<ScheduleResponse> {
  return request(`/stores/${storeId}/schedules`, { method: "POST", body: JSON.stringify(input) });
}

function updateSchedule(
  storeId: number,
  scheduleId: number,
  input: ScheduleSlotRequest,
): Promise<ScheduleResponse> {
  return request(`/stores/${storeId}/schedules/${scheduleId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

function deleteSchedule(storeId: number, scheduleId: number): Promise<void> {
  return request(`/stores/${storeId}/schedules/${scheduleId}`, { method: "DELETE" });
}

export const schedulesApi = {
  list: listSchedules,
  create: createSchedule,
  update: updateSchedule,
  delete: deleteSchedule,
};
