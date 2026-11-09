import { Link } from "@tanstack/react-router";

import { ApiError } from "../../shared/api/client";
import { useStoreSchedule } from "./useStoreSchedule";
import { WeeklySchedule } from "./WeeklySchedule";
import { ScheduleExceptions } from "./ScheduleExceptions";
import { EffectiveSchedule } from "./EffectiveSchedule";

type Props = { storeId: number };

export function StoreSchedulePage({ storeId }: Props) {
  const schedule = useStoreSchedule(storeId);
  const { storeQuery, schedulesQuery, createMutation, updateMutation, deleteMutation } = schedule;
  const missingStore = [
    storeQuery.error,
    schedulesQuery.error,
    createMutation.error,
    updateMutation.error,
    deleteMutation.error,
  ].some((error) => error instanceof ApiError && error.status === 404);

  return (
    <main className="page">
      <header className="page-header">
        <h1>{storeQuery.data ? `Horario de ${storeQuery.data.name}` : "Horario de tienda"}</h1>
        <Link to="/stores">Volver a tiendas</Link>
      </header>
      {missingStore ? (
        <p className="error-message" role="alert">
          La tienda no existe
        </p>
      ) : storeQuery.isPending ? (
        <p className="status" role="status">
          Cargando tienda…
        </p>
      ) : storeQuery.isError ? (
        <p className="error-message" role="alert">
          {storeQuery.error.message}
        </p>
      ) : (
        <>
          <WeeklySchedule key={storeId} schedule={schedule} />
          <ScheduleExceptions key={`exceptions-${storeId}`} storeId={storeId} />
          <EffectiveSchedule key={`effective-${storeId}`} storeId={storeId} />
        </>
      )}
    </main>
  );
}
