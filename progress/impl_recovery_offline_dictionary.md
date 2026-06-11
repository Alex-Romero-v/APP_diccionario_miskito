# Implementacion - recovery_offline_dictionary

## Aprobacion

- Fecha: 2026-06-11.
- Aprobacion humana: el usuario pidio explicitamente implementar el plan para
  hacer pasar T035.

## T002 - Gradle Wrapper

- Archivos: `gradlew`, `gradlew.bat`, `gradle/wrapper/gradle-wrapper.jar`,
  `gradle/wrapper/gradle-wrapper.properties`.
- Resultado: los archivos existen.
- Validacion ejecutada: `.\gradlew.bat --version` y
  `.\gradlew.bat testDebugUnitTest`.
- Estado: bloqueada por entorno local, porque `JAVA_HOME` no esta definido y
  no existe `java` en `PATH`.

## SQLite / T034

- Archivos: `tools/dictionary-pipeline-node/scripts/build-sqlite.mjs`,
  `tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs`,
  `tools/dictionary-pipeline-node/tests/build-sqlite.test.mjs`,
  `tools/dictionary-pipeline/output/dictionary.db`,
  `app/src/main/assets/dictionary.db`.
- Cambios: el generador recrea la DB desde cero, reabre readonly y ejecuta
  `PRAGMA integrity_check`; el validador rechaza corrupcion, valida tablas
  criticas, `entries`, `metadata.entriesCount` y `search_index`.
- Validacion: `npm test` pasa con 3 tests.
- Validacion: `node tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs --db tools/dictionary-pipeline/output/dictionary.db --entries 6386` pasa.
- Validacion: `node tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs --db app/src/main/assets/dictionary.db --entries 6386` pasa.
- Hash SHA256 source/asset:
  `1562AAA93FFD1EA64E6A3E1E3E3EAD414972E2375D927B56219991C8E6E2C185`.

## T035 - Prueba Room

- Archivo: `app/src/test/java/org/miskito/dictionary/data/local/database/PrepackagedDatabaseTest.kt`.
- Cambio: la prueba abre `dictionary.db` con `createFromAsset`, afirma 6386
  filas en `entries`, `metadata.entriesCount` y `search_index`, consulta tablas
  criticas y valida que FTS acepte `MATCH`.
- Validacion pendiente: `.\gradlew.bat testDebugUnitTest`.
- Bloqueo actual: falta Java local (`JAVA_HOME`/`java`).
