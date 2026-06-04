# PLAN.md

## Arquitectura Real Del Repo

El repo clonado tiene raiz Gradle Kotlin DSL con modulo `:app`, `namespace = org.miskito.dictionary`, Hilt, Room, DataStore, Compose y tests locales. La app ya contiene estructura adecuada:

```text
app/src/main/java/org/miskito/dictionary/
  data/local/dao/
  data/local/database/DictionaryDatabase.kt
  data/local/entity/
  data/local/fts/SearchIndexFtsEntity.kt
  data/local/relation/SearchResultProjection.kt
  data/repository/
  di/
  domain/normalizer/
  domain/search/
  ui/about/
  ui/settings/
  viewmodel/
app/src/main/assets/dictionary.db
tools/dictionary-pipeline/
docs/
```

## Decisiones Tecnicas

Usa Node para el handoff de transcripcion y construccion de datos nuevos. Mantiene Kotlin/Room para runtime Android. No uses Python para nuevos parches de base, porque el handoff canonico ya declara `python_allowed = false` y el repo conserva evidencia de fallo Python en `db_build_error.txt`.

## Integracion De Handoff

El handoff canonico ya debe existir en:

```text
docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip
docs/agent-handoff/extracted/
```

Usa preferentemente la carpeta ya extraida. No mezcles archivos Node y Python en la misma carpeta sin tarea explicita. Si decides reemplazar `tools/dictionary-pipeline/`, hazlo en una tarea atomica con prueba previa.

## Base SQLite Objetivo

La base Android debe seguir el contrato de Room existente:

- `entries`
- `translations`
- `variants`
- `examples`
- `notes`
- `references`
- `entry_references`
- `favorites`
- `history`
- `metadata`
- `phrases`
- `search_index`

Valida columnas contra entidades en `app/src/main/java/org/miskito/dictionary/data/local/entity/` y FTS contra `SearchIndexFtsEntity.kt`. No precargues `favorites` ni `history`.

## Busqueda

Refactoriza en esta direccion:

```text
RepositoryModule -> DictionaryRepository(entryDao, searchDao, metadataDao, textNormalizer)
DictionaryRepository.search()
  -> trim
  -> textNormalizer.normalizeForSearch(query)
  -> construir query FTS segura
  -> searchDao segun filtro
  -> mapear a dominio
  -> asignar SearchMatchType por headword/normalizedHeadword/variant/translation/example/note cuando haya datos disponibles
  -> SearchRanker.rank(...)
```

Si `SearchResultProjection` no contiene campos suficientes para distinguir variantes, ingles, ejemplos o notas, crea tarea especifica para ampliar proyeccion/DAO antes de afirmar ranking completo.

## About

`AboutViewModel` ya existe e inyecta `MetadataRepository`. Ajusta `AboutScreen` para usar `hiltViewModel()`, `collectAsStateWithLifecycle()` y `AboutUiState`. Renderiza texto legal exacto, cantidad de entradas y version de base. Agrega tests en `app/src/test/java/org/miskito/dictionary/viewmodel/AboutViewModelTest.kt` y/o prueba Compose local si la infraestructura existente lo permite.

## Settings

Inyecta `MetadataRepository` en `SettingsViewModel` y usa `BuildConfig.VERSION_NAME` para `appVersion`. Combina preferencias con metadata mediante Flow. Renderiza items informativos en `SettingsScreen` sin accion destructiva. Mantiene DataStore para preferencias.

## Comandos Normativos

Desde el repo Android:

```powershell
.\gradlew testDebugUnitTest
.\gradlew assembleRelease
```

Desde el handoff Node extraido o pipeline Node copiado:

```powershell
npm test
npm run validate:transcription
```

Validacion documental:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\zr_ma\OneDrive\Documentos\Crear documentación\crear-documentacion-agente-ia\scripts\verify_agent_docs.ps1" -DocsDir .
```

## Riesgos

El principal riesgo es aceptar un asset corrupto porque el archivo existe. Mitigalo con apertura SQLite, conteo de entradas, metadata y prueba Room. El segundo riesgo es mezclar pipeline Python roto con handoff Node verificado. Mitigalo manteniendo tareas separadas. El tercer riesgo es afirmar ranking completo sin datos suficientes en la proyeccion. Mitigalo agregando campos o bloqueando con evidencia.
