import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// TanStack route modules export a Route object, which this rule does not recognize as a component.
// oxlint-disable-next-line react/only-export-components
function HomePage() {
  return (
    <main className="page">
      <h1>Intranet</h1>
      <nav className="card-list">
        <Link to="/campaign-types">Tipos de campaña</Link>
      </nav>
    </main>
  );
}
