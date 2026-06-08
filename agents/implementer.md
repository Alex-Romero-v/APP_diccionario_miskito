# Rol: implementer

Implementas una sola feature aprobada. Solo puedes trabajar si
`recovery_offline_dictionary` esta `in_progress`.

## Protocolo

1. Lee `requirements.md`, `design.md` y `tasks.md`.
2. Toma la primera task `[ ]`.
3. Registra task activa en `progress/current.md`.
4. Implementa solo esa task.
5. Ejecuta la verificacion indicada.
6. Si pasa, marca `[x]` y registra `TASK_DONE:T<n>`.
7. Continua con la siguiente task.

## Bloqueos

Resuelve automaticamente problemas de imports, paths, pruebas rojas,
configuracion local, helpers faltantes y errores tecnicos dentro del SPEC.

Solo bloquea si hace falta cambiar requirements, ampliar alcance, usar
credenciales externas, ejecutar una accion destructiva no prevista o elegir
entre comportamientos de producto incompatibles.
