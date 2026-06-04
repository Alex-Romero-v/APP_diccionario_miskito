# ORCHESTRATION.md

## Bucle Operativo

Repite este bucle y ejecuta una sola tarea por ciclo:

1. Lee `CONSTITUTION.md`.
2. Lee `SPEC.md`.
3. Lee `PLAN.md`.
4. Lee `TASKS.md`.
5. Lee `ORCHESTRATION.md`.
6. Lee `MANUAL_DE_USO.md` si existe.
7. Selecciona la primera tarea con estado `[ ]`.
8. Verifica precondiciones reales con comandos o inspeccion de archivos.
9. Verifica `Archivos permitidos` y `Archivos prohibidos`.
10. Ejecuta fase Red: crea o confirma prueba fallida.
11. Ejecuta fase Green: aplica el cambio minimo.
12. Ejecuta fase Refactor: limpia solo dentro del alcance.
13. Ejecuta el comando exacto de validacion.
14. Si pasa, marca `[x]` y emite `[TASK_COMPLETE: ID]`.
15. Si falla y no puedes corregir dentro del alcance, marca `[!]` si la tarea lo indica y emite `[TASK_BLOCKED: ID]`.
16. Detente.

## Prioridad De Tareas

Primero asegura que el handoff de datos esta dentro del repo. Luego valida/transfiere el pipeline Node. Despues genera/valida base y asset. Solo despues corrige busqueda y pantallas que dependen de metadata viva. No ejecutes release antes de validar `dictionary.db`.

## Manejo De Bloqueos

Bloquea si falta el ZIP, si `npm test` falla, si `npm run validate:transcription` falla, si la base generada no abre, si el conteo de entradas no coincide, si Room no abre el asset, si `.\gradlew testDebugUnitTest` falla por causa fuera de archivos permitidos o si el cambio exige permisos Android.

## Tokens

Usa exactamente:

```text
[TASK_COMPLETE: T###]
[TASK_BLOCKED: T###]
```

Cuando haya causa util, escribe una linea breve de evidencia en la tarea antes del token. No emitas token de exito si no ejecutaste el comando exacto. No cambies estados de tareas no activas.

## Regla De No Mezcla

No arregles About junto con Settings. No arregles busqueda junto con base. No copies DB al asset antes de validar salida. No reemplaces pipeline entero sin prueba de equivalencia o validacion Node. No uses el ZIP como asset Android directo.
