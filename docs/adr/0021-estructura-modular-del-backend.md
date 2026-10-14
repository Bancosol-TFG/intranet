# ADR-0021: Estructura modular del backend

## Estado
Accepted

## Contexto
En la reunión del 12 de octubre se acordó una estructura inicial por módulo con controladores, servicios, repositorios y entidades. Se propuso añadir carpetas especializadas solo cuando hagan falta, en lugar de crearlas vacías por adelantado. Los límites funcionales de los módulos siguen en elaboración.

## Opciones consideradas
1. Organizar el backend por módulos y separar dentro de cada módulo controladores, servicios, repositorios y entidades.
2. Organizar el backend principalmente por capas globales compartidas por toda la aplicación.
3. Crear de antemano todas las capas y carpetas especializadas, aunque todavía no tengan contenido.

## Decisión
Organizar el backend por módulos, con controladores, servicios, repositorios y entidades dentro de la estructura correspondiente. Añadir paquetes especializados cuando una necesidad concreta lo requiera.

## Consecuencias
**Positivas:**
- Mantiene juntas las partes relacionadas de cada módulo funcional.
- Evita añadir estructuras vacías sin una necesidad actual.

**Negativas:**
- Los límites y dependencias entre módulos deben acordarse a medida que se concreten los requisitos.
- La estructura requiere consistencia para evitar duplicar responsabilidades entre módulos.
