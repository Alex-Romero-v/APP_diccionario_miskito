# PLAN.md ## 1. Propósito Define la arquitectura técnica, árbol de archivos, módulos, comandos y convenciones para ejecutar la transcripción completa del PDF fuente hacia objetos intermedios JSON y JSONL usando Node.js. Este documento regula únicamente la transcripción. No generes bases de datos. No generes código de consumo final. No hagas referencia a sistemas externos a la transcripción. ## 2. Principio de ejecución Ejecuta siempre esta secuencia: ```text Lee CONSTITUTION.md. Lee SPEC.md. Lee PLAN.md. Lee TASKS.md. Lee ORCHESTRATION.md si existe. Verifica entorno Node.js. Verifica PDF fuente. Selecciona la tarea pendiente. Ejecuta solo el alcance de esa tarea. Ejecuta el comando de validación exacto. Actualiza estado. Emite token. 
No ejecutes pasos fuera de la fase activa.
No uses Python.
No uses red.
No uses servicios externos.
No uses OCR remoto.
3. Ruta fuente
Usa esta ruta única:
tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf 
Trata el PDF como inmutable.
Calcula SHA-256 antes de extraer.
Bloquea si el PDF no existe.
Bloquea si el conteo de páginas no es 330.
4. Arquitectura general
Implementa un pipeline local en Node.js dividido en seis capas:
Capa 1: entorno y guardas de archivos Capa 2: lectura del PDF Capa 3: extracción de páginas y bloques Capa 4: parseo semántico por sección Capa 5: escritura JSON / JSONL / checksums Capa 6: validación completa 
Cada capa debe ser determinista.
Cada módulo debe recibir entradas explícitas.
Cada módulo debe devolver objetos serializables.
Ningún módulo debe depender de estado global mutable salvo constantes de configuración.
5. Árbol de archivos planificado
Crea o mantiene esta estructura:
tools/dictionary-pipeline/ ├── input/ │ └── BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf ├── src/ │ ├── cli.mjs │ ├── config/ │ │ ├── constants.mjs │ │ ├── sections.mjs │ │ └── allowed-paths.mjs │ ├── guards/ │ │ ├── assert-node-runtime.mjs │ │ ├── assert-no-python.mjs │ │ ├── assert-no-network.mjs │ │ └── assert-write-scope.mjs │ ├── io/ │ │ ├── ensure-directories.mjs │ │ ├── read-json.mjs │ │ ├── write-json-atomic.mjs │ │ ├── write-jsonl-atomic.mjs │ │ ├── list-files-deterministic.mjs │ │ └── checksum.mjs │ ├── pdf/ │ │ ├── load-pdf.mjs │ │ ├── extract-page-text.mjs │ │ ├── extract-page-layout.mjs │ │ ├── extract-page-visuals.mjs │ │ └── classify-page-section.mjs │ ├── normalize/ │ │ ├── normalize-text.mjs │ │ ├── normalize-headword.mjs │ │ ├── normalize-phrase.mjs │ │ └── slugify-uid.mjs │ ├── block/ │ │ ├── build-lines.mjs │ │ ├── build-blocks.mjs │ │ ├── classify-block.mjs │ │ ├── assign-coverage.mjs │ │ └── link-continuations.mjs │ ├── parse/ │ │ ├── parse-manifest.mjs │ │ ├── parse-index.mjs │ │ ├── parse-usage.mjs │ │ ├── parse-dictionary-notes.mjs │ │ ├── parse-abbreviations.mjs │ │ ├── parse-references.mjs │ │ ├── parse-bible-books.mjs │ │ ├── parse-dictionary-pages.mjs │ │ ├── parse-entry.mjs │ │ ├── parse-entry-translations.mjs │ │ ├── parse-entry-variants.mjs │ │ ├── parse-entry-examples.mjs │ │ ├── parse-entry-notes.mjs │ │ ├── parse-entry-cross-references.mjs │ │ ├── parse-appendix.mjs │ │ ├── parse-verb-tables.mjs │ │ ├── parse-grammar-rules.mjs │ │ └── parse-phrases.mjs │ ├── schemas/ │ │ ├── page.schema.mjs │ │ ├── dictionary-entry.schema.mjs │ │ ├── catalog.schema.mjs │ │ ├── appendix.schema.mjs │ │ ├── review.schema.mjs │ │ └── manifest.schema.mjs │ ├── validate/ │ │ ├── validate-json.mjs │ │ ├── validate-jsonl.mjs │ │ ├── validate-manifest.mjs │ │ ├── validate-pages.mjs │ │ ├── validate-blocks.mjs │ │ ├── validate-coverage.mjs │ │ ├── validate-uids.mjs │ │ ├── validate-traceability.mjs │ │ ├── validate-normalization.mjs │ │ ├── validate-checksums.mjs │ │ ├── validate-review-state.mjs │ │ └── validate-transcription.mjs │ └── report/ │ ├── build-page-report.mjs │ ├── build-coverage-report.mjs │ └── build-final-report.mjs ├── tests/ │ ├── env.test.mjs │ ├── manifest.test.mjs │ ├── pdf-loading.test.mjs │ ├── normalization.test.mjs │ ├── uid.test.mjs │ ├── block-classification.test.mjs │ ├── catalog-parsing.test.mjs │ ├── entry-parsing.test.mjs │ ├── appendix-parsing.test.mjs │ └── validation.test.mjs ├── intermediate/ │ ├── manifest.json │ ├── pages/ │ ├── dictionary_entries/ │ ├── catalog/ │ ├── appendix/ │ ├── review/ │ └── checksums.json └── reports/ ├── page_extraction_report.md ├── coverage_report.md └── transcription_report.md 
6. Configuración de Node.js
Usa módulos ESM.
Configura package.json con scripts mínimos:
{ "type": "module", "scripts": { "validate:env": "node tools/dictionary-pipeline/src/cli.mjs validate-env", "transcribe:init": "node tools/dictionary-pipeline/src/cli.mjs init", "transcribe:pages": "node tools/dictionary-pipeline/src/cli.mjs extract-pages", "transcribe:catalog": "node tools/dictionary-pipeline/src/cli.mjs parse-catalog", "transcribe:dictionary": "node tools/dictionary-pipeline/src/cli.mjs parse-dictionary", "transcribe:appendix": "node tools/dictionary-pipeline/src/cli.mjs parse-appendix", "transcribe:checksums": "node tools/dictionary-pipeline/src/cli.mjs checksums", "validate:transcription": "node tools/dictionary-pipeline/src/cli.mjs validate-transcription", "test": "node --test tools/dictionary-pipeline/tests/**/*.test.mjs" } } 
Usa npm ci cuando exista package-lock.json.
No uses instalación dinámica durante una tarea.
No uses dependencias no fijadas.
7. Dependencias permitidas
Usa solo dependencias declaradas y bloqueadas en package-lock.json.
Permite:
pdfjs-dist 
Permite dependencias auxiliares solo si son necesarias para validación local y quedan bloqueadas en package-lock.json.
No uses dependencias que llamen servicios remotos.
No uses dependencias que ejecuten Python.
No uses dependencias que requieran red en runtime.
8. CLI único
Implementa un único punto de entrada:
tools/dictionary-pipeline/src/cli.mjs 
Debe aceptar estos comandos:
validate-env init extract-pages parse-catalog parse-dictionary parse-appendix checksums validate-transcription 
Cada comando debe:
1. Verificar entorno. 2. Verificar ausencia de Python en scripts ejecutables. 3. Verificar alcance de escritura. 4. Ejecutar solo su operación. 5. Escribir salidas atómicamente. 6. Devolver código 0 si pasa. 7. Devolver código distinto de 0 si falla. 
9. Escritura atómica
Escribe siempre en archivo temporal y renombra al final.
Patrón obligatorio:
<target>.tmp 
Ejemplo:
page_0010.json.tmp -> page_0010.json 
Si falla una validación, elimina el archivo temporal.
No dejes archivos parciales.
No sobrescribas una salida válida con una salida inválida.
10. Guardas de alcance
Implementa assert-write-scope.mjs.
Permite escritura solo en:
tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** tools/dictionary-pipeline/src/** tools/dictionary-pipeline/tests/** package.json package-lock.json CONSTITUTION.md SPEC.md PLAN.md TASKS.md ORCHESTRATION.md MANUAL_DE_USO.md 
Bloquea cualquier otra ruta.
Emite:
[TASK_BLOCKED: WRITE_SCOPE_VIOLATION] 
11. Carga del PDF
Implementa load-pdf.mjs.
Debe:
1. Verificar existencia del PDF. 2. Calcular SHA-256. 3. Cargar con pdfjs-dist. 4. Obtener número de páginas. 5. Verificar que page_count = 330. 6. Devolver objeto PDF y metadatos. 
No modifiques el PDF.
No copies el PDF.
No renombres el PDF.
12. Extracción de texto por página
Implementa extract-page-text.mjs.
Usa extracción textual nativa del PDF.
Configura extracción para preservar la mayor fidelidad posible:
disableNormalization = true includeMarkedContent = true 
Por cada página, conserva:
texto completo items de texto transformaciones posición x/y ancho alto fuente orden original 
No uses OCR si existe texto extraíble.
Si una página no devuelve texto pero contiene elementos visuales, marca revisión bloqueante.
13. Extracción de layout
Implementa extract-page-layout.mjs.
Construye líneas mediante agrupación por coordenada vertical.
Reglas:
Ordena por y descendente. Agrupa items con tolerancia vertical estable. Dentro de cada línea, ordena por x ascendente. Une segmentos con espacio si hay separación visual suficiente. Conserva saltos de línea por bloque. 
Calcula para cada línea:
{ "line_id": "", "text": "", "bbox": { "x": 0, "y": 0, "width": 0, "height": 0 }, "font_summary": {}, "color_summary": {}, "reading_order": 0 } 
No reordenes columnas sin evidencia de layout.
Si la página tiene tabla, usa coordenadas de columna.
14. Extracción visual
Implementa extract-page-visuals.mjs.
Registra:
imágenes tablas detectadas líneas gráficas bloques de texto pequeño texto con color funcional números de página marcadores de layout 
No transcribas desde imagen salvo que el texto sea verificable con extracción textual.
Para cada elemento visual, genera:
{ "uid": "", "object_type": "visual_element", "visual_type": "image", "source_page": 1, "bbox": null, "description": "", "associated_text": "", "requires_manual_review": false } 
Si no puedes determinar descripción visual, usa descripción neutral:
Elemento visual detectado en la página. 
No inventes contenido.
15. Construcción de bloques
Implementa build-blocks.mjs.
Convierte líneas en bloques.
Reglas de bloque:
Nuevo bloque si aumenta el espacio vertical. Nuevo bloque si cambia de encabezado a cuerpo. Nuevo bloque si empieza una entrada nueva. Nuevo bloque si empieza ejemplo. Nuevo bloque si empieza nota. Nuevo bloque si cambia estructura de tabla. Nuevo bloque si aparece número de página aislado. 
Cada bloque debe cumplir:
{ "block_id": "p0010-b0001", "page_number": 10, "text": "", "block_type": "entry_candidate", "bbox": null, "reading_order": 1, "font_summary": {}, "color_summary": {}, "confidence": 1.0 } 
No generes bloques vacíos.
No elimines texto decorativo si es visible y textual.
16. Clasificación de secciones
Implementa classify-page-section.mjs.
Usa rango de páginas y encabezados visibles.
Secciones permitidas:
cover index usage dictionary_notes abbreviations references bible_books dictionary appendix_overview verb_overview verb_tables verb_tense_guide regular_verbs irregular_verbs nouns verb_to_noun construct_forms comparisons numbers_years pronunciation short_forms grammar_rules phrases unknown 
Si existe conflicto entre rango e encabezado, prioriza encabezado visible.
Si no hay evidencia suficiente, usa unknown y crea revisión.
17. Convención de UID
Implementa slugify-uid.mjs.
Reglas:
Usa minúsculas. Aplica normalización auxiliar. Elimina puntuación no estructural. Reemplaza espacios por guiones. Colapsa guiones repetidos. Recorta guiones extremos. No uses UUID aleatorio. No uses timestamp. 
Patrones:
page-p0001 block-p0010-b0001 entry-p0010-b0001-abakaia abbreviation-p0005-v reference-p0006-db bible-book-p0008-blasi-sturka phrase-p0328-b0001-pain-was review-p0010-b0007 
Si hay colisión, agrega sufijo determinista:
-002 -003 
18. Normalización
Implementa normalize-text.mjs.
Reglas:
NFC trim exterior colapso de espacios internos casefold para campos normalizados preservación total del campo canónico 
Para normalización auxiliar, convierte:
â -> a ê -> e î -> i ô -> o û -> u Â -> a Ê -> e Î -> i Ô -> o Û -> u 
No apliques esta conversión a raw_text, headword, phrase_text, ejemplos ni notas canónicas.
19. Parseo del manifiesto
Implementa parse-manifest.mjs.
Genera:
tools/dictionary-pipeline/intermediate/manifest.json 
Debe incluir:
schema_version source_name source_date source_pdf_path source_pdf_sha256 page_count language_scope runtime output_mode normalization status 
status inicial debe ser:
in_progress 
status final debe ser:
completed 
Solo cambia a completed después de validate:transcription.
20. Parseo de páginas
El comando extract-pages debe crear:
tools/dictionary-pipeline/intermediate/pages/page_0001.json ... tools/dictionary-pipeline/intermediate/pages/page_0330.json 
Cada página debe incluir:
object_type uid pdf_page_number printed_page_number section secondary_sections raw_text raw_text_sha256 blocks visual_elements derived_objects coverage verification_status extraction_confidence 
No marques una página como verified durante extracción base.
Usa parsed.
21. Parseo de abreviaturas
Implementa parse-abbreviations.mjs.
Entrada:
pages/page_0005.json 
Salida:
catalog/abbreviations.jsonl 
Detecta una abreviatura cuando una línea comienza con código seguido de descripción.
Conserva códigos con puntuación:
a/t: Alt: fs/ea: Lit: 
No elimines barras.
No elimines dos puntos.
22. Parseo de referencias
Implementa parse-references.mjs.
Entrada:
pages/page_0006.json pages/page_0007.json 
Salida:
catalog/references.jsonl 
Detecta nuevo registro con patrón:
<code> - 
Permite códigos con letras, números y guion bajo.
Une líneas de continuación hasta el siguiente código.
Conserva texto bilingüe completo en raw_text.
No dividas una referencia larga si no hay nuevo código visible.
23. Parseo de libros bíblicos
Implementa parse-bible-books.mjs.
Entrada:
pages/page_0008.json pages/page_0009.json 
Salida:
catalog/bible_books.jsonl 
Usa coordenadas de columnas cuando estén disponibles.
Columnas esperadas:
miskito short_code english spanish 
Marca sección:
hebrew_scriptures greek_scriptures 
No descartes filas partidas.
Si una celda queda ambigua, conserva fila completa en revisión.
24. Parseo del diccionario principal
Implementa parse-dictionary-pages.mjs.
Entrada:
pages/page_0010.json ... pages/page_0295.json 
Salida:
dictionary_entries/entries_pages_0010_0025.jsonl dictionary_entries/entries_pages_0026_0050.jsonl ... 
Usa particiones deterministas por rango de páginas.
No dependas del orden del sistema de archivos.
Ordena entradas por:
source_page ASC reading_order ASC headword ASC uid ASC 
25. Detección de entradas
Implementa parse-entry.mjs.
Una entrada puede iniciar cuando:
La línea comienza en indentación primaria. La línea contiene lema seguido de guion largo o equivalente. La línea contiene parte de habla entre paréntesis. La línea contiene referencia cruzada autónoma. La línea tiene estilo visual de entrada. 
No uses una sola regla.
Combina evidencia textual y layout.
Si una línea no puede asignarse con seguridad, crea needs_review.
26. División de entrada
Divide una entrada en:
headword variant_segment part_of_speech_segment definition_segment example_segments note_segments reference_segments cross_reference_segments raw_text 
No pierdas ningún segmento.
Si una división es incierta, conserva todo en raw_text y marca revisión.
27. Traducciones
Implementa parse-entry-translations.mjs.
Regla base:
Texto antes del separador bilingüe principal "/" después del guion: inglés. Texto después del separador bilingüe principal "/" después del guion: español. 
No apliques la división si el separador pertenece a abreviatura, código o expresión interna.
Si la separación es dudosa, conserva raw_text y marca revisión.
28. Variantes
Implementa parse-entry-variants.mjs.
Detecta:
a/t: Alt: fs/ea: former spelling also spelled alternatively formas entre paréntesis junto al lema formas sin diacríticos en texto pequeño formas constructivas declaradas formas irregulares declaradas 
Tipos permitidos:
also_spelled alternative former_spelling diacriticless construct irregular parenthetical related unknown 
No conviertas variantes en lemas independientes salvo evidencia clara.
29. Ejemplos
Implementa parse-entry-examples.mjs.
Detecta:
(Ex/Ej: (ExEj: (Ex/Ej( (ExEj( Ex: Ej: 
Cada ejemplo debe conservar:
miskito_text english_text spanish_text source_code source_detail raw_reference_text raw_text source_blocks example_order 
No descartes ejemplos incompletos.
No completes traducciones faltantes.
30. Notas
Implementa parse-entry-notes.mjs.
Detecta:
(Note/Nota: (Note: (Nota: 
Tipos permitidos:
usage grammar spelling diacritic regional source warning cross_reference visual_status unknown 
Conserva texto bilingüe completo.
No corrijas redacción.
31. Referencias internas
Implementa parse-entry-cross-references.mjs.
Detecta:
See also Ver también see/ver See entry below Ver entrada debajo irregularity of irregularidad de 
No resuelvas un destino si hay ambigüedad.
Usa:
resolved unresolved ambiguous not_applicable 
32. Parseo de apéndice
Implementa parse-appendix.mjs.
Entrada:
pages/page_0296.json ... pages/page_0330.json 
Salidas:
appendix/sections.jsonl appendix/verb_tables.jsonl appendix/grammar_rules.jsonl appendix/phrases.jsonl 
Clasifica por encabezado visible.
Si una página contiene varias secciones, conserva secondary_sections.
33. Tablas verbales
Implementa parse-verb-tables.mjs.
Para cada fila, conserva:
section_uid table_uid row_uid source_page source_blocks columns raw_text verification_status extraction_confidence 
Usa coordenadas para columnas.
No transformes tablas en párrafos si la estructura tabular es visible.
34. Reglas gramaticales
Implementa parse-grammar-rules.mjs.
Cada regla debe conservar:
object_type uid section heading rule_text examples source_page source_blocks raw_text verification_status extraction_confidence 
No resumas reglas.
No corrijas reglas.
35. Frases, expresiones y saludos
Implementa parse-phrases.mjs.
Cada frase debe conservar:
phrase_text normalized_phrase english_text spanish_text category source_page source_blocks raw_text confidence verification_status 
Si no puedes separar idiomas, conserva raw_text y marca revisión.
36. Cobertura
Implementa assign-coverage.mjs.
Cada página debe cumplir:
raw_chars = assigned_chars + unassigned_chars 
assigned_chars debe contar texto asignado a bloques y objetos derivados.
unassigned_chars debe ser 0 para cierre final.
Si unassigned_chars > 0, escribe en:
review/coverage_gaps.jsonl 
Bloquea cierre final.
37. Revisión
Genera siempre estos archivos aunque estén vacíos:
review/needs_review.jsonl review/rejected_blocks.jsonl review/coverage_gaps.jsonl 
Cada línea de revisión debe incluir:
object_type uid source_page source_blocks raw_text reason suggested_resolution blocking 
No uses revisión como excusa para perder contenido.
38. Checksums
Implementa checksum.mjs.
Genera:
intermediate/checksums.json 
Incluye SHA-256 de:
PDF fuente manifest.json cada page_NNNN.json cada JSONL de catálogo cada JSONL de diccionario cada JSONL de apéndice cada JSONL de revisión cada reporte 
Ordena claves alfabéticamente.
Usa saltos de línea estables.
39. Validación JSON
Implementa validadores de esquema en módulos .mjs.
No dependas de validación manual informal.
Valida:
tipos de campos campos obligatorios valores permitidos rangos numéricos arrays nulos permitidos estructura de cobertura estructura de bloques estructura de objetos derivados 
Falla ante campos críticos faltantes.
40. Validación JSONL
Cada línea JSONL debe:
ser JSON válido ser objeto tener object_type tener uid si aplica tener source_page si aplica tener raw_text si aplica tener verification_status si aplica 
No permitas líneas vacías intermedias.
Permite archivo vacío solo en revisión si no hay incidencias.
41. Validación de UID
Implementa validate-uids.mjs.
Debe verificar:
unicidad global patrón permitido ausencia de UUID aleatorio ausencia de timestamp consistencia con source_page 
Falla ante duplicados.
42. Validación de trazabilidad
Implementa validate-traceability.mjs.
Debe verificar:
cada source_block existe cada bloque pertenece a la página declarada cada objeto derivado aparece en derived_objects de la página cada entrada referencia páginas existentes cada revisión referencia bloques existentes cuando sea posible 
Falla ante referencias rotas.
43. Validación de normalización
Implementa validate-normalization.mjs.
Debe verificar:
campos canónicos preservan diacríticos campos normalizados aplican regla auxiliar normalización NFC espacios colapsados solo en campos normalizados headword no se sustituye por normalized_headword phrase_text no se sustituye por normalized_phrase 
Falla ante pérdida de circunflejos en campos canónicos.
44. Validación de estado de revisión
Implementa validate-review-state.mjs.
Debe fallar si:
existe coverage_gaps.jsonl con líneas bloqueantes existe needs_review.jsonl con blocking = true durante cierre final existe página en estado blocked existe página en estado needs_review durante cierre final 
Debe permitir revisiones no bloqueantes si están justificadas.
45. Validación global
Implementa validate-transcription.mjs.
Debe ejecutar todas las validaciones en orden:
1. validate-env 2. validate-manifest 3. validate-pages 4. validate-json 5. validate-jsonl 6. validate-uids 7. validate-traceability 8. validate-coverage 9. validate-normalization 10. validate-checksums 11. validate-review-state 
Comando obligatorio:
npm run validate:transcription 
Código 0 significa válido.
Código distinto de 0 significa bloqueado.
46. Reportes
Genera reportes en:
tools/dictionary-pipeline/reports/ 
Reportes obligatorios:
page_extraction_report.md coverage_report.md transcription_report.md 
page_extraction_report.md debe incluir:
conteo de páginas conteo de bloques por página sección detectada páginas con elementos visuales páginas con tablas páginas con texto de color 
coverage_report.md debe incluir:
raw_chars por página assigned_chars por página unassigned_chars por página estado por página 
transcription_report.md debe incluir:
total de entradas total de abreviaturas total de referencias total de libros bíblicos total de frases total de reglas total de tablas total de revisiones estado final 
No incluyas contenido inventado en reportes.
47. Convenciones de orden
Ordena siempre:
páginas por número ascendente bloques por reading_order ascendente catálogos por source_page, code entradas por source_page, reading_order, headword, uid ejemplos por example_order notas por note_order frases por source_page, reading_order, uid checksums por ruta alfabética 
No dependas del orden devuelto por fs.readdir.
48. Convenciones de estado
Estados permitidos:
parsed verified needs_review blocked rejected 
No uses otros estados.
Solo marca verified después de validación específica.
No marques completed si hay revisiones bloqueantes.
49. Manejo de errores
Cada error debe producir:
código interno mensaje legible ruta afectada tarea afectada si aplica token bloqueante si aplica 
Tokens permitidos:
[TASK_BLOCKED: <ID>: <REASON>] [PAGE_BLOCKED: <PAGE_NUMBER>: <REASON>] [TRANSCRIPTION_BLOCKED: <REASON>] 
No continúes después de error bloqueante.
50. Pruebas
Usa node --test.
No uses frameworks que requieran servicios externos.
Cada módulo crítico debe tener prueba.
Áreas mínimas:
entorno carga de PDF conteo de páginas normalización generación de uid escritura atómica clasificación de bloques parseo de abreviaturas parseo de referencias parseo de libros bíblicos parseo de entradas parseo de ejemplos parseo de notas parseo de apéndices validación de cobertura validación de checksums validación global 
Comando:
npm test 
51. Cierre técnico
La transcripción solo puede cerrarse si pasan:
npm test npm run validate:transcription 
Después del cierre, actualiza:
manifest.status = completed 
Luego recalcula:
checksums.json reports/transcription_report.md 
Finalmente emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
Si cualquier paso falla, emite:
[TRANSCRIPTION_BLOCKED: PLAN_VALIDATION_FAILED]