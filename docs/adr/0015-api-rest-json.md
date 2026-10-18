# ADR-0015: API REST con JSON

## Estado
Accepted

## Contexto
La nota de la reunión del 22 de septiembre recoge que las interfaces cliente se comunicarán con el backend mediante una API REST que intercambia JSON. La conversación estableció este enfoque inicial sin cerrar todos los detalles de recursos, autenticación o contratos.

## Opciones consideradas
1. Exponer las operaciones del backend mediante una API REST con JSON.
2. Adoptar otro estilo de comunicación entre clientes y servidor.

## Decisión
Usar una API REST con JSON como interfaz inicial entre los clientes y el backend.

## Consecuencias
**Positivas:**
- Permite que los clientes web consuman una interfaz común del servidor.
- Define una frontera clara entre frontend y backend.

**Negativas:**
- Hay que mantener contratos y validaciones coherentes entre clientes y servidor.
- Quedan por detallar los recursos, formatos de error, autenticación y versionado de la API.
