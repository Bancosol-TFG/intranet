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
- La longitud máxima se aplica según las reglas del campo y la columna correspondiente. Se usa `@ShortText` para los campos cuyo límite en el esquema es de 255 caracteres.
- El código postal tiene exactamente 5 dígitos. El teléfono de usuarios y contactos (`@PhoneNumber`) es opcional. Si se informa, debe contener al menos un dígito y tener como máximo 50 caracteres. Se conserva el formato recibido.
- Las reglas entre campos se implementan como validadores de clase que señalan el campo afectado (`endDate`, `openingTime`, `closingTime`). Las anotaciones y utilidades compartidas viven en `es.bancosol.api.common.validation`.
- Los identificadores de referencia son positivos y la fecha de fin de una campaña no es anterior a la de inicio.
- `ValidationExceptionHandler` (`es.bancosol.api.common.exception`) responde 400 con un `ProblemDetail` que incluye `errors`, una lista de objetos `{ "field", "message" }`. Los mensajes de validación de la API se devuelven en inglés. También cubre los cuerpos ilegibles: un valor con tipo o formato incorrecto indica su campo y un JSON mal formado devuelve `errors` vacío.

## Consecuencias

**Positivas:**
- Los datos inválidos se rechazan antes de llegar a los servicios y a la base de datos.
- El frontend actual muestra un aviso genérico en español para el 400. La presentación de errores por campo queda pendiente del nuevo frontend.

**Negativas:**
- Sustituye la decisión anterior de no tener manejador global de errores; solo cubre errores del cuerpo de la solicitud, no los `ResponseStatusException` de los servicios.
- Los códigos postales con otros formatos dejan de aceptarse. Los datos existentes se conservan.
