import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useLogin } from "./useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const user = await login.mutateAsync({ email, password });
    await navigate({ to: user.mustChangePassword ? "/change-password" : "/" });
  }

  return (
    <main className="page">
      <h1>Iniciar sesión</h1>
      <form onSubmit={(event) => void submit(event).catch(() => undefined)}>
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
        {login.error && <p role="alert">{login.error.message}</p>}
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
