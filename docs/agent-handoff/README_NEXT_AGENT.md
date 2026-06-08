# Handoff de datos

Esta carpeta conserva artefactos del handoff de transcripcion. No es el arnes
principal del repo. Para implementar mejoras, lee primero:

```text
AGENTS.md
docs/audit-summary.md
specs/recovery_offline_dictionary/
```

## Estado verificado por auditoria

- El handoff declara `manifest.status = completed`.
- Los JSONL de `intermediate/dictionary_entries` suman 6386 entradas.
- Las SQLite actuales del repo no son confiables: la generada y el asset
  empaquetado fueron reportados como corruptos durante la auditoria.

## Uso correcto

1. Usa los JSONL, catalogos y apendices como fuente canonica inicial.
2. Regenera `tools/dictionary-pipeline/output/dictionary.db`.
3. Valida integridad y conteos.
4. Copia al asset Android solo despues de validacion verde.

## No hacer

- No usar este README para saltar el SPEC actual.
- No marcar validaciones como pasadas sin ejecutar comandos.
- No copiar una DB corrupta a `app/src/main/assets`.
