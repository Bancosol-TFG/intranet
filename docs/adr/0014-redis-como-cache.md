# ADR-0014: Redis como caché

## Estado
Accepted

## Contexto
En la reunión del 22 de septiembre se propuso Redis como caché para datos consultados con frecuencia, como roles y permisos. En la reunión del 29 de septiembre se indicó que no se empezaría con caché y que se añadiría si surgía la necesidad. La nota del 30 de septiembre pide confirmar si Redis se aplazó o si cambió la decisión arquitectónica.

## Opciones consideradas
1. Incorporar Redis como caché desde el inicio, incluyendo datos como roles y permisos.
2. Empezar solo con PostgreSQL e incorporar Redis cuando una necesidad de rendimiento lo justifique.
3. No utilizar Redis y resolver las lecturas directamente desde PostgreSQL.

## Decisión
Redis forma parte del despliegue. De momento solo guarda la fecha del último cambio de roles y permisos (ADR-0019). PostgreSQL sigue siendo la base de datos principal (ADR-0006).

## Consecuencias
**Positivas:**
- Comprobar si un token está desfasado no requiere consultar la base de datos en cada petición.

**Negativas:**
- Cualquier dato nuevo en Redis tendrá que definir su caducidad, invalidación y coherencia con PostgreSQL.
- Hay un servicio más que desplegar y vigilar.
