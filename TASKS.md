# TASKS.md

## Protocolo

Ejecuta una sola tarea pendiente por ciclo. Usa estados `[ ]`, `[x]` y `[!]`. No modifiques archivos fuera de `Archivos permitidos`. No marques `[x]` sin ejecutar el `Comando de validacion` exacto. Emite siempre `[TASK_COMPLETE: ID]` o `[TASK_BLOCKED: ID]`.

## Cola Atomica Para Cerrar Parches V1

- [ ] T001 - Asegurar handoff de base de datos dentro del repo
  - Objetivo: Copia el ZIP canonico completo a `docs/agent-handoff/` y deja README de uso para el agente siguiente.
  - Precondiciones: Existe `C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/handoff_database_agent_20260603-211934.zip`.
  - Archivos permitidos: `docs/agent-handoff/**`, `TASKS.md`.
  - Archivos prohibidos: `app/**`, `tools/**`, `build.gradle.kts`, `settings.gradle.kts`, `gradle.properties`.
  - Red: Verifica que `docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip` existe e incluye `tools/dictionary-pipeline/src/cli.mjs`.
  - Green: Copia el ZIP y crea/actualiza `docs/agent-handoff/README_NEXT_AGENT.md`.
  - Refactor: No aplica.
  - Comando de validacion: `powershell -NoProfile -Command "Test-Path 'docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip'; Test-Path 'docs/agent-handoff/README_NEXT_AGENT.md'"`
  - Token de exito: `[TASK_COMPLETE: T001]`
  - Token de bloqueo: `[TASK_BLOCKED: T001]`

- [ ] T002 - Validar handoff Node fuera del runtime Android
  - Objetivo: Extrae el ZIP a una ruta temporal y valida transcripcion Node sin modificar Android.
  - Precondiciones: T001 completada.
  - Archivos permitidos: `docs/agent-handoff/validation-log.md`, `TASKS.md`.
  - Archivos prohibidos: `app/**`, `tools/**`, `package.json`, `package-lock.json`, `build.gradle.kts`, `settings.gradle.kts`.
  - Red: Ejecuta `npm test` en la extraccion temporal y registra si excede tiempo o falla.
  - Green: Ejecuta `npm run validate:transcription` y registra resultado.
  - Refactor: No aplica.
  - Comando de validacion: `powershell -NoProfile -Command "$d=Join-Path $env:TEMP 'miskito-handoff-check'; if(Test-Path $d){Remove-Item $d -Recurse -Force}; Expand-Archive 'docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip' $d; Push-Location $d; npm ci; npm run validate:transcription; Pop-Location"`
  - Token de exito: `[TASK_COMPLETE: T002]`
  - Token de bloqueo: `[TASK_BLOCKED: T002]`

- [ ] T003 - Crear pipeline Node de SQLite desde JSONL
  - Objetivo: Agrega una ruta Node para generar `tools/dictionary-pipeline/output/dictionary.db` desde los JSONL del handoff.
  - Precondiciones: T002 completada y `better-sqlite3` disponible en el handoff.
  - Archivos permitidos: `tools/dictionary-pipeline-node/**`, `package.json`, `package-lock.json`, `docs/agent-handoff/**`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/**`, `app/src/main/assets/**`, `app/build.gradle.kts`, `settings.gradle.kts`.
  - Red: Agrega prueba Node que falla si no se puede generar una DB temporal desde fixtures/JSONL minimos.
  - Green: Implementa generador SQLite con tablas compatibles con entidades Room y metadata minima.
  - Refactor: Extrae mapeo JSONL a funciones puras.
  - Comando de validacion: `npm test`
  - Token de exito: `[TASK_COMPLETE: T003]`
  - Token de bloqueo: `[TASK_BLOCKED: T003]`

- [ ] T004 - Generar base SQLite completa y validar conteos
  - Objetivo: Produce `tools/dictionary-pipeline/output/dictionary.db` desde el handoff y valida que no sea asset muerto.
  - Precondiciones: T003 completada.
  - Archivos permitidos: `tools/dictionary-pipeline/output/**`, `tools/dictionary-pipeline-node/**`, `docs/agent-handoff/validation-log.md`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/assets/**`, `app/src/main/java/**`, `app/src/test/**`, `app/build.gradle.kts`.
  - Red: Ejecuta el generador contra datos incompletos y confirma que falla.
  - Green: Genera DB completa con `entriesCount = 6386` en metadata y tabla `entries` con 6386 filas.
  - Refactor: Elimina temporales fuera de `output`.
  - Comando de validacion: `node tools/dictionary-pipeline-node/scripts/build-sqlite.mjs --handoff docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip --out tools/dictionary-pipeline/output/dictionary.db && node tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs --db tools/dictionary-pipeline/output/dictionary.db --entries 6386`
  - Token de exito: `[TASK_COMPLETE: T004]`
  - Token de bloqueo: `[TASK_BLOCKED: T004]`

- [ ] T005 - Reemplazar asset dictionary.db con base validada
  - Objetivo: Copia la base generada validada a `app/src/main/assets/dictionary.db`.
  - Precondiciones: T004 completada.
  - Archivos permitidos: `app/src/main/assets/dictionary.db`, `docs/agent-handoff/validation-log.md`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/**`, `app/src/test/**`, `tools/dictionary-pipeline-node/**`, `app/build.gradle.kts`.
  - Red: Ejecuta validador contra el asset actual y confirma si esta corrupto o vacio.
  - Green: Copia solo desde `tools/dictionary-pipeline/output/dictionary.db` validado.
  - Refactor: No aplica.
  - Comando de validacion: `node tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs --db app/src/main/assets/dictionary.db --entries 6386`
  - Token de exito: `[TASK_COMPLETE: T005]`
  - Token de bloqueo: `[TASK_BLOCKED: T005]`

- [ ] T006 - Probar compatibilidad Room con asset
  - Objetivo: Asegura que Room abre `dictionary.db` y consulta metadata/entradas sin favoritos ni historial precargados.
  - Precondiciones: T005 completada.
  - Archivos permitidos: `app/src/test/java/org/miskito/dictionary/data/local/database/**`, `app/src/main/java/org/miskito/dictionary/data/local/database/**`, `app/src/main/java/org/miskito/dictionary/data/local/dao/**`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/org/miskito/dictionary/ui/**`, `app/src/main/java/org/miskito/dictionary/viewmodel/**`, `tools/**`, `app/src/main/assets/**`.
  - Red: Agrega o corrige prueba que falla si Room no abre el asset o si `entriesCount` es 0.
  - Green: Ajusta DAO/database solo si el test muestra mismatch real.
  - Refactor: Mantiene entidades y schema sin cambios laterales.
  - Comando de validacion: `.\gradlew testDebugUnitTest`
  - Token de exito: `[TASK_COMPLETE: T006]`
  - Token de bloqueo: `[TASK_BLOCKED: T006]`

- [ ] T007 - Conectar TextNormalizer y SearchRanker en DictionaryRepository
  - Objetivo: Elimina normalizacion/ranking inline en `DictionaryRepository.search()`.
  - Precondiciones: T006 completada o pruebas de repositorio pueden usar DAO fake.
  - Archivos permitidos: `app/src/main/java/org/miskito/dictionary/data/repository/DictionaryRepository.kt`, `app/src/main/java/org/miskito/dictionary/di/RepositoryModule.kt`, `app/src/main/java/org/miskito/dictionary/data/local/relation/SearchResultProjection.kt`, `app/src/main/java/org/miskito/dictionary/data/local/dao/SearchDao.kt`, `app/src/test/java/org/miskito/dictionary/data/repository/DictionaryRepositoryTest.kt`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/org/miskito/dictionary/ui/**`, `app/src/main/java/org/miskito/dictionary/viewmodel/**`, `app/src/main/assets/**`, `tools/**`.
  - Red: Agrega prueba donde consulta sin circunflejo encuentra forma con circunflejo y exact headword ordena antes de traduccion.
  - Green: Inyecta `TextNormalizer`, usa `MiskitoTextNormalizer`, calcula `SearchMatchType` y ordena con `SearchRanker.rank`.
  - Refactor: Si faltan campos en proyeccion, amplia DAO/proyeccion dentro del alcance.
  - Comando de validacion: `.\gradlew testDebugUnitTest`
  - Token de exito: `[TASK_COMPLETE: T007]`
  - Token de bloqueo: `[TASK_BLOCKED: T007]`

- [ ] T008 - Corregir About con MetadataRepository y texto legal
  - Objetivo: `AboutScreen` consume `AboutViewModel`, muestra texto legal exacto, entriesCount y databaseVersion.
  - Precondiciones: T006 completada o metadata fake disponible en tests.
  - Archivos permitidos: `app/src/main/java/org/miskito/dictionary/ui/about/AboutScreen.kt`, `app/src/main/java/org/miskito/dictionary/viewmodel/AboutViewModel.kt`, `app/src/test/java/org/miskito/dictionary/viewmodel/AboutViewModelTest.kt`, `app/src/test/java/org/miskito/dictionary/ui/about/**`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/org/miskito/dictionary/data/local/**`, `app/src/main/java/org/miskito/dictionary/data/repository/DictionaryRepository.kt`, `app/src/main/assets/**`, `tools/**`.
  - Red: Agrega prueba que falla si el texto legal exacto no esta en el estado o en la UI.
  - Green: Usa `hiltViewModel`, `collectAsStateWithLifecycle` y metadata viva.
  - Refactor: Elimina textos inventados de rescate historico.
  - Comando de validacion: `.\gradlew testDebugUnitTest`
  - Token de exito: `[TASK_COMPLETE: T008]`
  - Token de bloqueo: `[TASK_BLOCKED: T008]`

- [ ] T009 - Corregir Settings con version app y version diccionario
  - Objetivo: `SettingsScreen` muestra `BuildConfig.VERSION_NAME` y `metadata.databaseVersion`.
  - Precondiciones: T006 completada o metadata fake disponible en tests.
  - Archivos permitidos: `app/src/main/java/org/miskito/dictionary/ui/settings/SettingsScreen.kt`, `app/src/main/java/org/miskito/dictionary/viewmodel/SettingsViewModel.kt`, `app/src/test/java/org/miskito/dictionary/viewmodel/SettingsViewModelTest.kt`, `app/src/test/java/org/miskito/dictionary/ui/settings/**`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/org/miskito/dictionary/data/local/**`, `app/src/main/java/org/miskito/dictionary/data/repository/DictionaryRepository.kt`, `app/src/main/assets/**`, `tools/**`.
  - Red: Agrega prueba que falla si `SettingsUiState.dbVersion` queda hardcodeado en `"1.0"`.
  - Green: Inyecta `MetadataRepository`, combina preferences + metadata y renderiza items informativos.
  - Refactor: Conserva controles existentes de fuente, tema, ingles e historial.
  - Comando de validacion: `.\gradlew testDebugUnitTest`
  - Token de exito: `[TASK_COMPLETE: T009]`
  - Token de bloqueo: `[TASK_BLOCKED: T009]`

- [ ] T010 - Validacion final de parches y release
  - Objetivo: Ejecuta validaciones integrales y actualiza `docs/v1-closeout-report.md` con evidencia real.
  - Precondiciones: T001 a T009 completadas.
  - Archivos permitidos: `docs/v1-closeout-report.md`, `docs/agent-handoff/validation-log.md`, `TASKS.md`.
  - Archivos prohibidos: `app/src/main/java/**`, `app/src/main/assets/**`, `tools/**`, `build.gradle.kts`, `settings.gradle.kts`.
  - Red: Ejecuta cada comando por separado y registra fallo si alguno no pasa.
  - Green: Registra evidencia de handoff, DB, unit tests y release.
  - Refactor: No aplica.
  - Comando de validacion: `npm test && npm run validate:transcription && .\gradlew testDebugUnitTest && .\gradlew assembleRelease`
  - Token de exito: `[TASK_COMPLETE: T010]`
  - Token de bloqueo: `[TASK_BLOCKED: T010]`
