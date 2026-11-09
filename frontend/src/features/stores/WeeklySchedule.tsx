import { useState, type FormEvent } from "react";

import type { ScheduleSlot } from "./storesTypes";
import type { useStoreSchedule } from "./useStoreSchedule";

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type Editor = {
  weekDay: number;
  scheduleId: number | null;
  openingTime: string;
  closingTime: string;
};

type Props = {
  schedule: Pick<
    ReturnType<typeof useStoreSchedule>,
    "schedulesQuery" | "createMutation" | "updateMutation" | "deleteMutation"
  >;
};

export function WeeklySchedule({ schedule }: Props) {
  const { schedulesQuery, createMutation, updateMutation, deleteMutation } = schedule;
  const [editor, setEditor] = useState<Editor | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  function clearErrors() {
    setValidationMessage("");
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  }

  function beginEdit(weekDay: number, slot?: ScheduleSlot) {
    clearErrors();
    setEditor({
      weekDay,
      scheduleId: slot?.id ?? null,
      openingTime: slot?.openingTime.slice(0, 5) ?? "",
      closingTime: slot?.closingTime.slice(0, 5) ?? "",
    });
  }

  function cancelEditing() {
    setEditor(null);
    clearErrors();
  }

  function submitSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || busy) return;
    clearErrors();
    if (editor.closingTime <= editor.openingTime) {
      setValidationMessage("La hora de cierre debe ser posterior a la de apertura");
      return;
    }
    const input = {
      weekDay: editor.weekDay,
      openingTime: editor.openingTime,
      closingTime: editor.closingTime,
    };
    const callbacks = { onSuccess: () => setEditor(null) };
    if (editor.scheduleId === null) {
      createMutation.mutate(input, callbacks);
    } else {
      updateMutation.mutate({ scheduleId: editor.scheduleId, input }, callbacks);
    }
  }

  function removeSlot(weekDay: number, slot: ScheduleSlot) {
    if (
      !window.confirm(
        `¿Quieres borrar el tramo del ${WEEK_DAYS[weekDay - 1].toLowerCase()} de ${slot.openingTime.slice(0, 5)} a ${slot.closingTime.slice(0, 5)}?`,
      )
    )
      return;
    clearErrors();
    deleteMutation.mutate(slot.id, {
      onSuccess: () => {
        if (editor?.scheduleId === slot.id) setEditor(null);
      },
    });
  }

  return (
    <section aria-labelledby="weekly-schedule-title">
      <h2 id="weekly-schedule-title">Horario semanal</h2>
      {schedulesQuery.isPending && (
        <p className="status" role="status">
          Cargando horario…
        </p>
      )}
      {schedulesQuery.isError && (
        <p className="error-message" role="alert">
          {schedulesQuery.error.message}
        </p>
      )}
      {schedulesQuery.isSuccess &&
        WEEK_DAYS.map((dayName, dayIndex) => {
          const weekDay = dayIndex + 1;
          const slots = [
            ...(schedulesQuery.data.find((day) => day.weekDay === weekDay)?.slots ?? []),
          ].sort((first, second) => first.openingTime.localeCompare(second.openingTime));
          return (
            <section key={weekDay} className="panel" aria-labelledby={`schedule-day-${weekDay}`}>
              <h3 id={`schedule-day-${weekDay}`}>{dayName}</h3>
              {slots.length === 0 ? (
                <p className="status">Cerrado</p>
              ) : (
                <ul>
                  {slots.map((slot) => (
                    <li key={slot.id}>
                      <span>
                        {slot.openingTime.slice(0, 5)}–{slot.closingTime.slice(0, 5)}
                      </span>
                      <div className="actions">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => beginEdit(weekDay, slot)}
                        >
                          Editar tramo
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeSlot(weekDay, slot)}
                        >
                          Borrar tramo
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" disabled={busy} onClick={() => beginEdit(weekDay)}>
                Añadir tramo
              </button>
              {editor?.weekDay === weekDay && (
                <form
                  className="form-grid"
                  aria-label={`Tramo del ${dayName.toLowerCase()}`}
                  onSubmit={submitSlot}
                >
                  <label>
                    Hora de apertura
                    <input
                      type="time"
                      required
                      value={editor.openingTime}
                      disabled={busy}
                      onChange={(event) =>
                        setEditor({ ...editor, openingTime: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Hora de cierre
                    <input
                      type="time"
                      required
                      value={editor.closingTime}
                      disabled={busy}
                      onChange={(event) =>
                        setEditor({ ...editor, closingTime: event.target.value })
                      }
                    />
                  </label>
                  <div className="actions">
                    <button type="submit" disabled={busy}>
                      {editor.scheduleId === null ? "Crear tramo" : "Guardar tramo"}
                    </button>
                    <button type="button" disabled={busy} onClick={cancelEditing}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </section>
          );
        })}
      {validationMessage && (
        <p className="error-message" role="alert">
          {validationMessage}
        </p>
      )}
      {mutationError && (
        <p className="error-message" role="alert">
          {mutationError.message}
        </p>
      )}
    </section>
  );
}
