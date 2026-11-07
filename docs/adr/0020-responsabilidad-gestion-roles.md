# ADR-0020: Responsabilidad de la gestion de roles en el backend

## Estado
Accepted

## Contexto
Para gestionar los roles hay multiples opciones y se pueden gestionar desde multiples capas.

## Opciones consideradas
1. Gestionarlo a mano en los @Service
2. Gestionarlo en los endpoints
3. Gestionar separado por capas

## Decisión
Se va a gestionar el permiso usando decoradores en los endpoints. Los mismos endpoints (@RestController) van a ser los encargados de llamar a una funcion @Service u otra. Las funciones @Service deben ser construidas pensando en que no van a gestionar el control de acceso.

## Consecuencias
**Positivas:**
- Codigo más mantenible con patrones más claros.
- Mejor arquitectura interna del backend
- Mejor arquitectura externa del backend (api)

**Negativas:**
- Probablemente aumenta el codigo repetido
- Probablemente aumenta la cantidad de endpoints
