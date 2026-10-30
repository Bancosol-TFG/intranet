import { createRootRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { authApi } from "../api/auth";
import { getCurrentUser } from "../api/session";

const LOGIN_ROUTE = "/login";
const CHANGE_PASSWORD_ROUTE = "/change-password";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === LOGIN_ROUTE) {
      return;
    }
    const user = await authApi.restoreSession();
    if (!user) {
      throw redirect({ to: LOGIN_ROUTE });
    }
    if (user.mustChangePassword && location.pathname !== CHANGE_PASSWORD_ROUTE) {
      throw redirect({ to: CHANGE_PASSWORD_ROUTE });
    }
  },
  component: RootLayout,
});

// TanStack route modules export a Route object, which this rule does not recognize as a component.
// oxlint-disable-next-line react/only-export-components
function RootLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  async function logout() {
    await authApi.logout();
    await navigate({ to: LOGIN_ROUTE });
  }

  return (
    <>
      {user && (
        <nav className="navigation" aria-label="Navegación principal">
          <Link to="/">Intranet</Link>
          <Link to="/collaborators">Colaboradores</Link>
          <Link to="/localities">Localidades</Link>
          <Link to="/zones">Zonas</Link>
          <button type="button" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </nav>
      )}
      <Outlet />
    </>
  );
}
