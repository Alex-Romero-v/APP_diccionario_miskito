# MANUAL_DE_USO.md

## Uso Para El Siguiente Agente

Abre este repo y pide al agente:

```text
Lee CONSTITUTION.md, SPEC.md, PLAN.md, TASKS.md y ORCHESTRATION.md. Ejecuta solo la primera tarea pendiente. Respeta archivos permitidos/prohibidos, ejecuta el comando exacto, actualiza estado y emite token. Detente.
```

No pidas "haz todos los parches". La cola esta disenada para avanzar de forma atomica.

## Archivos De Handoff

El handoff necesario debe estar en:

```text
docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip
docs/agent-handoff/extracted/
```

Si no esta, copialo desde:

```text
C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/handoff_database_agent_20260603-211934.zip
```

El ZIP contiene pipeline Node, PDF fuente, JSON/JSONL intermedios, checksums, reportes y documentos canonicos de transcripcion. No necesitas rehacer la transcripcion del PDF si `npm run validate:transcription` pasa.

## Comandos Que Debes Esperar

Para datos:

```powershell
npm ci
npm test
npm run validate:transcription
```

Para Android:

```powershell
.\gradlew testDebugUnitTest
.\gradlew assembleRelease
```

Para documentacion:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\zr_ma\OneDrive\Documentos\Crear documentación\crear-documentacion-agente-ia\scripts\verify_agent_docs.ps1" -DocsDir .
```

## Interpretacion De Resultados

Acepta una tarea solo si termina con `[TASK_COMPLETE: T###]`. Si termina con `[TASK_BLOCKED: T###]`, lee la evidencia, resuelve la precondicion y reintenta la misma tarea. No cambies `[!]` a `[x]` manualmente.

## Checklist De Cierre

Antes de considerar cerrados los parches, verifica:

- handoff Node validado;
- base SQLite generada y abrible;
- asset `app/src/main/assets/dictionary.db` validado;
- Room abre el asset;
- busqueda usa `MiskitoTextNormalizer` y `SearchRanker`;
- About muestra texto legal exacto y metadata viva;
- Settings muestra version app y version diccionario;
- `.\gradlew testDebugUnitTest` pasa;
- `.\gradlew assembleRelease` pasa;
- no se agregaron permisos sensibles.
