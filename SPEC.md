# SPEC.md

## Alcance

Corrige la app Android del diccionario miskito para que consuma la normalizacion/ranking de dominio, muestre metadata viva en About y Settings, y empaquete una base SQLite/Room real generada desde el handoff `handoff_database_agent_20260603-211934.zip`.

## No Alcance

No rehagas la transcripcion del PDF si el handoff valida. No uses Python. No uses red. No agregues permisos Android sensibles. No inventes datos lexicograficos que no existan en JSON/JSONL. No cambies UI no relacionada con About, Settings, busqueda o metadata.

## Actores

- Usuario propietario: entrega el handoff y valida que la app funcione offline.
- Agente implementador: aplica tareas atomicas en el repo Android.
- Agente de datos: integra el pipeline Node y produce el asset SQLite verificable.
- Agente verificador: ejecuta comandos exactos y revisa tokens.

## Requisitos Funcionales

### RF-001: Validar presencia del repo Android

Dado el directorio de trabajo, cuando inicies la ejecucion, entonces localiza `settings.gradle` o `settings.gradle.kts`, `gradlew`, modulo Android y archivos Kotlin requeridos. Si no existen, bloquea antes de modificar.

### RF-002: Integrar handoff de base de datos

Dado el ZIP canonico, cuando prepares el pipeline, entonces extrae o copia `tools/dictionary-pipeline`, `package.json`, `package-lock.json` y documentos canonicos a una ubicacion permitida del repo. Cuando ejecutes `npm test && npm run validate:transcription`, entonces debe pasar sin red y sin Python.

### RF-003: Generar SQLite no vacio

Dado 6386 entradas JSONL, cuando generes el asset SQLite, entonces crea tablas para entradas, traducciones, variantes, ejemplos, notas, referencias, metadata y FTS/search si el stack lo permite. Entonces verifica que `entries` tenga 6386 filas o justifica cualquier diferencia con regla documentada.

### RF-004: Consumir normalizador y ranker

Dado que existen `MiskitoTextNormalizer.kt` y `SearchRanker.kt`, cuando `DictionaryRepository.search()` reciba una consulta, entonces normaliza la consulta y los campos indexables con el normalizador de dominio. Entonces ordena mediante `SearchRanker` y no mediante `lowercase()` directo.

### RF-005: About con metadata viva

Dado metadata local disponible, cuando abras About, entonces muestra el texto legal obligatorio, `entriesCount` y `databaseVersion`. Si metadata no carga, muestra estado de error no destructivo y registra prueba.

### RF-006: Settings con versiones

Dado `BuildConfig.VERSION_NAME` y metadata local, cuando abras Settings, entonces muestra version de app y version del diccionario. No ocultes esos datos detras de acciones destructivas ni de permisos.

## Escenarios BDD

### Escenario: Repo Android ausente

Dado que no se encuentran `DictionaryRepository.kt` ni `gradlew`, cuando el agente seleccione `T001`, entonces no modifica archivos de app y emite `[TASK_BLOCKED: T001]`.

### Escenario: Base local real

Dado el handoff con `manifest.status = completed`, cuando el agente genere el asset SQLite, entonces `SELECT COUNT(*) FROM entries;` devuelve `6386` y la app empaqueta el archivo en `src/main/assets/` o la ruta Room equivalente.

### Escenario: Busqueda tolerante a diacriticos

Dado una entrada con diacritico y una consulta sin diacritico, cuando el usuario busca, entonces el resultado aparece y se ordena segun relevancia de `SearchRanker`.

### Escenario: About legal y dinamico

Dado metadata cargada, cuando About se renderiza, entonces muestra exactamente el texto obligatorio y tambien la cantidad de entradas y version de base.

### Escenario: Settings informativo

Dado version de app y version de diccionario, cuando Settings se renderiza, entonces ambos valores son visibles mediante elementos informativos.

## Criterios De Aceptacion

- El pipeline del ZIP valida con `npm test && npm run validate:transcription`.
- La base SQLite generada no esta vacia y contiene 6386 entradas.
- `DictionaryRepository.search()` usa `MiskitoTextNormalizer` y `SearchRanker`.
- `RepositoryModule.kt` inyecta `TextNormalizer` y dependencias necesarias.
- `AboutScreen.kt` muestra texto legal exacto, entradas y version de base.
- `SettingsScreen.kt` muestra version de app y version de diccionario.
- Las pruebas unitarias del modulo Android pasan con comando exacto documentado.
