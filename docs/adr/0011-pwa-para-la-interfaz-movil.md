# ADR-0011: PWA para la interfaz móvil

## Estado
Proposed

## Contexto
La arquitectura inicial contempla una interfaz de voluntariado para móvil. En la reunión del 30 de septiembre se discutió si debía ser una aplicación web progresiva o una aplicación móvil nativa, y qué capacidades —como notificaciones— se necesitan. No se cerraron los requisitos de plataforma ni las limitaciones aceptables.

## Opciones consideradas
1. Implementar la interfaz móvil como PWA.
2. Desarrollar una aplicación móvil nativa o multiplataforma.
3. Mantener una interfaz web adaptable sin capacidades específicas de instalación.

## Decisión
Pendiente. Antes de elegir la tecnología hay que confirmar con Bancosol los dispositivos objetivo y las funciones móviles necesarias.

## Consecuencias
**Positivas:**
- Una decisión alineada con los requisitos evita duplicar trabajo entre clientes.

**Negativas:**
- La implementación del cliente móvil y funciones como notificaciones dependen de resolver este punto.
