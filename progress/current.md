# Estado actual

Feature activa: `1 - recovery_offline_dictionary`

Estado: `spec_ready`

Ultima accion completada:

- Se adapto el arnes SDD del repositorio `Alex-Romero-v/Arnes` al proyecto
  Android `APP_diccionario_miskito`.
- Se reemplazo la documentacion antigua de parches V1 por una especificacion
  nueva basada en la auditoria.
- Se generaron `idea.md`, `requirements.md`, `design.md` y `tasks.md`.
- Se amplio la documentacion para cumplir mejor los lineamientos del arnes:
  `requirements.md` ahora contiene 72 requirements verificables y `tasks.md`
  contiene 70 tareas atomicas con Red/Green/Refactor, archivos permitidos,
  archivos prohibidos, validacion y evidencia esperada.

Siguiente accion permitida:

- Esperar aprobacion humana explicita para pasar de `spec_ready` a
  `in_progress`.

No permitido todavia:

- No modificar codigo Kotlin, Gradle, assets SQLite ni scripts de pipeline.
- No marcar tasks como completadas.
