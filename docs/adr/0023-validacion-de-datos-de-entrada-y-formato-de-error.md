# ADR-0023: Validación de datos de entrada y formato de error

## Estado
Proposed

## Contexto
Los DTOs de entrada de la API validaban sobre todo la obligatoriedad de los campos. No limitaban la longitud de los textos, no comprobaban el formato del código postal ni del teléfono y aceptaban identificadores no positivos. Al montar los módulos de tiendas se acordó no crear un manejador global de errores y usar el 400 por defecto de Spring, cuyo cuerpo no indica qué campos son inválidos. La issue #57 pide validar los datos de forma coherente y devolver errores controlados.

## Opciones consideradas
1. **Solo restricciones en los DTOs:** mantener el 400 por defecto de Spring.
2. **Restricciones en los DTOs y manejador global:** devolver un `ProblemDetail` (RFC 9457) con la lista de campos inválidos.
3. **Opción 2 y validación de parámetros de consulta:** validar también filtros y rangos de `@RequestParam`.

## Decisión
Se propone la opción 2.

- Todo DTO de entrada declara restricciones Jakarta Validation acordes con el modelo de dominio y se recibe con `@Valid`.
- Los textos se limitan a 255 caracteres, incluidas las columnas `TEXT`, sin cambiar el esquema, con la anotación compartida `@ShortText`.
- El código postal tiene exactamente 5 dígitos. El teléfono de usuarios y contactos (`@PhoneNumber`) tiene 9 dígitos seguidos, opcionalmente precedidos de un prefijo internacional (`+34`, `+32`…) y un espacio.
- Las reglas entre campos se implementan como validadores de clase que señalan el campo afectado (`endDate`, `openingTime`, `closingTime`). Las anotaciones y utilidades compartidas viven en `es.bancosol.api.common.validation`.
- Los identificadores de referencia son positivos y la fecha de fin de una campaña no es anterior a la de inicio.
- `ValidationExceptionHandler` (`es.bancosol.api.common.exception`) responde 400 con un `ProblemDetail` que incluye `errors`, una lista de objetos `{ "field", "message" }`. También cubre los cuerpos ilegibles: un valor con tipo o formato incorrecto indica su campo y un JSON mal formado devuelve `errors` vacío.

## Consecuencias

**Positivas:**
- Los datos inválidos se rechazan antes de llegar a los servicios y a la base de datos.
- El frontend puede mostrar el error junto a cada campo.

**Negativas:**
- Sustituye la decisión anterior de no tener manejador global de errores; solo cubre errores del cuerpo de la solicitud, no los `ResponseStatusException` de los servicios.
- Los códigos postales y teléfonos con otros formatos dejan de aceptarse; los datos existentes no se migran.
