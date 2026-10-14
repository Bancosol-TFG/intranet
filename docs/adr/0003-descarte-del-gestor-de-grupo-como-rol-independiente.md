# ADR-0003: Descarte del gestor de grupo como rol independiente

## Estado
Accepted

## Contexto
Se planteó un perfil de gestor de grupo que pudiera organizar a varias personas voluntarias. En la reunión del 30 de septiembre se observó que ese caso podía representarse mediante una entidad colaboradora, que agrupa personas y puede gestionar su participación.

## Opciones consideradas
1. Crear un rol independiente de gestor de grupo.
2. Representar el grupo mediante una entidad colaboradora y asignar permisos a esa entidad.

## Decisión
No crear un rol independiente de gestor de grupo. El caso se tratará mediante el concepto de entidad colaboradora, cuya gestión y permisos concretos deberán definirse en los requisitos.

## Consecuencias
**Positivas:**
- Evita duplicar conceptos para representar organizaciones o grupos de personas.
- Permite reutilizar el modelo de entidades colaboradoras.

**Negativas:**
- Hay que concretar cómo se crean y validan las entidades colaboradoras y qué acciones pueden realizar.
