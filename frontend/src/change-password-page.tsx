import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authApi } from "./api/auth";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await authApi.changePassword(currentPassword, newPassword);
      await navigate({ to: "/login" });
    } catch (changeError) {
      setError((changeError as Error).message);
    }
  }

  return (
    <main className="page">
      <h1>Cambiar contraseña</h1>
      <form onSubmit={(event) => void submit(event)}>
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
        {error && <p role="alert">{error}</p>}
        <button type="submit">Guardar</button>
      </form>
    </main>
  );
}
