import { useState, type FormEvent } from "react";
import "./stores.css";

import { defaultExceptionRange } from "./scheduleDates";
import type { ScheduleException } from "./storesTypes";
import { useScheduleExceptions, type ExceptionDayInput } from "./useScheduleExceptions";

type Props = { storeId: number };
type DraftSlot = { key: string; id?: number; openingTime: string; closingTime: string };
type Editor = Omit<ExceptionDayInput, "slots"> & { slots: DraftSlot[] };

function emptySlot(): DraftSlot {
  return { key: crypto.randomUUID(), openingTime: "", closingTime: "" };
}

export function ScheduleExceptions({ storeId }: Props) {
  const [range, setRange] = useState(defaultExceptionRange);
  const [filters, setFilters] = useState(range);
  const [editor, setEditor] = useState<Editor | null>(null);
  const { exceptionsQuery, days, saveMutation, deleteMutation } = useScheduleExceptions(
    storeId,
    range.from,
    range.to,
  );
  const busy = saveMutation.isPending || deleteMutation.isPending;
  const error = saveMutation.error ?? deleteMutation.error;

  function beginEdit(date: string, existing: ScheduleException[] = []) {
    saveMutation.reset();
    deleteMutation.reset();
    setEditor({
      date,
      existing,
      closed: existing.some((row) => row.closed),
      slots: existing
        .filter((row) => !row.closed)
        .map((row) => ({
          key: String(row.id),
          id: row.id,
          openingTime: row.openingTime?.slice(0, 5) ?? "",
          closingTime: row.closingTime?.slice(0, 5) ?? "",
        })),
    });
  }

  function submitDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || busy) return;
    saveMutation.mutate(editor, { onSuccess: () => setEditor(null) });
  }

  function updateSlot(key: string, field: "openingTime" | "closingTime", value: string) {
    if (!editor) return;
    setEditor({
      ...editor,
      slots: editor.slots.map((slot) => (slot.key === key ? { ...slot, [field]: value } : slot)),
    });
  }

  function removeExceptions(rows: ScheduleException[]) {
    if (window.confirm("¿Quieres borrar las excepciones seleccionadas?")) {
      saveMutation.reset();
      deleteMutation.mutate(
        rows.map((row) => row.id),
        { onSuccess: () => setEditor(null) },
      );
    }
  }

  return (
    <section className="panel" aria-labelledby="schedule-exceptions-title">
      <h2 id="schedule-exceptions-title">Excepciones por fecha</h2>
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          if (filters.from <= filters.to) setRange(filters);
        }}
      >
        <label>
          Desde
          <input
            type="date"
            required
            value={filters.from}
            onChange={(event) => setFilters({ ...filters, from: event.target.value })}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            required
            min={filters.from}
            value={filters.to}
            onChange={(event) => setFilters({ ...filters, to: event.target.value })}
          />
        </label>
        <button type="submit" disabled={busy}>
          Filtrar fechas
        </button>
      </form>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          beginEdit(range.from);
          setEditor((current) => (current ? { ...current, slots: [emptySlot()] } : current));
        }}
      >
        Añadir día de excepción
      </button>
      {exceptionsQuery.isPending && (
        <p className="status" role="status">
          Cargando excepciones…
        </p>
      )}
      {exceptionsQuery.isError && (
        <p className="error-message" role="alert">
          {exceptionsQuery.error.message}
        </p>
      )}
      {exceptionsQuery.isSuccess && days.length === 0 && (
        <p className="status">No hay excepciones en estas fechas.</p>
      )}
      {days.map(([date, rows]) => (
        <section key={date} aria-label={`Excepciones del ${date}`}>
          <h3>{date}</h3>
          {rows.some((row) => row.closed) ? (
            <p className="status">Cerrado</p>
          ) : (
            <ul>
              {[...rows]
                .sort((first, second) =>
                  (first.openingTime ?? "").localeCompare(second.openingTime ?? ""),
                )
                .map((row) => (
                  <li className="actions" key={row.id}>
                    <span>
                      {row.openingTime?.slice(0, 5)}–{row.closingTime?.slice(0, 5)}
                    </span>
                    <button type="button" disabled={busy} onClick={() => removeExceptions([row])}>
                      Borrar tramo de excepción
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <div className="actions">
            <button type="button" disabled={busy} onClick={() => beginEdit(date, rows)}>
              Editar día
            </button>
            <button type="button" disabled={busy} onClick={() => removeExceptions(rows)}>
              Borrar día
            </button>
          </div>
        </section>
      ))}
      {editor && (
        <form className="form-grid" aria-label="Día de excepción" onSubmit={submitDay}>
          <label>
            Fecha de excepción
            <input
              type="date"
              required
              disabled={busy}
              value={editor.date}
              onChange={(event) => setEditor({ ...editor, date: event.target.value })}
            />
          </label>
          <label className="exception-closed">
            <input
              type="checkbox"
              disabled={busy}
              checked={editor.closed}
              onChange={(event) => setEditor({ ...editor, closed: event.target.checked })}
            />
            Cerrado todo el día
          </label>
          {!editor.closed && (
            <div>
              {editor.slots.map((slot, index) => (
                <div className="form-grid" key={slot.key}>
                  <label>
                    Apertura del tramo {index + 1}
                    <input
                      type="time"
                      required
                      disabled={busy}
                      value={slot.openingTime}
                      onChange={(event) => updateSlot(slot.key, "openingTime", event.target.value)}
                    />
                  </label>
                  <label>
                    Cierre del tramo {index + 1}
                    <input
                      type="time"
                      required
                      disabled={busy}
                      value={slot.closingTime}
                      onChange={(event) => updateSlot(slot.key, "closingTime", event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setEditor({
                        ...editor,
                        slots: editor.slots.filter((current) => current.key !== slot.key),
                      })
                    }
                  >
                    Quitar tramo
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditor({ ...editor, slots: [...editor.slots, emptySlot()] })}
              >
                Añadir tramo de excepción
              </button>
            </div>
          )}
          <div className="actions">
            <button type="submit" disabled={busy}>
              Guardar excepción
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setEditor(null);
                saveMutation.reset();
              }}
            >
              Cancelar excepción
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error.message} Comprueba los datos actualizados antes de volver a guardar.
        </p>
      )}
    </section>
  );
}
