# ORCHESTRATION.md

## Bucle De Ejecucion

Repite este bucle determinista:

1. Lee `CONSTITUTION.md`.
2. Lee `SPEC.md`.
3. Lee `PLAN.md`.
4. Lee `TASKS.md`.
5. Lee `ORCHESTRATION.md`.
6. Lee `MANUAL_DE_USO.md`.
7. Selecciona la primera tarea con estado `[ ]`.
8. Verifica sus precondiciones antes de tocar archivos.
9. Si la tarea requiere repo Android y no existe, bloquea con `[TASK_BLOCKED: T001]`.
10. Si la tarea requiere el ZIP y no existe, bloquea con el token de la tarea activa.
11. Revisa `Archivos permitidos` y `Archivos prohibidos`.
12. Ejecuta fase Red y registra la prueba fallida esperada.
13. Ejecuta fase Green con el cambio minimo.
14. Ejecuta fase Refactor sin ampliar alcance.
15. Ejecuta el `Comando de validacion` exacto.
16. Si el comando falla, conserva `[ ]`, registra salida relevante y emite `[TASK_BLOCKED: ID]`.
17. Si el comando pasa, cambia `[ ]` a `[x]`, registra evidencia y emite `[TASK_COMPLETE: ID]`.

## Orden Obligatorio

No ejecutes tareas de UI antes de localizar el repo Android. No empaquetes asset antes de validar el handoff. No modifiques `DictionaryRepository.kt` antes de tener pruebas de normalizacion/ranking. No cierres About o Settings sin pruebas de metadata visible.

## Manejo De Datos

Extrae el ZIP solo en una ruta de trabajo controlada. Copia al repo solo los archivos autorizados por la tarea. No alteres los JSONL canonicos. Si un conteo difiere de 6386 entradas, bloquea y explica si la diferencia viene de deduplicacion documentada o error.

## Manejo De Tokens

Emite exactamente un token por ciclo:

- Usa `[TASK_COMPLETE: ID]` si toda validacion pasa.
- Usa `[TASK_BLOCKED: ID]` si falta repo, falla comando, falta dependencia, falta permiso o aparece una contradiccion entre documentos y codigo.

No marques completado por inspeccion manual. No uses tokens sin ID.
