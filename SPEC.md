# SPEC.md

## Proposito

Define los requisitos funcionales para que otro agente cierre los parches pendientes del diccionario miskito: integrar la base real desde el handoff Node, reparar busqueda con normalizacion/ranking de dominio, y mostrar metadata viva en About y Settings.

## Alcance

Incluye solo:

1. Validar y usar `docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip` o la carpeta ya extraida `docs/agent-handoff/extracted/`.
2. Reemplazar o aislar el pipeline Python roto que produjo `database disk image is malformed`.
3. Generar `tools/dictionary-pipeline/output/dictionary.db` desde JSONL canonicos.
4. Copiar una base validada a `app/src/main/assets/dictionary.db`.
5. Verificar compatibilidad Room con `DictionaryDatabase`.
6. Refactorizar `DictionaryRepository.search()` para usar `MiskitoTextNormalizer`, `TextNormalizer`, `SearchRanker` y `SearchMatchType`.
7. Renderizar About con texto legal exacto y metadata viva.
8. Renderizar Settings con `BuildConfig.VERSION_NAME` y version de diccionario desde metadata.
9. Mantener offline-first y cero permisos sensibles.

## Fuera De Alcance

No implementes nuevas pantallas, redisenos, backend, internet runtime, OCR, IA generativa, audio, camara, login, analiticas, anuncios, sincronizacion, cursos, juegos ni edicion comunitaria. No rehagas la transcripcion del PDF si el handoff Node valida.

## Estado Actual Observado

El repo contiene `app/src/main/assets/dictionary.db`, pero existe `db_build_error.txt` con error `sqlite3.DatabaseError: database disk image is malformed`. `DictionaryRepository.search()` normaliza con `trimmedQuery.lowercase().replace(...)` y ordena solo por exact/prefix de `headword`. `RepositoryModule.kt` no inyecta `TextNormalizer` en `DictionaryRepository`. `AboutViewModel` ya inyecta `MetadataRepository`, pero `AboutScreen()` no recibe ni observa el ViewModel. `SettingsViewModel` expone `appVersion = "1.0.0"` y `dbVersion = "1.0"` hardcodeados, y `SettingsScreen` no muestra esos valores.

## Escenarios BDD

### Escenario: Handoff Node validado

Dado `docs/agent-handoff/extracted/`, cuando el agente valida el handoff, entonces no debe buscar archivos en `C:/Users/...`; debe usar los JSON/JSONL ya presentes en el repo y registrar si no puede ejecutar `npm ci` por falta de red.

### Escenario: Base SQLite real

Dado los JSONL del handoff con 6386 entradas, cuando el agente genera `tools/dictionary-pipeline/output/dictionary.db`, entonces la consulta `SELECT COUNT(*) FROM entries` debe devolver `6386` o bloquear con causa documentada si hay deduplicacion explicita.

### Escenario: Asset compatible con Room

Dado `app/src/main/assets/dictionary.db`, cuando se ejecuta `.\gradlew testDebugUnitTest`, entonces la prueba `PrepackagedDatabaseTest` o su reemplazo debe demostrar que Room abre la base, consulta metadata, no encuentra favoritos precargados y no encuentra historial precargado.

### Escenario: Busqueda tolerante

Dado una consulta sin circunflejos, cuando `DictionaryRepository.search()` consulta la base, entonces debe usar `TextNormalizer.normalizeForSearch` y ordenar con `SearchRanker`, no con ranking inline simplificado.

### Escenario: About correcto

Dado metadata emitida por `MetadataRepository`, cuando `AboutScreen` se renderiza, entonces muestra el texto legal obligatorio, `entriesCount` y `databaseVersion`.

### Escenario: Settings correcto

Dado `BuildConfig.VERSION_NAME` y metadata local, cuando `SettingsScreen` se renderiza, entonces muestra version de app y version del diccionario como items informativos.

## Criterios De Aceptacion

- `npm test` y `npm run validate:transcription` pasan para el handoff Node.
- La base generada contiene 6386 entradas y metadata minima.
- `app/src/main/assets/dictionary.db` no esta corrupta y Room puede abrirla.
- `DictionaryRepository` recibe `TextNormalizer` por DI.
- `DictionaryRepository.search()` usa `SearchRanker`.
- `AboutScreen` deja de mostrar texto inventado y consume `AboutViewModel`.
- `SettingsViewModel` deja de hardcodear la version de diccionario.
- `SettingsScreen` muestra versiones.
- `.\gradlew testDebugUnitTest` pasa.
- `.\gradlew assembleRelease` pasa despues de validar asset.
