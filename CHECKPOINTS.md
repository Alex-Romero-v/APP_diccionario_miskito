# CHECKPOINTS - Diccionario Miskito Android

## C1 - Arnes instalado

- [x] Existen `AGENTS.md`, `feature_list.json`, `progress/current.md` e
  `init.ps1`.
- [x] Existen prompts en `agents/`.
- [x] Existen docs operativos en `docs/`.
- [x] Existe spec SDD en `specs/recovery_offline_dictionary/`.

## C2 - Estado coherente

- [x] Hay una sola feature activa.
- [x] La feature esta `spec_ready`, no `in_progress`.
- [x] No hay tareas marcadas como implementadas en el nuevo `tasks.md`.

## C3 - Preparacion para implementacion

- [x] La auditoria critica esta resumida en `docs/audit-summary.md`.
- [x] `requirements.md` tiene requirements verificables.
- [x] `tasks.md` cubre todos los requirements.
- [ ] Pendiente tras aprobacion: ejecutar implementacion y pruebas.

## C4 - Cierre futuro de implementacion

El trabajo de codigo solo podra cerrarse cuando:

- [ ] `PRAGMA integrity_check` devuelva `ok` para DB generada y asset.
- [ ] `entries` y metadata reporten 6386 entradas o diferencia justificada.
- [ ] Room abra el asset en pruebas locales.
- [ ] Busquedas miskito/espanol pasen casos de aceptacion.
- [ ] UI no muestre mojibake.
- [ ] Release no use firma debug ni dependencias online innecesarias.
