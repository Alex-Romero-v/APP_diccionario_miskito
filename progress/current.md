# Estado actual

Feature activa: `1 - recovery_offline_dictionary`

Estado: `in_progress`

Ultima accion completada:

- El usuario aprobo explicitamente implementar el plan para hacer pasar T035.
- Se restauro Gradle Wrapper en el repositorio.
- Se endurecio el generador/validador SQLite para recrear la DB, ejecutar
  `PRAGMA integrity_check`, validar schema critico y rechazar corrupcion.
- Se regenero `tools/dictionary-pipeline/output/dictionary.db`, se valido con
  6386 entradas y se copio a `app/src/main/assets/dictionary.db`.
- Se reescribio `PrepackagedDatabaseTest` como contrato de apertura Room del
  asset y consultas de tablas criticas.

Siguiente accion permitida:

- Instalar o exponer Java en `JAVA_HOME`/`PATH` y ejecutar
  `.\gradlew.bat testDebugUnitTest`.

No permitido todavia:

- No marcar T035 como completada hasta que `.\gradlew.bat testDebugUnitTest`
  termine con codigo 0.
