import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { scheduleExceptionsApi } from "./scheduleExceptionsApi";
import type { ScheduleException } from "./storesTypes";

export type ExceptionDayInput = {
  date: string;
  closed: boolean;
  slots: { id?: number; openingTime: string; closingTime: string }[];
  existing: ScheduleException[];
};

async function loadExceptions(storeId: number, from: string, to: string) {
  const firstPage = await scheduleExceptionsApi.list(storeId, { from, to, page: 0 });
  const exceptions = [...firstPage.content];
  for (let page = 1; page < firstPage.page.totalPages; page += 1) {
    const nextPage = await scheduleExceptionsApi.list(storeId, { from, to, page });
    exceptions.push(...nextPage.content);
  }
  return exceptions;
}

async function saveExceptionDay(storeId: number, day: ExceptionDayInput) {
  const slots = [...day.slots].sort((first, second) =>
    first.openingTime.localeCompare(second.openingTime),
  );
  if (!day.date) throw new Error("Selecciona una fecha.");
  if (!day.closed && slots.length === 0)
    throw new Error("Añade al menos un tramo o marca el día como cerrado.");
  if (!day.closed) {
    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      if (!slot.openingTime || !slot.closingTime || slot.closingTime <= slot.openingTime) {
        throw new Error("La hora de cierre debe ser posterior a la de apertura.");
      }
      if (index > 0 && slots[index - 1].closingTime > slot.openingTime) {
        throw new Error("Los tramos del día no pueden solaparse.");
      }
    }
  }

  return scheduleExceptionsApi.replaceDay(storeId, {
    originalDate: day.existing[0]?.date ?? null,
    date: day.date,
    closed: day.closed,
    slots: day.closed
      ? []
      : slots.map(({ id, openingTime, closingTime }) => ({ id, openingTime, closingTime })),
    expected: day.existing,
  });
}

export function useScheduleExceptions(storeId: number, from: string, to: string) {
  const queryClient = useQueryClient();
  const exceptionsQuery = useQuery({
    queryKey: ["stores", storeId, "exceptions", from, to],
    queryFn: () => loadExceptions(storeId, from, to),
    enabled: Boolean(from && to && from <= to),
  });
  const refreshSchedules = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["stores", storeId, "exceptions"] }),
      queryClient.invalidateQueries({ queryKey: ["stores", storeId, "effective-schedule"] }),
    ]);
  };
  const saveMutation = useMutation({
    mutationFn: (day: ExceptionDayInput) => saveExceptionDay(storeId, day),
    onSettled: refreshSchedules,
  });
  const deleteMutation = useMutation({
    mutationFn: async (exceptionIds: number[]) => {
      if (exceptionIds.length === 1) {
        await scheduleExceptionsApi.delete(storeId, exceptionIds[0]);
        return;
      }
      const expected = (exceptionsQuery.data ?? []).filter((row) => exceptionIds.includes(row.id));
      const date = expected[0]?.date;
      if (
        !date ||
        expected.length !== exceptionIds.length ||
        expected.some((row) => row.date !== date)
      ) {
        throw new Error("Las excepciones han cambiado. Actualiza el listado e inténtalo de nuevo.");
      }
      await scheduleExceptionsApi.replaceDay(storeId, {
        originalDate: date,
        date,
        closed: false,
        slots: [],
        expected,
      });
    },
    onSettled: refreshSchedules,
  });
  const days = new Map<string, ScheduleException[]>();
  for (const exception of exceptionsQuery.data ?? []) {
    const rows = days.get(exception.date) ?? [];
    rows.push(exception);
    days.set(exception.date, rows);
  }

  return {
    exceptionsQuery,
    days: [...days.entries()].sort(([first], [second]) => first.localeCompare(second)),
    saveMutation,
    deleteMutation,
  };
}

export function useEffectiveSchedule(storeId: number, date: string) {
  return useQuery({
    queryKey: ["stores", storeId, "effective-schedule", date],
    queryFn: () => scheduleExceptionsApi.effective(storeId, date),
    enabled: Boolean(date),
  });
}
