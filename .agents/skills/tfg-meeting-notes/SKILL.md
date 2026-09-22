---
name: tfg-meeting-notes
description: Convierte una transcripción JSON de una reunión del TFG Bancosol en una nota Markdown para la documentación Zensical de intranet. Úsala cuando el usuario pida guardar, documentar o resumir una reunión del TFG; no la uses para transcripciones ajenas al proyecto ni para publicar la transcripción íntegra.
---

# Notas de reuniones del TFG

Genera una nota fiel, breve y centrada en el proyecto a partir del JSON proporcionado. La transcripción es evidencia de origen, no documentación validada: no conviertas hipótesis, propuestas o conversaciones ambiguas en decisiones.

## Entradas

- Una transcripción JSON legible, ya sea como archivo o pegada por el usuario. Inspecciona su esquema real; no presupongas nombres de campos. Identifica intervenciones, hablantes, marcas temporales y metadatos cuando existan.
- Una fecha indicada por el usuario, si la proporciona.

Si el JSON está vacío, corrupto o no contiene conversación recuperable, no crees la nota. Explica el problema concreto y solicita una entrada válida.

## Procedimiento

1. Confirma que trabajas en el repositorio `intranet` y localiza su raíz. La documentación fuente es `docs/src`; no escribas en `docs/site`, que es salida generada.
2. Revisa `docs/src/index.md`, la configuración `docs/zensical.toml` y, si existen, las notas de `docs/src/reuniones/` para conservar idioma, nomenclatura y estilo. No modifiques otras páginas salvo petición expresa.
3. Lee toda la conversación y separa:
   - contenido relacionado con el TFG Bancosol, su producto, requisitos, diseño, arquitectura, implementación, documentación, organización, evaluación o siguientes pasos;
   - contenido personal, saludos, bromas, pausas y digresiones sin efecto sobre el proyecto.
4. Excluye el segundo grupo. Si una intervención mezcla ambos, conserva solo la información relevante para el proyecto. No menciones que se omitió una conversación personal ni resumas datos personales innecesarios.
5. Distingue de forma explícita lo discutido, lo acordado y lo pendiente. No inventes participantes, responsables, fechas límite, decisiones ni contexto. Conserva las dudas y atribuye una postura a una persona solo cuando el JSON la identifique con claridad y la atribución aporte valor.
6. Determina la fecha de la reunión con este orden:
   1. fecha indicada expresamente por el usuario;
   2. fecha explícita y no ambigua en los metadatos o en el contenido de la reunión;
   3. fecha incluida en el nombre del archivo de transcripción;
   4. fecha de modificación del archivo.

   No uses la fecha de procesamiento como si fuera la de la reunión. Si no existe ninguna fuente de fecha, pregunta al usuario antes de escribir.
7. Determina la duración de la reunión con este orden:
   1. duración explícita en los metadatos;
   2. diferencia entre la primera marca de inicio y la última marca de finalización de la conversación;
   3. duración del archivo de audio o vídeo de origen, si está disponible.

   Redondea al minuto más cercano —30 segundos o más redondean hacia arriba— y usa el formato `X h Y min`, incluyendo los valores cero cuando corresponda. Si ninguna fuente permite calcularla con fiabilidad, escribe `No consta en la reunión`; no inventes una duración.
8. Crea `docs/src/reuniones/` si no existe y usa `assets/meeting-note-template.md` como estructura. El archivo se llamará `nota-reunion-AAAA-MM-DD.md`. Si ya existe una nota distinta para esa fecha, no la sobrescribas: usa el primer sufijo libre (`-2`, `-3`, etc.) e informa de ello.
9. Redacta en español y en Markdown compatible con Zensical. Resume y parafrasea; no vuelques la transcripción completa ni incluyas citas extensas. El resultado debe entenderse sin leer el JSON original.
10. Elimina de la plantilla las instrucciones entre comentarios. Conserva todas las secciones y todos los campos de `Datos de la reunión`; cuando no haya datos verificables, escribe `No consta en la reunión` o `No se identificaron`, según corresponda.
11. Verifica el archivo creado, ejecuta `git diff --check` y, si el entorno documental ya está instalado, `make docs-build`. No instales dependencias solo para esta comprobación. Informa de la ruta, la fecha elegida, la duración y cualquier validación que no hayas podido ejecutar.

## Límites

- No conserves una copia de la transcripción completa dentro de `docs/` salvo petición expresa.
- No crees ni actualices issues, pull requests, requisitos, ADR u otros documentos sin autorización específica.
- Si la transcripción contradice documentación existente, no decidas cuál es correcta: registra la discrepancia en `Puntos por explorar` con lenguaje neutral.
- Trata nombres, correos y otros datos personales como información privada; incluye solo lo necesario para comprender responsabilidades del proyecto.
