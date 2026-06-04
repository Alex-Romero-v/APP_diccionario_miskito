# PLAN.md

## Arquitectura Objetivo

Integra dos subsistemas: pipeline de datos Node del handoff y app Android Kotlin/Room/Compose. El pipeline produce o valida los JSONL y genera un asset SQLite. La app abre la base local con Room, expone repositories de metadata y diccionario, y renderiza About/Settings con estado vivo.

## Arbol De Archivos Esperado

```text
<android-repo>/
  settings.gradle[.kts]
  build.gradle[.kts]
  gradlew
  app/
    build.gradle[.kts]
    src/main/
      assets/
        miskito_dictionary.db
      java|kotlin/.../
        data/
          DictionaryRepository.kt
          MetadataRepository.kt
          local/
            MetadataDao.kt
            DictionaryDao.kt
        domain/
          TextNormalizer.kt
          MiskitoTextNormalizer.kt
          SearchRanker.kt
        di/
          RepositoryModule.kt
        ui/about/
          AboutScreen.kt
          AboutViewModel.kt
        ui/settings/
          SettingsScreen.kt
          SettingsViewModel.kt
  tools/dictionary-pipeline/
    intermediate/
    src/
    tests/
  package.json
  package-lock.json
```

## Handoff De Datos

Extrae desde:

```text
C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/handoff_database_agent_20260603-211934.zip
```

Conserva como fuente los artefactos:

- `tools/dictionary-pipeline/intermediate/manifest.json`
- `tools/dictionary-pipeline/intermediate/dictionary_entries/*.jsonl`
- `tools/dictionary-pipeline/intermediate/catalog/*.jsonl`
- `tools/dictionary-pipeline/intermediate/appendix/*.jsonl`
- `tools/dictionary-pipeline/intermediate/checksums.json`

## Modelo SQLite Minimo

Implementa tablas:

- `metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL)`
- `entries(uid TEXT PRIMARY KEY, headword TEXT NOT NULL, normalized_headword TEXT NOT NULL, sort_key TEXT, raw_text TEXT, source_page INTEGER, entry_type TEXT)`
- `translations(id INTEGER PRIMARY KEY AUTOINCREMENT, entry_uid TEXT NOT NULL, english_text TEXT, spanish_text TEXT, translation_order INTEGER, is_literal INTEGER, raw_text TEXT)`
- `variants(id INTEGER PRIMARY KEY AUTOINCREMENT, entry_uid TEXT NOT NULL, variant_text TEXT NOT NULL, normalized_variant TEXT, variant_type TEXT, raw_text TEXT)`
- `examples(id INTEGER PRIMARY KEY AUTOINCREMENT, entry_uid TEXT NOT NULL, miskito_text TEXT, english_text TEXT, spanish_text TEXT, is_literal_translation INTEGER, raw_text TEXT)`
- `notes(id INTEGER PRIMARY KEY AUTOINCREMENT, entry_uid TEXT NOT NULL, note_type TEXT, note_text TEXT, raw_text TEXT)`
- `search_documents(entry_uid TEXT PRIMARY KEY, headword_norm TEXT, variants_norm TEXT, translations_norm TEXT, examples_norm TEXT, notes_norm TEXT)`

Usa FTS solo si ya existe patron local o si la tarea lo autoriza con prueba. Si no, usa indices B-tree y ranking en Kotlin.

## Convenciones De Normalizacion

Preserva texto canonico con diacriticos. Genera campos normalizados auxiliares. Usa `MiskitoTextNormalizer` para consulta y datos indexables. No apliques conversion sin diacriticos a `headword`, ejemplos ni notas canonicas.

## Inyeccion

En `RepositoryModule.kt`, provee:

- `TextNormalizer = MiskitoTextNormalizer()`
- `SearchRanker` si no es objeto puro.
- `DictionaryRepository(dictionaryDao, metadataDao, textNormalizer, searchRanker)`
- `MetadataRepository(metadataDao)`

## Estrategia TDD

Para cada parche Kotlin:

1. Escribe prueba que falle.
2. Implementa el minimo cambio.
3. Refactoriza sin ampliar alcance.
4. Ejecuta `.\gradlew testDebugUnitTest`.

Para datos:

1. Ejecuta validacion del handoff.
2. Genera SQLite.
3. Ejecuta consulta de conteo.
4. Ejecuta pruebas Android que abren la DB.

## Comandos Exactos

Desde el directorio donde se extrae el handoff:

```powershell
npm test
npm run validate:transcription
```

Desde el repo Android:

```powershell
.\gradlew testDebugUnitTest
```

Para auditar esta documentacion:

```powershell
powershell -ExecutionPolicy Bypass -File ..\Crear documentación\crear-documentacion-agente-ia\scripts\verify_agent_docs.ps1 -DocsDir ..\Crear documentación\documentacion-parches-dic-miskito-app
```
