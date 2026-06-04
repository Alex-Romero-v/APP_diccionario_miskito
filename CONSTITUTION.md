# CONSTITUTION.md

## Proposito

Usa este contrato para corregir la app Android del diccionario miskito y para implementar la base de datos local desde `handoff_database_agent_20260603-211934.zip`. Ejecuta cambios atomicos, con pruebas TDD y validacion exacta. No uses este documento para reabrir la transcripcion del PDF salvo que la validacion del handoff falle.

## Fuentes Canonicas

1. Usa como fuente de datos el ZIP:
   `C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/handoff_database_agent_20260603-211934.zip`
2. Reconoce que el handoff declara:
   - `manifest.status = completed`
   - `page_count = 330`
   - `runtime.engine = node`
   - `runtime.python_allowed = false`
   - `runtime.network_allowed = false`
   - `output_mode = jsonl-partitioned`
   - `normalization.preserve_diacritics = true`
   - `normalization.create_diacriticless_search_forms = true`
3. Trata los artefactos intermedios como entrada inmutable: 330 paginas, 6386 entradas, 24 abreviaturas, 51 referencias, 66 libros biblicos y 282 filas de apendice.

## Reglas No Negociables

1. Lee `CONSTITUTION.md`, `SPEC.md`, `PLAN.md`, `TASKS.md`, `ORCHESTRATION.md` y `MANUAL_DE_USO.md` antes de modificar archivos.
2. Verifica que existe un repositorio Android antes de aplicar parches Kotlin o Compose.
3. Bloquea con `[TASK_BLOCKED: T001]` si no existen `settings.gradle`, `build.gradle`, `gradlew`, `DictionaryRepository.kt`, `RepositoryModule.kt`, `AboutScreen.kt` o `SettingsScreen.kt`.
4. Ejecuta una sola tarea pendiente por ciclo.
5. Modifica solo los archivos permitidos por la tarea activa.
6. No uses Python para generar la base de datos. Usa Node.js y SQLite local.
7. No uses red, OCR remoto, servicios externos ni permisos Android sensibles.
8. No crees una base vacia ni empaquetes un asset muerto. Bloquea si no puedes demostrar conteo de entradas mayor que 0.
9. No reemplaces `MiskitoTextNormalizer` ni `SearchRanker` con `lowercase()` directo.
10. Marca `[x]` solo despues de ejecutar el comando exacto de validacion de la tarea con salida exitosa.

## Restricciones Globales

No modifiques archivos fuera del alcance de la tarea activa. No uses Python. No uses red. No generes una base SQLite vacia. No empaquetes assets sin conteo verificable. No reemplaces componentes de dominio por logica inline. No alteres el handoff canonico salvo para copiarlo a una ruta permitida. No cambies UI no relacionada con las brechas documentadas.

## Texto Legal Obligatorio

Usa exactamente este texto visible en `AboutScreen.kt`:

```text
Esta aplicación está basada en el diccionario BÎLA YUMHPA – MISKITU-ENGLISH-ESPAÑOL. El contenido fue estructurado para permitir consulta rápida sin conexión a internet. Las traducciones de ejemplos pueden ser literales, siguiendo el estilo del diccionario original.
```

No sustituyas este texto por prosa historica, promocional o inventada.

## Politica De Base De Datos

Genera o integra un asset SQLite/Room verificable desde los JSONL del handoff. La app debe poder consultar sin internet. La base local debe exponer metadata viva con `entriesCount` y `databaseVersion`. La version de base debe derivarse de `manifest.source_date`, `manifest.source_pdf_sha256` o un valor determinista documentado.

## Politica De Busqueda

Usa normalizacion NFC, conserva diacriticos canonicos y crea formas auxiliares sin diacriticos solo para busqueda. Ordena resultados mediante dominio: headword exacto, variante exacta, prefijo de headword, prefijo de variante, traducciones, ejemplos, notas y referencias. No uses ordenamiento alfabetico simple como sustituto de relevancia.

## Politica De UI

Muestra metadata viva en About y Settings. About debe mostrar version de base local y cantidad de entradas. Settings debe mostrar version de app desde `BuildConfig.VERSION_NAME` y version del diccionario desde metadata local. No pidas permisos sensibles.

## Politica De Estado

Al completar una tarea, actualiza `TASKS.md` y emite `[TASK_COMPLETE: ID]`. Al bloquear, conserva `[ ]`, registra causa y emite `[TASK_BLOCKED: ID]`. No emitas ambos tokens para una misma corrida.
