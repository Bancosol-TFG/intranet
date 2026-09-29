# Nota de reunión — 27 de agosto de 2026

## Datos de la reunión

- **Fecha:** 2026-08-27
- **Duración:** No consta en la reunión
- **Modalidad:** Presencial
- **Fuente:** Exportación de Notion: «Reunión 2 de tarde»
- **Registró en Notion:** Salma
- **Participantes:** Salma, Adrián y Miguel

## Resumen

El equipo afianzó el modelo de datos y tomó decisiones sobre las participaciones de tiendas y las cuentas de usuario.

## Puntos tratados

- **Participaciones de tiendas:** se explicó que el indicador booleano en `store_participation` permite conservar por separado listas antiguas de participaciones y las de tiendas nuevas, y evita tener que comparar varias tablas al obtener una lista.
- **Cuentas de usuario:** se trató el caso de usuarios que todavía no tienen correo ni teléfono y cómo establecer su primera contraseña.

## Decisiones y acuerdos

- Usar un booleano en `store_participation` para distinguir las participaciones de tiendas de la campaña correspondiente.
- Permitir que el correo electrónico y el teléfono no sean obligatorios. Para obtener la primera contraseña, un administrador deberá asignar un correo; sin correo, la cuenta no tendrá contraseña y el usuario será únicamente voluntario.

## Tareas y próximos pasos

- No se identificaron tareas asignadas en la nota.

## Puntos por explorar

- Asegurar que las participaciones de la campaña actual se actualicen cuando se cree una tienda nueva.
