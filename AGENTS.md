# AGENTS.md - Arnes SDD para Diccionario Miskito Android

Este archivo es el contrato de trabajo para cualquier agente que modifique este
repositorio. El objetivo inmediato NO es implementar codigo: el repositorio
queda preparado con documentacion SDD para recuperar la app Android offline del
diccionario miskito.

## Fuente canonica

Lee en este orden:

1. `AGENTS.md`
2. `feature_list.json`
3. `progress/current.md`
4. `docs/specs.md`
5. `docs/architecture.md`
6. `docs/conventions.md`
7. `docs/verification.md`
8. `specs/recovery_offline_dictionary/`

`SPEC.md` y `TASKS.md` en la raiz son copias de entrada rapida del SPEC y de la
cola de tareas de la feature activa. Si hubiera diferencia, la fuente final para
el arnes es `specs/recovery_offline_dictionary/`.

## Reglas duras

- Trabaja una sola feature por sesion.
- No implementes codigo si la feature esta `spec_ready`; espera aprobacion
  humana explicita.
- No marques tareas como completadas sin evidencia ejecutable.
- No uses red en runtime Android ni agregues permisos de internet.
- No inventes datos lexicograficos: toda salida debe provenir del PDF, JSONL,
  catalogos, apendices o metadata generada.
- No edites la transcripcion canonica sin registrar conteos, checksums y razon.
- No cierres el trabajo si `dictionary.db` no pasa `PRAGMA integrity_check`.
- No declares release listo si usa `debugConfig`, si falta verificacion Room o si
  la busqueda miskito/espanol no devuelve resultados reales.

## Roles

- `leader`: mantiene estado y coordina el flujo.
- `spec_author`: redacta o corrige documentos SDD.
- `implementer`: implementa una tarea aprobada, una por vez.
- `reviewer`: revisa trazabilidad, orden de tareas y evidencia.

Si la plataforma no soporta subagentes, el mismo agente ejecuta los roles de
forma secuencial y deja los mismos archivos/tokens.

## Flujo

```text
pending -> idea.md -> requirements.md -> design.md -> tasks.md
-> spec_ready -> aprobacion humana -> in_progress -> implementer
-> reviewer -> done
```

La feature actual ya queda en `spec_ready`. El siguiente agente debe detenerse
hasta que el humano apruebe implementar.

## Tokens

- Documento listo: `DOC_DONE:idea`, `DOC_DONE:requirements`,
  `DOC_DONE:design`, `DOC_DONE:tasks`.
- Spec completo: `SPEC_READY -> specs/recovery_offline_dictionary/`.
- Tarea implementada: `TASK_DONE:T<n>`.
- Tarea reintentada por bloqueo tecnico resoluble: `TASK_RETRY:T<n>`.
- Bloqueo critico: `TASK_BLOCKED:T<n>`.

## Cierre de sesion

Antes de terminar una sesion:

1. Ejecuta `.\init.ps1` en PowerShell o `./init.sh` en Git Bash/WSL.
2. Revisa `git status --short`.
3. Actualiza `progress/current.md`.
4. Anade resumen en `progress/history.md`.
