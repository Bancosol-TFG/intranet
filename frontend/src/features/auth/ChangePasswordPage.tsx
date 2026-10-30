import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useChangePassword } from "./useAuth";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePassword = useChangePassword();

  async function submit(event: FormEvent) {
    event.preventDefault();
    await changePassword.mutateAsync({ currentPassword, newPassword });
    await navigate({ to: "/login" });
  }

  return (
    <main className="page">
      <h1>Cambiar contraseña</h1>
      <form onSubmit={(event) => void submit(event).catch(() => undefined)}>
        <label>
          Contraseña actual
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>
        <label>
          Contraseña nueva
          <input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        {changePassword.error && <p role="alert">{changePassword.error.message}</p>}
        <button type="submit">Guardar</button>
      </form>
    </main>
  );
}
