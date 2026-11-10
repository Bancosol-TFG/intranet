import { useState } from "react";

import { localDate } from "./scheduleDates";
import { useEffectiveSchedule } from "./useScheduleExceptions";

type Props = { storeId: number };

export function EffectiveSchedule({ storeId }: Props) {
  const [date, setDate] = useState(() => localDate(new Date()));
  const schedule = useEffectiveSchedule(storeId, date);

  return (
    <section className="panel" aria-labelledby="effective-schedule-title">
      <h2 id="effective-schedule-title">Horario efectivo</h2>
      <label>
        Fecha del horario efectivo
        <input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      {date && schedule.isPending && (
        <p className="status" role="status">
          Cargando horario efectivo…
        </p>
      )}
      {schedule.isError && (
        <p className="error-message" role="alert">
          {schedule.error.message}
        </p>
      )}
      {schedule.data && (
        <div>
          <p>Origen: {schedule.data.source === "EXCEPTION" ? "Excepción" : "Horario semanal"}</p>
          {schedule.data.closed ? (
            <p className="status">Cerrado</p>
          ) : (
            <ul>
              {schedule.data.slots.map((slot) => (
                <li key={`${slot.openingTime}-${slot.closingTime}`}>
                  {slot.openingTime.slice(0, 5)}–{slot.closingTime.slice(0, 5)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
