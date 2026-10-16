import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// TanStack route modules export a Route object, which this rule does not recognize as a component.
// oxlint-disable-next-line react/only-export-components
function HomePage() {
  return <h1>Intranet</h1>
}
