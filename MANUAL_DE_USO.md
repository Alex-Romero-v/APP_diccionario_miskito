# MANUAL_DE_USO.md

## Como Usar Esta Documentacion

Entrega esta carpeta al agente que corregira la app junto con la ruta del repo Android. Pide: "Lee los seis documentos y ejecuta la primera tarea pendiente". Si el agente no tiene el repo Android, debe bloquear en T001 y no inventar rutas.

## Ruta Del Handoff

El paquete de base de datos esta en:

```text
C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/handoff_database_agent_20260603-211934.zip
```

Ese paquete contiene `tools/dictionary-pipeline`, JSONL intermedios, manifiesto, checksums, reportes, tests Node y documentacion canonica del agente de base.

## Reanudacion Tras Bloqueo

Si recibes `[TASK_BLOCKED: T001]`, proporciona la ruta absoluta del repo Android de la app. Luego pide: "Reanuda T001 desde precondiciones". Si recibes bloqueo en tareas de Node, revisa que `npm ci` ya fue ejecutado o que `node_modules` este disponible sin red. Si recibes bloqueo en Gradle, abre el repo correcto y ejecuta desde la raiz donde exista `gradlew`.

## Validacion Manual Minima

Acepta el trabajo solo si hay evidencia de:

- `npm test`
- `npm run validate:transcription`
- conteo SQLite `6386`
- `.\gradlew testDebugUnitTest`
- About con texto legal exacto y metadata viva
- Settings con version de app y version de diccionario
- busqueda con ranking de dominio

## Actualizar Alcance

Para agregar nuevas correcciones, no pidas cambios directos. Agrega una tarea atomica a `TASKS.md` con ID nuevo, archivos permitidos, archivos prohibidos, Red-Green-Refactor, comando exacto y tokens.

## Auditoria De Esta Carpeta

Desde `C:/Users/zr_ma/OneDrive/Documentos/Crear documentación`, ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\crear-documentacion-agente-ia\scripts\verify_agent_docs.ps1 -DocsDir .\documentacion-parches-dic-miskito-app
```

Acepta la documentacion solo si devuelve `[DOCS_VERIFIED]`.
