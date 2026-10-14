# ADR-0008: Spring Boot para el backend

## Estado
Accepted

## Contexto
En la reunión del 22 de septiembre se eligió Java con Spring Boot como tecnología inicial para el backend. En la reunión del 29 de septiembre se estaba preparando el esqueleto del backend con Spring Boot. La organización interna y el estilo de API se documentan por separado en los ADR-0020 y ADR-0021.

## Opciones consideradas
1. Usar Java con Spring Boot para el backend.
2. Usar otro stack de backend, como .NET u otra alternativa considerada al inicio.

## Decisión
Adoptar Java con Spring Boot para implementar el backend.

## Consecuencias
**Positivas:**
- El equipo puede comenzar la implementación con un stack común.

**Negativas:**
- La selección condiciona las dependencias, herramientas y experiencia necesarias para desarrollar el backend.
- La tecnología podrá revisarse si los requisitos o la experiencia de implementación lo justifican.
