# ADR-0004: Separación o unificación de usuario y voluntario

## Estado
Proposed

## Contexto
El equipo ha debatido si toda persona voluntaria debe tener una cuenta de acceso o si puede existir como voluntaria sin credenciales, por ejemplo cuando la gestiona una entidad colaboradora. En las reuniones se identificaron implicaciones para el alta, la aprobación y el uso de la aplicación móvil, pero no se cerró el modelo. La decisión está relacionada con el origen de las credenciales (ADR-0003).

La nota del 27 de agosto recoge una solución inicial: correo y teléfono opcionales, y personas sin correo representadas como voluntarios sin contraseña. En las reuniones posteriores se discutieron flujos distintos para autorregistro, aprobación y grupos; se debe validar el modelo con el proceso real de Bancosol.

## Opciones consideradas
1. Modelar a cada persona como usuario y permitir que las credenciales no se utilicen hasta que acceda.
2. Separar las entidades Usuario y Voluntario y relacionarlas cuando una persona tenga una cuenta.

## Decisión
Pendiente de decisión. El equipo debe confirmar los flujos de Bancosol para determinar si una persona voluntaria puede existir sin una cuenta de usuario.

## Consecuencias
**Positivas:**
- Una decisión explícita mantendrá coherentes el modelo de datos y los flujos de alta.

**Negativas:**
- El esquema de personas, la aprobación y la autenticación no pueden cerrarse completamente hasta resolver este punto.
