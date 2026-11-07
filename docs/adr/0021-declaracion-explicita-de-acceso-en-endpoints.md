# ADR-0021: Declaración explícita del acceso en endpoints

## Estado
Accepted

## Contexto
La autorización por permisos necesita distinguir los endpoints públicos de los protegidos. Si un controller no declara ninguna regla y la configuración HTTP permite la petición, un endpoint nuevo podría quedar accesible accidentalmente.

## Opciones consideradas
1. Dejar el acceso por defecto en la configuración HTTP y documentar aparte qué rutas son públicas.
2. Mantener una lista manual de rutas públicas en la configuración de Spring Security.
3. Exigir una anotación explícita en cada método de endpoint y denegar los métodos sin declaración.

## Decisión
Cada método HTTP de un `@Controller` o `@RestController` debe declarar exactamente una de estas anotaciones:

- `@Public` para permitir acceso sin autenticación.
- `@RequiresAuthentication` para exigir autenticación.
- `@RequiresPermission` para exigir un permiso concreto del catálogo.

El procesador de anotaciones falla la compilación si un endpoint no declara exactamente una opción o si una anotación se usa fuera de un controller. Spring Security resuelve los endpoints marcados `@Public` a partir de su handler. En ejecución, los endpoints sin una declaración válida se deniegan y generan un warning.

## Consecuencias

**Positivas:**
- Un endpoint nuevo no queda público por omitir su configuración de acceso.
- Las rutas públicas y protegidas quedan visibles junto a sus métodos de controller.
- Los errores de declaración se detectan al compilar y se vuelven a bloquear en ejecución.

**Negativas:**
- Los endpoints necesitan una anotación explícita aunque solo requieran autenticación.
- Añadir una nueva clase de acceso requiere actualizar el procesador, la integración con Spring Security y sus pruebas.
