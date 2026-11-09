import { useState, type FormEvent } from "react";
import "./stores.css";

import { ApiError } from "../../shared/api/client";
import { defaultExceptionRange } from "./scheduleDates";
import type { ScheduleException } from "./storesTypes";
import { useScheduleExceptions, type ExceptionDayInput } from "./useScheduleExceptions";

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type Props = { storeId: number };
type DraftSlot = { key: string; id?: number; openingTime: string; closingTime: string };
type Editor = Omit<ExceptionDayInput, "slots"> & { slots: DraftSlot[] };
type EditorProps = {
  editor: Editor;
  busy: boolean;
  error: Error | null;
  onChange: (editor: Editor) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function emptySlot(): DraftSlot {
  return { key: crypto.randomUUID(), openingTime: "", closingTime: "" };
}

function displayDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return DATE_FORMAT.format(new Date(year, month - 1, day));
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

  function beginEdit(date: string, existing: ScheduleException[] = []) {
    saveMutation.reset();
    deleteMutation.reset();
    setEditor({
      date,
      existing,
      closed: existing.some((row) => row.closed),
      slots: existing.length
        ? existing
            .filter((row) => !row.closed)
            .map((row) => ({
              key: String(row.id),
              id: row.id,
              openingTime: row.openingTime?.slice(0, 5) ?? "",
              closingTime: row.closingTime?.slice(0, 5) ?? "",
            }))
        : [],
    });
  }

  function submitDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || busy) return;
    saveMutation.mutate(editor, {
      onSuccess: () => setEditor(null),
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) setEditor(null);
      },
    });
  }

  function cancelEditing() {
    setEditor(null);
    saveMutation.reset();
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
    <section className="panel exceptions" aria-labelledby="schedule-exceptions-title">
      <header className="exceptions-header">
        <div>
          <h2 id="schedule-exceptions-title">Excepciones por fecha</h2>
          <p className="exceptions-description">
            Define cierres u horarios especiales para días concretos. Cada excepción sustituye el
            horario semanal de esa fecha.
          </p>
        </div>
        <button type="button" disabled={busy} onClick={() => beginEdit("")}>
          Añadir excepción
        </button>
      </header>

      {editor && (
        <ExceptionDayForm
          editor={editor}
          busy={busy}
          error={saveMutation.error}
          onChange={setEditor}
          onSubmit={submitDay}
          onCancel={cancelEditing}
        />
      )}
      {!editor && saveMutation.isError && (
        <p className="error-message" role="alert">
          No se ha guardado la excepción. Revisa el listado actualizado y vuelve a editar el día.
        </p>
      )}

      <div className="exceptions-saved">
        <h3>Excepciones guardadas</h3>
        <form
          className="exceptions-filters"
          aria-label="Filtrar excepciones por fecha"
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
          <button type="submit" className="secondary" disabled={busy}>
            Aplicar filtro
          </button>
        </form>

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
        {deleteMutation.isError && (
          <p className="error-message" role="alert">
            {deleteMutation.error.message} Comprueba las excepciones guardadas antes de volver a
            intentarlo.
          </p>
        )}
        {exceptionsQuery.isSuccess && days.length === 0 && (
          <div className="exceptions-empty" role="status">
            <strong>No hay excepciones en este periodo</strong>
            <p>
              Se aplica el horario semanal. Añade una excepción si necesitas cerrar o cambiar las
              horas de un día.
            </p>
          </div>
        )}
        <div className="exceptions-days">
          {days.map(([date, rows]) => {
            const closed = rows.some((row) => row.closed);
            return (
              <article
                key={date}
                className="exception-day"
                aria-labelledby={`exception-date-${date}`}
              >
                <header className="exception-day-header">
                  <div>
                    <h4 id={`exception-date-${date}`}>
                      <time dateTime={date}>{displayDate(date)}</time>
                    </h4>
                    <span className={`exception-badge${closed ? " exception-badge-closed" : ""}`}>
                      {closed ? "Cerrado todo el día" : "Horario especial"}
                    </span>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy}
                      onClick={() => beginEdit(date, rows)}
                    >
                      Editar día
                    </button>
                    <button
                      type="button"
                      className="secondary exception-delete"
                      disabled={busy}
                      onClick={() => removeExceptions(rows)}
                    >
                      Eliminar día
                    </button>
                  </div>
                </header>
                {closed ? (
                  <p className="exception-day-note">La tienda permanecerá cerrada en esta fecha.</p>
                ) : (
                  <ul className="exception-slots">
                    {[...rows]
                      .sort((first, second) =>
                        (first.openingTime ?? "").localeCompare(second.openingTime ?? ""),
                      )
                      .map((row) => (
                        <li key={row.id}>
                          <span className="exception-slot-time">
                            {row.openingTime?.slice(0, 5)}–{row.closingTime?.slice(0, 5)}
                          </span>
                          <button
                            type="button"
                            className="secondary exception-delete"
                            disabled={busy}
                            onClick={() => removeExceptions([row])}
                          >
                            Eliminar tramo
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExceptionDayForm({ editor, busy, error, onChange, onSubmit, onCancel }: EditorProps) {
  return (
    <form className="exception-editor" aria-labelledby="exception-editor-title" onSubmit={onSubmit}>
      <header>
        <h3 id="exception-editor-title">
          {editor.existing.length ? "Editar excepción" : "Nueva excepción"}
        </h3>
        <p>Elige una fecha e indica cómo abrirá la tienda ese día.</p>
      </header>
      <label className="exception-date-field">
        Fecha de excepción
        <input
          type="date"
          required
          disabled={busy}
          value={editor.date}
          onChange={(event) => onChange({ ...editor, date: event.target.value })}
        />
      </label>
      {editor.date && (
        <>
          <label className="exception-closed">
            <input
              type="checkbox"
              disabled={busy}
              checked={editor.closed}
              onChange={(event) => onChange({ ...editor, closed: event.target.checked })}
            />
            Cerrado todo el día
          </label>
          {!editor.closed && (
            <fieldset className="exception-editor-slots" disabled={busy}>
              <legend>Tramos de apertura</legend>
              <button
                type="button"
                className="secondary"
                onClick={() => onChange({ ...editor, slots: [...editor.slots, emptySlot()] })}
              >
                Añadir tramo
              </button>
              {editor.slots.map((slot, index) => (
                <div className="exception-slot-editor" key={slot.key}>
                  <label>
                    Apertura del tramo {index + 1}
                    <input
                      type="time"
                      required
                      value={slot.openingTime}
                      onChange={(event) =>
                        onChange({
                          ...editor,
                          slots: editor.slots.map((current) =>
                            current.key === slot.key
                              ? { ...current, openingTime: event.target.value }
                              : current,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Cierre del tramo {index + 1}
                    <input
                      type="time"
                      required
                      value={slot.closingTime}
                      onChange={(event) =>
                        onChange({
                          ...editor,
                          slots: editor.slots.map((current) =>
                            current.key === slot.key
                              ? { ...current, closingTime: event.target.value }
                              : current,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="secondary"
                    aria-label={`Quitar tramo ${index + 1}`}
                    onClick={() =>
                      onChange({
                        ...editor,
                        slots: editor.slots.filter((current) => current.key !== slot.key),
                      })
                    }
                  >
                    Quitar tramo
                  </button>
                </div>
              ))}
            </fieldset>
          )}
        </>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error.message} Comprueba los datos actualizados antes de volver a guardar.
        </p>
      )}
      <footer className="exception-editor-actions">
        <button type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar excepción"}
        </button>
        <button type="button" className="secondary" disabled={busy} onClick={onCancel}>
          Cancelar
        </button>
      </footer>
    </form>
  );
}
