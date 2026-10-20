# ADR-0010: PWA para la interfaz móvil

## Estado
Accepted

## Contexto
La aplicación móvil de voluntariado se implementará como una PWA. Esta decisión fija el tipo de cliente móvil; las funciones concretas y capacidades de la PWA, como las notificaciones, pueden concretarse por separado.

## Opciones consideradas
1. Implementar la interfaz móvil como PWA.
2. Desarrollar una aplicación móvil nativa o multiplataforma.
3. Mantener una interfaz web adaptable sin capacidades específicas de instalación.

## Decisión
Usar una PWA para la interfaz móvil de voluntariado.

## Consecuencias
**Positivas:**
- La interfaz móvil podrá distribuirse como aplicación web instalable sin mantener clientes nativos separados.

**Negativas:**
- Las capacidades disponibles y el soporte de funciones como notificaciones dependen de la plataforma y deben validarse en la implementación.
