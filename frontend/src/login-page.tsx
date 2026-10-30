import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authApi } from "./api/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const user = await authApi.login(email, password);
      await navigate({ to: user.mustChangePassword ? "/change-password" : "/" });
    } catch (loginError) {
      setError((loginError as Error).message);
    }
  }

  return (
    <main className="page">
      <h1>Iniciar sesión</h1>
      <form onSubmit={(event) => void submit(event)}>
        <label>
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
