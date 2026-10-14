# ADR-0009: Estrategia de logs técnicos

## Estado
Proposed

## Contexto
Los logs técnicos registran errores, excepciones y actividad de infraestructura para diagnóstico y operación. En las reuniones se discutieron archivos, almacenamiento temporal en base de datos, rotación y herramientas como Grafana y Loki. La auditoría de acciones de negocio es un registro independiente y se trata en el ADR-0023.

## Opciones consideradas
1. Guardar los logs técnicos en archivos con rotación.
2. Centralizar su almacenamiento y consulta con herramientas como Grafana y Loki.
3. Posponer la elección de almacenamiento y herramientas hasta concretar requisitos operativos.

## Decisión
Pendiente. Deben decidirse el formato, almacenamiento, rotación, retención y herramientas de consulta de los logs técnicos.

## Consecuencias
**Positivas:**
- Una decisión permitirá definir qué información se registra y cómo se consulta para diagnóstico.
- Separar los logs técnicos de la auditoría evita mezclar objetivos y requisitos de retención diferentes.

**Negativas:**
- Hasta resolverlo, no están definidos el formato, almacenamiento, retención ni acceso a los logs técnicos.
