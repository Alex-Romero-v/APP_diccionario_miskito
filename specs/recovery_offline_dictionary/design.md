# Design - recovery_offline_dictionary

## Objetivo tecnico

Construir una ruta verificable desde los JSONL canonicos hasta una app Android
offline que busque y muestre entradas lexicograficas. El diseno evita cambios
oportunistas: cada modificacion debe existir porque cumple un requirement del
SPEC.

## Decisiones principales

1. La SQLite actual se considera corrupta y no participa como fuente.
2. El pipeline Node es la ruta principal de datos porque el handoff declara
   runtime Node y `python_allowed: false`.
3. Room sigue siendo la capa de acceso local Android.
4. FTS puede usarse, pero debe existir fallback normalizado.
5. La UI conserva Compose/Hilt/ViewModel existentes.
6. El producto final no usa red en runtime.

## Estructura de subsistemas

```text
docs/agent-handoff/extracted/
  Fuente canonica: JSONL, catalogos, apendices, checksums, PDF.

tools/dictionary-pipeline-node/
  Scripts Node testeables para contar, reparar, mapear, generar y validar DB.

tools/dictionary-pipeline/output/dictionary.db
  DB generada y validada antes de copiar.

app/src/main/assets/dictionary.db
  Asset final para Room.

app/src/main/java/org/miskito/dictionary/
  Android runtime: Room, repositories, dominio, UI.

progress/
  Evidencia de implementacion y review.
```

## Contrato de pipeline Node

### Entradas

- `--handoff docs/agent-handoff/extracted`
- `--out tools/dictionary-pipeline/output/dictionary.db`
- `--entries 6386` para validadores.

### Salidas

- SQLite valida.
- Reporte de conteos y auditoria, recomendado:
  `tools/dictionary-pipeline/output/data-audit-report.json`.
- Log/evidencia en `progress/impl_recovery_offline_dictionary.md`.

### Funciones puras esperadas

- `repairMojibake(text): string`
- `normalizeCanonical(text): string`
- `normalizeSearch(text): string`
- `parseDefinitionSegment(segment): ParsedSense[]`
- `mapJsonlEntry(entry): MappedEntry`
- `buildSearchDocument(mappedEntry): SearchDocument`

Estas funciones deben ser testeables sin crear SQLite.

## Politica de reparacion de texto

El pipeline debe operar en dos niveles:

1. `raw_text_original`: valor recibido del JSONL, conservado para auditoria.
2. `display_text`: valor reparado y normalizado a NFC para mostrar.
3. `search_text`: valor derivado de `display_text`, en minusculas, sin marcas
   diacriticas y con espacios colapsados.

La reparacion de mojibake solo acepta reglas probadas. Si una secuencia es
ambigua, se conserva y se reporta como revisable en vez de inventar correccion.

## Contrato SQLite

El schema puede reutilizar nombres actuales si Room lo requiere, pero debe
representar estos conceptos.

### `metadata`

```sql
key TEXT PRIMARY KEY NOT NULL
value TEXT NOT NULL
```

Claves obligatorias:

- `entriesCount`
- `translationsCount`
- `variantsCount`
- `examplesCount`
- `notesCount`
- `reviewableEntriesCount`
- `databaseVersion`
- `sourceName`
- `sourceDate`
- `sourcePdfSha256`
- `buildDate`
- `generatorVersion`

### `entries`

Campos conceptuales obligatorios:

- `id INTEGER PRIMARY KEY`
- `uid TEXT UNIQUE`
- `headword TEXT NOT NULL`
- `normalized_headword TEXT NOT NULL`
- `sort_key TEXT NOT NULL`
- `entry_type TEXT NOT NULL`
- `part_of_speech TEXT`
- `raw_part_of_speech TEXT`
- `source_page INTEGER`
- `raw_text TEXT NOT NULL`
- `display_text TEXT` si se separa de `raw_text`
- `verification_status TEXT NOT NULL`
- `extraction_confidence TEXT NOT NULL`
- `is_reviewable INTEGER NOT NULL`
- `review_reason TEXT`
- `reading_order INTEGER`
- flags `has_examples`, `has_notes`, `has_variants`

### `translations` o `senses`

Si se mantiene `translations`, debe representar sentidos:

- `id INTEGER PRIMARY KEY`
- `entry_id INTEGER NOT NULL`
- `sense_order INTEGER NOT NULL`
- `spanish_text TEXT`
- `english_text TEXT`
- `normalized_spanish TEXT`
- `normalized_english TEXT`
- `source_kind TEXT NOT NULL` (`structured`, `definition_segment`,
  `manual_review`)
- `is_inferred_from_definition INTEGER NOT NULL`
- `raw_text TEXT`
- `note TEXT`

No crear tabla `senses` si `translations` puede cumplir este contrato sin
romper Room innecesariamente.

### `variants`

Debe conservar texto canonico, normalizado, tipo y nota.

### `examples`

Debe conservar miskito, espanol, ingles, orden, fuente y normalizados
auxiliares cuando se busquen ejemplos.

### `notes`

Debe conservar tipo, texto, orden y normalizado si participa en busqueda.

### `references` y `entry_references`

Conservar catalogos si ya existen en el dominio. Si el handoff trae referencias
pero no se integran aun, reportar conteo pendiente y no bloquear busqueda
principal salvo que Room requiera tabla.

### `search_index`

Puede ser FTS4/FTS5 o tabla auxiliar, pero debe permitir columnas separadas:

- headword canonico/normalizado;
- variantes;
- espanol;
- ingles;
- ejemplos;
- notas;
- entry_id.

## Flujo de generacion

1. Resolver rutas absolutas dentro del repo.
2. Validar que `handoff` existe.
3. Listar JSONL en orden natural.
4. Contar lineas no vacias.
5. Parsear JSON con errores localizados por archivo/linea.
6. Mapear entradas a objetos intermedios.
7. Extraer sentidos/traducciones.
8. Reparar texto y generar normalizados.
9. Crear DB nueva.
10. Insertar dentro de transaccion.
11. Crear indices/FTS.
12. Insertar metadata.
13. Cerrar DB.
14. Reabrir readonly.
15. Ejecutar integridad, conteos y queries de muestra.

## Politica de parseo de `definition_segment`

Formato esperado frecuente:

```text
english terms / spanish terms
```

Reglas:

- Si no hay `/`, no extraer traduccion inferida automaticamente.
- Si hay mas de un `/`, dividir solo si el patron es inequivoco; si no, marcar
  revisable.
- Comas dentro de un lado representan sinonimos de un mismo sentido salvo
  numeracion o marcadores explicitos.
- Punto y coma puede separar grupos; si ambos lados tienen el mismo numero de
  grupos, emparejar por posicion; si no, conservar como sentido unico revisable.
- No traducir ingles a espanol ni espanol a ingles.

## Room y repositories

`DictionaryDatabase` debe declarar todas las entidades presentes en el asset.
Los DAOs deben tener consultas para:

- detalle por `entry_id`;
- resultados enriquecidos;
- fallback normalizado;
- metadata;
- favoritos/historial vacios inicialmente.

`DictionaryRepository.search()` debe separar responsabilidades:

1. validar query;
2. normalizar query;
3. obtener candidatos FTS;
4. obtener fallback si aplica;
5. deduplicar;
6. clasificar match;
7. rankear;
8. mapear a dominio.

## Dominio de busqueda

### `SearchMatchType`

Debe cubrir al menos:

- `EXACT_HEADWORD`
- `EXACT_NORMALIZED_HEADWORD`
- `EXACT_VARIANT`
- `PREFIX_HEADWORD`
- `PREFIX_VARIANT`
- `SPANISH_TRANSLATION`
- `ENGLISH_TRANSLATION`
- `EXAMPLE`
- `NOTE`
- `NONE`

### Ranking

`SearchRanker` debe tener pesos explicitos, pruebas unitarias y desempate por
`sort_key` + `entry_id`. No debe depender del orden accidental de SQLite.

## UI

### Resultado de busqueda

El modelo de resultado debe incluir:

- `entryId`
- `headword`
- `partOfSpeech`
- `primarySpanishText`
- `matchedSpanishText`
- `matchedSenseOrder`
- `sourcePage`
- `sensesCount`
- `hasVariants`
- `hasExamples`
- `hasNotes`
- `matchType`

La UI debe usar un layout compacto, apto para dispositivos pequenos, sin tarjetas
anidadas ni textos explicativos innecesarios.

### Detalle

El detalle debe renderizar:

1. Header.
2. Sentidos numerados.
3. Variantes.
4. Ejemplos.
5. Notas.
6. Referencias.
7. Auditoria tecnica plegable o claramente secundaria.

## Build, dependencias y release

- Agregar Gradle Wrapper antes de exigir comandos Gradle como cierre.
- Mantener dependencias necesarias: AndroidX, Compose, Room, Hilt/DataStore si
  se usan.
- Remover dependencias remotas no usadas en runtime.
- Release no usa `debugConfig`.
- Si minificacion se activa, agregar reglas ProGuard necesarias y probar
  `assembleRelease`.

## Evidencia

Cada tarea debe escribir evidencia en `progress/impl_recovery_offline_dictionary.md`.
El formato minimo por task:

```markdown
## TASK_DONE:T001
- Requirements: R...
- Archivos:
- Comandos:
- Resultado:
- Notas:
```

## Alternativas descartadas

- **Usar PDF en runtime:** descartado por peso, memoria y ausencia de estructura.
- **Usar API remota:** descartado por requisito offline.
- **Corregir solo UI sin regenerar DB:** descartado porque la DB corrupta rompe
  la base funcional.
- **Aceptar conteos menores sin reporte:** descartado porque oculta perdida de
  transcripcion.
- **Eliminar FTS y usar solo Kotlin:** descartado para v1 porque puede degradar
  rendimiento; fallback Kotlin/SQL normalizado si es aceptable, pero no como
  unica ruta sin medicion.

## Riesgos y mitigaciones

- **Mojibake ambiguo:** conservar raw y marcar revisable.
- **Schema mismatch:** test Room obligatorio antes de UI.
- **FTS incompatible:** fallback normalizado obligatorio.
- **Gradle Wrapper ausente:** primera tarea de implementacion.
- **Dependencias removidas rompen imports:** auditoria previa de imports y build.
- **Tareas demasiado amplias:** tasks se dividen por Red/Green/Refactor y
  validacion exacta.

DOC_DONE:design -> specs/recovery_offline_dictionary/design.md
