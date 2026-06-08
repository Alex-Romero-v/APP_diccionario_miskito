# Verificacion

## Comandos documentales

```powershell
.\init.ps1
```

## Verificacion de pipeline

```powershell
npm test
npm run validate:transcription
node tools/dictionary-pipeline-node/scripts/build-sqlite.mjs --handoff docs/agent-handoff/extracted --out tools/dictionary-pipeline/output/dictionary.db
node tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs --db tools/dictionary-pipeline/output/dictionary.db --entries 6386
```

El validador debe comprobar:

- apertura SQLite;
- `PRAGMA integrity_check`;
- conteos de tablas;
- metadata;
- consultas miskito/espanol de muestra.

## Verificacion Android

Cuando Gradle Wrapper exista:

```powershell
.\gradlew testDebugUnitTest
.\gradlew assembleRelease
```

Si se usa Gradle del sistema por ausencia temporal de wrapper, registrar el
comando exacto y bloquear cierre hasta agregar wrapper.

## Casos manuales minimos

- Buscar `ba`.
- Buscar `baha`.
- Buscar `yapti`.
- Buscar `madre`.
- Buscar `casa`.
- Buscar `agua`.
- Buscar una palabra con diacritico y la misma sin diacritico.
