# ADR-0018: Auditoría de acciones de negocio

## Estado
Proposed

## Contexto
En las reuniones se planteó registrar las acciones que las personas realizan en la aplicación y se distinguió esa trazabilidad de los logs técnicos de errores e infraestructura (ADR-0008). Se mencionaron el almacenamiento en base de datos y la consulta por parte de administradores, pero no quedaron definidos los eventos, retención, permisos ni almacenamiento.

## Opciones consideradas
1. Registrar las acciones de negocio en una auditoría persistente separada de los logs técnicos.
2. Registrar únicamente los eventos mínimos necesarios dentro de los logs técnicos.
3. Posponer la auditoría hasta que se confirmen las necesidades y obligaciones de Bancosol.

## Decisión
Pendiente. Deben confirmarse con Bancosol las acciones que requieren trazabilidad y quién puede consultarlas; después se decidirán almacenamiento y retención.

## Consecuencias
**Positivas:**
- Una decisión permitirá definir una trazabilidad útil para revisar acciones de negocio.
- Separar este registro de los logs técnicos facilita establecer permisos y retención propios.

**Negativas:**
- Mientras siga pendiente, no están definidos los eventos auditados, su ciclo de vida ni el acceso.
