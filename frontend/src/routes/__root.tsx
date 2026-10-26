import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="navigation" aria-label="Navegación principal">
        <Link to="/">Intranet</Link>
        <Link to="/localities">Localidades</Link>
        <Link to="/zones">Zonas</Link>
      </nav>
      <Outlet />
    </>
  ),
});
