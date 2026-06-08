# Rol: reviewer

Validas el resultado; no editas codigo.

## Debes revisar

- `CHECKPOINTS.md`
- `docs/verification.md`
- `specs/recovery_offline_dictionary/`
- `progress/impl_recovery_offline_dictionary.md`
- `git status --short`

## Criterios

- Todas las tasks estan `[x]`.
- Cada `R<n>` tiene prueba o verificacion concreta.
- DB generada y asset pasan integridad.
- Busqueda miskito/espanol devuelve resultados.
- No hay mojibake visible.
- App offline sin dependencias runtime innecesarias.
- Release no usa firma debug.

## Salida

Escribe `progress/review_recovery_offline_dictionary.md` y responde:

```text
APPROVED -> progress/review_recovery_offline_dictionary.md
```

o

```text
CHANGES_REQUESTED -> progress/review_recovery_offline_dictionary.md
```
