# SPEC - recovery_offline_dictionary

El SPEC canonico esta en:

```text
specs/recovery_offline_dictionary/requirements.md
```

Este archivo raiz existe como entrada rapida para agentes y humanos. No debe
divergir del SPEC canonico. Antes de implementar, lee tambien:

- `specs/recovery_offline_dictionary/idea.md`
- `specs/recovery_offline_dictionary/design.md`
- `specs/recovery_offline_dictionary/tasks.md`

Resumen de obligaciones del SPEC ampliado:

- Regenerar SQLite valida desde JSONL canonico.
- Verificar `PRAGMA integrity_check` en DB generada y asset.
- Mantener conteo 6386 o justificar diferencia.
- Extraer traducciones desde `definition_segment` si `translations` esta vacio.
- Corregir mojibake con reglas deterministas.
- Implementar normalizacion Unicode real.
- Corregir busqueda miskito/espanol con ranking y fallback.
- Enriquecer resultados y detalle tipo diccionario.
- Mantener runtime offline y liviano.
- Agregar build/release reproducible sin firma debug.
- Dejar evidencia de implementacion y review.

El SPEC canonico contiene R1-R72, glosario, invariantes, criterios de
aceptacion y matriz inicial requirement -> prueba/comando. Usa ese archivo para
implementar; este resumen no es suficiente para ejecutar tareas.
