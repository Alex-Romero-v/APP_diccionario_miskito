# CONSTITUTION.md

## Identidad Operativa

Corrige la aplicacion Android `DiccionarioMiskitoOffline` alojada en `https://github.com/Alex-Romero-v/APP_diccionario_miskito`. Trabaja como agente de cierre V1, no como redisenador de producto. Tu objetivo es cerrar las brechas auditadas: busqueda sin normalizador/ranker de dominio, About con texto incorrecto y sin metadata viva, Settings con versiones hardcodeadas, y base `dictionary.db` generada por pipeline Python roto.

## Fuentes Canonicas

Usa como paquete canonico de datos ya disponible en el repositorio:

```text
docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip
docs/agent-handoff/extracted/
```

Si ambos faltan en el repo, usa la copia local del usuario:

```text
C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/handoff_database_agent_20260603-211934.zip
```

El handoff declara `manifest.status = completed`, `page_count = 330`, `runtime.engine = node`, `python_allowed = false`, `network_allowed = false`, `output_mode = jsonl-partitioned`, `preserve_diacritics = true` y `create_diacriticless_search_forms = true`. Trata sus JSON/JSONL como fuente de datos inmutable salvo que una tarea ordene validarlos.

## Restricciones Globales

No uses Python para cerrar la base. No uses red. No agregues permisos Android sensibles. No agregues backend, IA generativa, OCR runtime, camara, audio, login, anuncios, analiticas ni sincronizacion. No cambies `applicationId`, `namespace`, `minSdk`, rutas de navegacion ni arquitectura MVVM + Repository + DAO/Room. No hagas refactors laterales. No marques tareas como completadas sin ejecutar el comando exacto.

## Arquitectura Obligatoria

Respeta esta cadena:

```text
UI Compose -> ViewModel -> Repository -> DAO/DataStore -> Room SQLite/assets
```

Coloca normalizacion en `domain/normalizer`, ranking en `domain/search`, consultas SQL en `data/local/dao`, mapeo en `data/repository`, DI en `di`, estado de UI en `viewmodel`, y render en `ui`. No ejecutes SQL desde composables. No accedas a Room directamente desde UI.

## Reglas De Datos

Reemplaza el camino Python roto del pipeline antiguo por el handoff Node verificado o por adaptadores Node derivados de ese handoff. La base final debe abrirse como SQLite, ser compatible con Room, contener metadata viva y no incluir favoritos ni historial precargados. Los conteos canonicos del handoff son:

- paginas: `330`
- entradas: `6386`
- abreviaturas: `24`
- referencias: `51`
- libros biblicos: `66`
- filas de apendice: `282`

La metadata minima de la app debe exponer `dictionaryName`, `dictionarySource`, `dictionaryDate`, `databaseVersion`, `buildDate`, `entriesCount`, `examplesCount` y `appMinSupportedVersion`.

## Reglas De Busqueda

No uses `lowercase()` directo como normalizacion principal en `DictionaryRepository.search()`. Inyecta `TextNormalizer` provisto por `MiskitoTextNormalizer`. Usa `SearchRanker` y `SearchMatchType` para ordenar resultados por relevancia. La tolerancia sin circunflejos debe cubrir consultas con y sin diacriticos. Conserva texto canonico visible con diacriticos.

## Texto Legal Obligatorio

`AboutScreen.kt` debe mostrar exactamente:

```text
Esta aplicación está basada en el diccionario BÎLA YUMHPA – MISKITU-ENGLISH-ESPAÑOL. El contenido fue estructurado para permitir consulta rápida sin conexión a internet. Las traducciones de ejemplos pueden ser literales, siguiendo el estilo del diccionario original.
```

No reemplaces ese texto con historia generica, atribuciones inventadas ni texto de Google AI Studio.

## Estado Y Tokens

Ejecuta una sola tarea por ciclo. Modifica solo archivos permitidos por la tarea activa. Si la validacion pasa, marca `[x]` y emite `[TASK_COMPLETE: ID]`. Si falla por causa no corregible dentro del alcance, conserva `[ ]` o marca `[!]` si la tarea lo ordena y emite `[TASK_BLOCKED: ID]`. No avances a tareas posteriores si una precondicion previa falla.
