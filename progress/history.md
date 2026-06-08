# Historial

## 2026-06-07 - Adaptacion del arnes SDD

- Se clono y reviso el arnes `Alex-Romero-v/Arnes`.
- Se adapto el contrato de agentes al proyecto Android offline.
- Se eliminaron documentos antiguos que declaraban validaciones no confiables.
- Se redacto la documentacion SDD de la feature `recovery_offline_dictionary`.
- El repositorio queda detenido en `spec_ready`, listo para aprobacion humana
  antes de implementar.

## 2026-06-07 - Ampliacion de SPEC y tasks

- Se reviso la documentacion frente a los principios del arnes.
- Se expandio `requirements.md` de una especificacion general a 72
  requirements verificables con glosario, invariantes y matriz R -> test/comando.
- Se expandio `design.md` con contratos de pipeline, SQLite, Room, busqueda, UI,
  release y evidencia.
- Se reemplazo `tasks.md` por una cola de 70 tareas atomicas con precondiciones,
  archivos permitidos/prohibidos, fases Red/Green/Refactor, validacion y
  evidencia.
- `.\init.ps1` valida ahora dinamicamente todos los `R<n>` detectados.
