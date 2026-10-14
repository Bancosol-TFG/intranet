# ADR-0019: Redis como caché

## Estado
Proposed

## Contexto
En la reunión del 22 de septiembre se propuso Redis como caché para datos consultados con frecuencia, como roles y permisos. En la reunión del 29 de septiembre se indicó que no se empezaría con caché y que se añadiría si surgía la necesidad. La nota del 30 de septiembre pide confirmar si Redis se aplazó o si cambió la decisión arquitectónica.

## Opciones consideradas
1. Incorporar Redis como caché desde el inicio, incluyendo datos como roles y permisos.
2. Empezar solo con PostgreSQL e incorporar Redis cuando una necesidad de rendimiento lo justifique.
3. No utilizar Redis y resolver las lecturas directamente desde PostgreSQL.

## Decisión
Pendiente de decisión. PostgreSQL es la base de datos principal (ADR-0007); las reuniones no permiten confirmar si Redis formará parte del despliegue inicial o si se incorporará más adelante.

## Consecuencias
**Positivas:**
- Resolver esta decisión permitirá fijar los servicios de despliegue y las responsabilidades de cada almacenamiento.
- Aplazar Redis evita añadir infraestructura antes de validar su necesidad.

**Negativas:**
- Si se incorpora Redis, habrá que definir qué datos almacenar, su caducidad, invalidación y coherencia con PostgreSQL.
- Mientras siga pendiente, los diagramas y la configuración del entorno no pueden dar por cerrado su uso.
