# Diccionario Miskito Offline - Android

App Android offline para consultar un diccionario miskito-espanol basado en el
diccionario Bila Yumhpa.

## Estado actual

El repositorio esta preparado para una recuperacion funcional mediante SDD. La
auditoria detecto que la base SQLite empaquetada y la base generada estan
corruptas, por lo que la app no debe considerarse funcional hasta completar la
feature:

```text
recovery_offline_dictionary
```

## Como continuar

1. Lee `AGENTS.md`.
2. Ejecuta:

```powershell
.\init.ps1
```

3. Lee:

```text
specs/recovery_offline_dictionary/idea.md
specs/recovery_offline_dictionary/requirements.md
specs/recovery_offline_dictionary/design.md
specs/recovery_offline_dictionary/tasks.md
```

4. Espera aprobacion humana antes de implementar. La feature esta en
   `spec_ready`.

## Documentos principales

- `docs/audit-summary.md`: hallazgos de auditoria.
- `SPEC.md`: entrada rapida al SPEC.
- `TASKS.md`: entrada rapida a la cola de tareas.
- `specs/recovery_offline_dictionary/`: documentacion canonica.
- `docs/verification.md`: comandos de validacion esperados.

## Principios de producto

- Funcionar sin internet.
- No requerir `GEMINI_API_KEY`.
- No usar servicios remotos para buscar.
- Empaquetar una SQLite valida y ligera.
- Mostrar resultados miskito/espanol con formato lexicografico enriquecido.
