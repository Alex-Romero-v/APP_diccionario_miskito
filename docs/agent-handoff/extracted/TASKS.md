# TASKS.md ## 1. Contrato de ejecución de tareas Ejecuta una sola tarea por ciclo. Antes de modificar archivos, lee en este orden: 1. `CONSTITUTION.md` 2. `SPEC.md` 3. `PLAN.md` 4. `TASKS.md` Si `ORCHESTRATION.md` existe, léelo después de `TASKS.md`. No uses Python. No uses red. No uses servicios remotos. No uses OCR remoto. No generes bases de datos. No generes código de consumo final. No modifiques el PDF fuente. No transcribas contenido fuera de `tools/dictionary-pipeline/intermediate/**`. No agregues aquí contenido de orquestación ni manual. Usa siempre Node.js, módulos ESM y pruebas con `node --test`. ## 2. Estados permitidos Usa solo estos estados en esta cola: ```text [ ] pendiente [x] completada 
No marques una tarea como [x] hasta que su comando exacto de validación termine con código 0.
Si falla una precondición, una prueba, una validación o una restricción de alcance, deja la tarea en [ ] y emite:
[TASK_BLOCKED: <ID>: <REASON>] 
Si la tarea termina correctamente, márcala como [x] y emite:
[TASK_COMPLETE: <ID>] 
3. Rutas obligatorias
Usa como PDF fuente único:
tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf 
Genera salidas intermedias únicamente bajo:
tools/dictionary-pipeline/intermediate/ 
Genera reportes únicamente bajo:
tools/dictionary-pipeline/reports/ 
Permite código y pruebas únicamente bajo:
tools/dictionary-pipeline/src/ tools/dictionary-pipeline/tests/ 
Permite configuración mínima en:
package.json package-lock.json 
4. Reglas TDD obligatorias
Para cada tarea de implementación:
• Escribe o actualiza primero la prueba indicada.
• Ejecuta la prueba y confirma que falla por la funcionalidad faltante.
• Implementa solo el alcance permitido.
• Ejecuta el comando exacto de validación.
• Marca [x] solo si el comando termina con código 0.
• Emite el token de cierre.
No omitas la prueba previa. No cambies pruebas no relacionadas. No amplíes el alcance para “aprovechar” la tarea.
5. Cola atómica
[x] T001 — Inicializa contrato Node.js y scripts mínimos
Objetivo
Crea la configuración mínima de Node.js para ejecutar el pipeline local de transcripción con comandos deterministas.
Precondiciones
• Verifica que exista node.
• Verifica que exista npm.
• Verifica que no se requiera instalar dependencias sin package-lock.json.
• Verifica que el PDF fuente exista en la ruta obligatoria.
Archivos permitidos
package.json package-lock.json tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/tests/env.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea tools/dictionary-pipeline/tests/env.test.mjs con pruebas que fallen si:
• package.json no declara "type": "module".
• Falta el script validate:env.
• Falta el script transcribe:init.
• Falta el script transcribe:pages.
• Falta el script transcribe:catalog.
• Falta el script transcribe:dictionary.
• Falta el script transcribe:appendix.
• Falta el script transcribe:checksums.
• Falta el script validate:transcription.
• Falta el script test.
• tools/dictionary-pipeline/src/cli.mjs no existe.
• El CLI no devuelve error controlado ante comando desconocido.
Implementación
Crea o ajusta package.json con esta estructura mínima:
{ "type": "module", "scripts": { "validate:env": "node tools/dictionary-pipeline/src/cli.mjs validate-env", "transcribe:init": "node tools/dictionary-pipeline/src/cli.mjs init", "transcribe:pages": "node tools/dictionary-pipeline/src/cli.mjs extract-pages", "transcribe:catalog": "node tools/dictionary-pipeline/src/cli.mjs parse-catalog", "transcribe:dictionary": "node tools/dictionary-pipeline/src/cli.mjs parse-dictionary", "transcribe:appendix": "node tools/dictionary-pipeline/src/cli.mjs parse-appendix", "transcribe:checksums": "node tools/dictionary-pipeline/src/cli.mjs checksums", "validate:transcription": "node tools/dictionary-pipeline/src/cli.mjs validate-transcription", "test": "node --test tools/dictionary-pipeline/tests/**/*.test.mjs" } } 
Implementa cli.mjs con despacho explícito para comandos permitidos y error determinista para comandos desconocidos.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/env.test.mjs && npm run validate:env 
Criterios de aceptación
• El comando npm run validate:env existe.
• El CLI acepta comandos permitidos.
• El CLI rechaza comandos desconocidos con código distinto de 0.
• No se crean salidas intermedias.
• No se modifica el PDF fuente.
Token de cierre
[TASK_COMPLETE: T001] 
[x] T002 — Implementa guardas de entorno, Python, red y alcance
Objetivo
Bloquea ejecuciones no deterministas o fuera de alcance antes de cualquier extracción.
Precondiciones
• T001 completada.
• package.json contiene scripts mínimos.
Archivos permitidos
tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/src/config/constants.mjs tools/dictionary-pipeline/src/config/allowed-paths.mjs tools/dictionary-pipeline/src/guards/assert-node-runtime.mjs tools/dictionary-pipeline/src/guards/assert-no-python.mjs tools/dictionary-pipeline/src/guards/assert-no-network.mjs tools/dictionary-pipeline/src/guards/assert-write-scope.mjs tools/dictionary-pipeline/tests/env.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Actualiza env.test.mjs para exigir que:
• assert-node-runtime.mjs falle si process.versions.node no existe.
• assert-no-python.mjs detecte comandos prohibidos: python, python3, pip, poetry, conda.
• assert-no-network.mjs bloquee variables o banderas internas que indiquen ejecución con red.
• assert-write-scope.mjs permita solo rutas autorizadas.
• Cualquier ruta fuera de alcance genere el token [TASK_BLOCKED: WRITE_SCOPE_VIOLATION].
Implementación
Crea constantes de ruta en constants.mjs.
Define alcance de escritura permitido:
tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** tools/dictionary-pipeline/src/** tools/dictionary-pipeline/tests/** package.json package-lock.json TASKS.md 
Bloquea cualquier otra ruta.
Asegura que todos los comandos del CLI ejecuten las guardas antes de operar.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/env.test.mjs && npm run validate:env 
Criterios de aceptación
• Cada comando del CLI ejecuta guardas antes de operar.
• Python queda bloqueado en scripts y comandos internos.
• Rutas fuera de alcance quedan bloqueadas.
• El token de violación de alcance es exacto.
Token de cierre
[TASK_COMPLETE: T002] 
[x] T003 — Implementa utilidades de E/S atómica y orden determinista
Objetivo
Garantiza escritura atómica, lectura JSON segura, JSONL estable y ordenamiento reproducible.
Precondiciones
• T002 completada.
Archivos permitidos
tools/dictionary-pipeline/src/io/ensure-directories.mjs tools/dictionary-pipeline/src/io/read-json.mjs tools/dictionary-pipeline/src/io/write-json-atomic.mjs tools/dictionary-pipeline/src/io/write-jsonl-atomic.mjs tools/dictionary-pipeline/src/io/list-files-deterministic.mjs tools/dictionary-pipeline/src/io/checksum.mjs tools/dictionary-pipeline/tests/io.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea io.test.mjs para exigir:
• Escritura JSON con <target>.tmp y renombrado final.
• Eliminación de temporal si falla la serialización.
• JSON con salto de línea final estable.
• JSONL con una línea por objeto.
• Rechazo de líneas JSONL vacías intermedias.
• Orden lexicográfico estable de archivos.
• SHA-256 reproducible para el mismo contenido.
Implementación
Implementa:
• ensure-directories.mjs
• read-json.mjs
• write-json-atomic.mjs
• write-jsonl-atomic.mjs
• list-files-deterministic.mjs
• checksum.mjs
No uses estado global mutable. No escribas archivos reales de transcripción durante la prueba; usa directorios temporales de prueba.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/io.test.mjs 
Criterios de aceptación
• Ningún archivo parcial queda tras fallo simulado.
• La salida es idéntica en ejecuciones repetidas.
• Las rutas se validan antes de escribir.
• Las utilidades no dependen del orden de fs.readdir.
Token de cierre
[TASK_COMPLETE: T003] 
[x] T004 — Implementa carga del PDF y verificación de fuente
Objetivo
Carga el PDF fuente, calcula SHA-256 y verifica que tenga exactamente 330 páginas.
Precondiciones
• T003 completada.
• Existe package-lock.json si se requiere pdfjs-dist.
• pdfjs-dist está declarado y bloqueado antes de usarlo.
Archivos permitidos
tools/dictionary-pipeline/src/pdf/load-pdf.mjs tools/dictionary-pipeline/tests/pdf-loading.test.mjs package.json package-lock.json TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea pdf-loading.test.mjs para exigir:
• Falla si el PDF fuente no existe.
• Calcula SHA-256 con 64 caracteres hexadecimales.
• Carga el PDF localmente.
• Verifica page_count = 330.
• Falla con [TRANSCRIPTION_BLOCKED: PDF_PAGE_COUNT_MISMATCH] si el conteo no coincide.
• No modifica, copia ni renombra el PDF.
Implementación
Implementa load-pdf.mjs con retorno serializable:
{ "source_pdf_path": "", "source_pdf_sha256": "", "page_count": 330 } 
No uses red. No uses OCR. No alteres el PDF.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/pdf-loading.test.mjs 
Criterios de aceptación
• El PDF carga en modo local.
• El conteo de páginas es 330.
• El SHA-256 se calcula antes de extraer.
• Los errores son bloqueantes y tienen token.
Token de cierre
[TASK_COMPLETE: T004] 
[x] T005 — Implementa manifiesto inicial
Objetivo
Genera manifest.json antes de cualquier transcripción de páginas.
Precondiciones
• T004 completada.
• El PDF fuente carga con 330 páginas.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-manifest.mjs tools/dictionary-pipeline/src/schemas/manifest.schema.mjs tools/dictionary-pipeline/src/validate/validate-manifest.mjs tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/tests/manifest.test.mjs tools/dictionary-pipeline/intermediate/manifest.json TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/intermediate/review/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea manifest.test.mjs para exigir:
• manifest.json se crea por escritura atómica.
• schema_version = "transcription-intermediate-v1".
• source_pdf_path coincide exactamente con la ruta obligatoria.
• source_pdf_sha256 no está vacío.
• page_count = 330.
• runtime.engine = "node".
• runtime.python_allowed = false.
• runtime.network_allowed = false.
• status = "in_progress".
Implementación
Implementa parse-manifest.mjs.
Integra el comando:
npm run transcribe:init 
No generes páginas. No generes catálogos. No generes reportes.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/manifest.test.mjs && npm run transcribe:init 
Criterios de aceptación
• Existe tools/dictionary-pipeline/intermediate/manifest.json.
• El manifiesto es JSON válido.
• El estado inicial es in_progress.
• El hash del PDF está calculado.
Token de cierre
[TASK_COMPLETE: T005] 
[x] T006 — Implementa esquemas base de objetos intermedios
Objetivo
Define esquemas deterministas para páginas, entradas, catálogo, apéndice, revisión y manifiesto.
Precondiciones
• T005 completada.
Archivos permitidos
tools/dictionary-pipeline/src/schemas/page.schema.mjs tools/dictionary-pipeline/src/schemas/dictionary-entry.schema.mjs tools/dictionary-pipeline/src/schemas/catalog.schema.mjs tools/dictionary-pipeline/src/schemas/appendix.schema.mjs tools/dictionary-pipeline/src/schemas/review.schema.mjs tools/dictionary-pipeline/src/schemas/manifest.schema.mjs tools/dictionary-pipeline/tests/schema.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea schema.test.mjs para exigir campos obligatorios:
Página:
object_type uid pdf_page_number printed_page_number section secondary_sections raw_text raw_text_sha256 blocks visual_elements derived_objects coverage verification_status extraction_confidence 
Bloque:
block_id page_number text block_type bbox reading_order font_summary color_summary confidence 
Objeto derivado:
object_type uid source_page source_blocks raw_text extraction_confidence verification_status 
Implementación
Exporta validadores puros desde cada esquema.
No uses dependencias externas para validar. No aceptes campos críticos ausentes. No permitas estados fuera de:
parsed verified needs_review blocked rejected 
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/schema.test.mjs 
Criterios de aceptación
• Cada esquema rechaza objetos incompletos.
• Cada esquema acepta objetos mínimos válidos.
• Los errores incluyen ruta del campo afectado.
Token de cierre
[TASK_COMPLETE: T006] 
[x] T007 — Implementa normalización auxiliar y UID determinista
Objetivo
Genera campos normalizados sin alterar texto canónico y crea UIDs reproducibles.
Precondiciones
• T006 completada.
Archivos permitidos
tools/dictionary-pipeline/src/normalize/normalize-text.mjs tools/dictionary-pipeline/src/normalize/normalize-headword.mjs tools/dictionary-pipeline/src/normalize/normalize-phrase.mjs tools/dictionary-pipeline/src/normalize/slugify-uid.mjs tools/dictionary-pipeline/tests/normalization.test.mjs tools/dictionary-pipeline/tests/uid.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea pruebas que exijan:
• NFC en campos normalizados.
• Recorte exterior.
• Colapso de espacios internos en campos normalizados.
• Conservación intacta de raw_text.
• Conversión auxiliar solo en normalizados: 
• â -> a
• ê -> e
• î -> i
• ô -> o
• û -> u
• Â -> a
• Ê -> e
• Î -> i
• Ô -> o
• Û -> u
• UIDs sin UUID aleatorio.
• UIDs sin timestamp.
• Sufijos deterministas -002, -003 ante colisión.
Implementación
Implementa normalizadores puros.
Implementa patrones UID:
page-p0001 block-p0010-b0001 entry-p0010-b0001-abakaia abbreviation-p0005-v reference-p0006-db bible-book-p0008-blasi-sturka phrase-p0328-b0001-pain-was review-p0010-b0007 
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/normalization.test.mjs tools/dictionary-pipeline/tests/uid.test.mjs 
Criterios de aceptación
• Ningún campo canónico pierde circunflejos.
• Los campos normalizados son reproducibles.
• Los UIDs son estables entre ejecuciones.
Token de cierre
[TASK_COMPLETE: T007] 
[x] T008 — Implementa extracción textual por página
Objetivo
Extrae texto nativo del PDF por página con posiciones y metadatos de fuente.
Precondiciones
• T007 completada.
• El PDF carga con 330 páginas.
Archivos permitidos
tools/dictionary-pipeline/src/pdf/extract-page-text.mjs tools/dictionary-pipeline/tests/page-text-extraction.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea page-text-extraction.test.mjs para exigir:
• Extracción con disableNormalization = true.
• Extracción con includeMarkedContent = true.
• Conservación de orden original de items.
• Conservación de str, transformaciones, ancho, alto, fuente y coordenadas.
• Falla bloqueante si una página sin texto requiere revisión.
• No usa OCR.
Implementación
Implementa extract-page-text.mjs.
Devuelve por página:
{ "page_number": 1, "items": [], "raw_text": "", "raw_text_sha256": "" } 
No clasifiques bloques en esta tarea. No escribas archivos de página en esta tarea.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/page-text-extraction.test.mjs 
Criterios de aceptación
• La página 1 devuelve texto visible.
• La página 10 devuelve texto del diccionario principal.
• El texto conserva diacríticos.
• La extracción es repetible.
Token de cierre
[TASK_COMPLETE: T008] 
[x] T009 — Implementa layout, líneas y evidencia visual
Objetivo
Construye líneas por coordenadas y registra elementos visuales relevantes por página.
Precondiciones
• T008 completada.
Archivos permitidos
tools/dictionary-pipeline/src/pdf/extract-page-layout.mjs tools/dictionary-pipeline/src/pdf/extract-page-visuals.mjs tools/dictionary-pipeline/src/block/build-lines.mjs tools/dictionary-pipeline/tests/layout.test.mjs tools/dictionary-pipeline/tests/visuals.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea pruebas que exijan:
• Agrupación estable por coordenada vertical.
• Orden descendente por y.
• Orden ascendente por x dentro de línea.
• Cálculo de bbox.
• reading_order consecutivo.
• Registro de imágenes.
• Registro de tablas detectables.
• Registro de texto pequeño.
• Registro de color cuando esté disponible.
• Descripción neutral cuando no pueda identificarse el elemento visual.
Implementación
Implementa líneas con forma:
{ "line_id": "", "text": "", "bbox": { "x": 0, "y": 0, "width": 0, "height": 0 }, "font_summary": {}, "color_summary": {}, "reading_order": 0 } 
Implementa visuales con forma:
{ "uid": "", "object_type": "visual_element", "visual_type": "image", "source_page": 1, "bbox": null, "description": "Elemento visual detectado en la página.", "associated_text": "", "requires_manual_review": false } 
No inventes contenido visual. No transcribas desde imagen si el texto ya existe como texto nativo.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/layout.test.mjs tools/dictionary-pipeline/tests/visuals.test.mjs 
Criterios de aceptación
• Las líneas se ordenan de forma reproducible.
• Las tablas de páginas 8 y 9 conservan estructura detectable.
• La portada registra al menos un elemento visual.
• Los metadatos visuales no alteran el texto canónico.
Token de cierre
[TASK_COMPLETE: T009] 
[x] T010 — Implementa construcción y clasificación de bloques
Objetivo
Convierte líneas en bloques de lectura y clasifica cada bloque con un tipo permitido.
Precondiciones
• T009 completada.
Archivos permitidos
tools/dictionary-pipeline/src/block/build-blocks.mjs tools/dictionary-pipeline/src/block/classify-block.mjs tools/dictionary-pipeline/src/block/link-continuations.mjs tools/dictionary-pipeline/tests/block-classification.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Actualiza block-classification.test.mjs para exigir:
• No se generan bloques vacíos.
• Cada bloque tiene block_id.
• Cada bloque tiene page_number.
• Cada bloque tiene text.
• Cada bloque tiene block_type.
• Cada bloque tiene bbox.
• Cada bloque tiene reading_order.
• Cada bloque tiene font_summary.
• Cada bloque tiene color_summary.
• Cada bloque tiene confidence.
• Los tipos de bloque pertenecen al catálogo permitido.
• Los bloques de continuación pueden enlazarse con continued_from y continued_to.
Implementación
Usa solo estos tipos de bloque:
cover_title cover_subtitle cover_date index_item usage_paragraph dictionary_note abbreviation_item reference_item bible_book_row entry_candidate entry_continuation example note cross_reference appendix_heading appendix_paragraph verb_table_row grammar_rule phrase table_header table_row page_number visual_caption unclassified 
Si un bloque no se clasifica con seguridad, usa unclassified y prepara registro de revisión en una tarea posterior.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/block-classification.test.mjs 
Criterios de aceptación
• Cada bloque visible queda clasificado.
• No se pierde texto decorativo si es textual.
• Las continuaciones entre páginas quedan representables.
• No se usa una regla única para detectar entradas.
Token de cierre
[TASK_COMPLETE: T010] 
[x] T011 — Implementa clasificación de secciones por página
Objetivo
Asigna sección primaria y secciones secundarias a cada página usando rango y encabezado visible.
Precondiciones
• T010 completada.
Archivos permitidos
tools/dictionary-pipeline/src/config/sections.mjs tools/dictionary-pipeline/src/pdf/classify-page-section.mjs tools/dictionary-pipeline/tests/section-classification.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea section-classification.test.mjs para exigir:
• Página 1: cover.
• Página 2: index.
• Página 3: usage.
• Página 4: dictionary_notes.
• Página 5: abbreviations.
• Páginas 6-7: references.
• Páginas 8-9: bible_books.
• Páginas 10-295: dictionary, salvo evidencia visible más específica.
• Páginas 296-330: sección de apéndice según encabezado visible.
• Si rango y encabezado entran en conflicto, prioriza encabezado visible.
• Si no hay evidencia suficiente, usa unknown.
Implementación
Usa solo secciones permitidas:
cover index usage dictionary_notes abbreviations references bible_books dictionary appendix_overview verb_overview verb_tables verb_tense_guide regular_verbs irregular_verbs nouns verb_to_noun construct_forms comparisons numbers_years pronunciation short_forms grammar_rules phrases unknown 
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/section-classification.test.mjs 
Criterios de aceptación
• Todas las páginas tienen una sección primaria.
• Las páginas con múltiples secciones tienen secondary_sections.
• La clasificación es reproducible.
Token de cierre
[TASK_COMPLETE: T011] 
[x] T012 — Implementa cobertura inicial y archivos de revisión
Objetivo
Calcula cobertura por página y crea estructuras de revisión sin perder contenido.
Precondiciones
• T011 completada.
Archivos permitidos
tools/dictionary-pipeline/src/block/assign-coverage.mjs tools/dictionary-pipeline/src/validate/validate-coverage.mjs tools/dictionary-pipeline/src/validate/validate-review-state.mjs tools/dictionary-pipeline/tests/coverage.test.mjs tools/dictionary-pipeline/tests/review-state.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea pruebas que exijan:
• raw_chars = assigned_chars + unassigned_chars.
• unassigned_chars nunca es negativo.
• Si unassigned_chars > 0, se debe crear registro para coverage_gaps.jsonl.
• Si un bloque es unclassified, se debe crear registro para needs_review.jsonl.
• Las revisiones tienen: 
• object_type
• uid
• source_page
• source_blocks
• raw_text
• reason
• suggested_resolution
• blocking
Implementación
Implementa cobertura sin aproximaciones silenciosas.
No marques páginas como verified en esta tarea. No elimines texto no asignado. No uses revisión para ocultar pérdida de datos.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/coverage.test.mjs tools/dictionary-pipeline/tests/review-state.test.mjs 
Criterios de aceptación
• La cobertura es aritméticamente verificable.
• Cada brecha produce revisión trazable.
• Las revisiones bloqueantes impiden cierre final.
Token de cierre
[TASK_COMPLETE: T012] 
[x] T013 — Genera los 330 archivos de página
Objetivo
Ejecuta extracción base y escribe un archivo JSON por cada página del PDF.
Precondiciones
• T012 completada.
• manifest.json existe.
• El PDF fuente tiene 330 páginas.
Archivos permitidos
tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/src/parse/parse-index.mjs tools/dictionary-pipeline/src/parse/parse-usage.mjs tools/dictionary-pipeline/src/parse/parse-dictionary-notes.mjs tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/review/needs_review.jsonl tools/dictionary-pipeline/intermediate/review/rejected_blocks.jsonl tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl tools/dictionary-pipeline/tests/page-extraction.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea page-extraction.test.mjs para exigir:
• Existen exactamente 330 archivos page_NNNN.json.
• El primer archivo es page_0001.json.
• El último archivo es page_0330.json.
• Cada página tiene object_type = "page".
• Cada página tiene uid = "page-pNNNN".
• Cada página tiene raw_text_sha256.
• Cada página tiene blocks.
• Cada bloque tiene trazabilidad.
• Página 1 contiene sección cover y evidencia visual.
• Páginas 8 y 9 contienen evidencia de tabla.
• Ninguna página se marca verified durante extracción base.
Implementación
Integra extract-pages en el CLI.
Cada archivo debe tener forma mínima:
{ "object_type": "page", "uid": "page-p0001", "pdf_page_number": 1, "printed_page_number": null, "section": "cover", "secondary_sections": [], "raw_text": "", "raw_text_sha256": "", "blocks": [], "visual_elements": [], "derived_objects": [], "coverage": { "raw_chars": 0, "assigned_chars": 0, "unassigned_chars": 0 }, "verification_status": "parsed", "extraction_confidence": 1.0 } 
Crea siempre estos archivos aunque estén vacíos:
tools/dictionary-pipeline/intermediate/review/needs_review.jsonl tools/dictionary-pipeline/intermediate/review/rejected_blocks.jsonl tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl 
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/page-extraction.test.mjs && npm run transcribe:pages 
Criterios de aceptación
• Hay exactamente 330 páginas JSON.
• Cada página puede reconstruirse desde raw_text y blocks.
• La portada registra elemento visual.
• Las tablas visibles quedan registradas como evidencia visual o bloques tabulares.
• No hay pérdida silenciosa de caracteres.
Token de cierre
[TASK_COMPLETE: T013] 
[x] T014 — Implementa parseo de abreviaturas
Objetivo
Transcribe la sección de abreviaturas desde la página 5 hacia JSONL de catálogo.
Precondiciones
• T013 completada.
• Existe tools/dictionary-pipeline/intermediate/pages/page_0005.json.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-abbreviations.mjs tools/dictionary-pipeline/src/schemas/catalog.schema.mjs tools/dictionary-pipeline/tests/catalog-parsing.test.mjs tools/dictionary-pipeline/intermediate/catalog/abbreviations.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Actualiza catalog-parsing.test.mjs para exigir:
• Se lee solo page_0005.json.
• Se detectan códigos simples: adj, adv, conj, fut, pres, pron.
• Se preservan códigos con signos: a/t:, Alt:, fs/ea:, Lit:.
• Cada línea JSONL es JSON válido.
• Cada objeto tiene: 
• object_type = "abbreviation"
• uid
• code
• raw_text
• source_page = 5
• source_blocks
• verification_status
• extraction_confidence
• No se eliminan barras ni dos puntos.
Implementación
Implementa detección por línea:
<code> <description> 
Conserva descripción bilingüe completa. No traduzcas. No corrijas. No dividas una abreviatura si no hay evidencia textual.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/catalog-parsing.test.mjs && npm run transcribe:catalog 
Criterios de aceptación
• abbreviations.jsonl existe.
• No contiene líneas vacías intermedias.
• Todos los objetos tienen trazabilidad.
• Códigos con puntuación se conservan intactos.
Token de cierre
[TASK_COMPLETE: T014] 
[x] T015 — Implementa parseo de referencias
Objetivo
Transcribe las referencias de páginas 6 y 7 hacia JSONL de catálogo.
Precondiciones
• T014 completada.
• Existen page_0006.json y page_0007.json.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-references.mjs tools/dictionary-pipeline/tests/references-parsing.test.mjs tools/dictionary-pipeline/intermediate/catalog/references.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea references-parsing.test.mjs para exigir:
• Se leen solo páginas 6 y 7.
• Se detecta nuevo registro con patrón <code> -.
• Se permiten códigos con letras, números y guion bajo.
• Se unen líneas de continuación hasta el siguiente código.
• Se conserva raw_text bilingüe completo.
• Referencias largas no se dividen sin nuevo código visible.
• Cada objeto tiene trazabilidad a bloque y página.
Implementación
Implementa parse-references.mjs.
Campos mínimos:
object_type uid code raw_text source_page source_blocks verification_status extraction_confidence 
Si una referencia cruza página, conserva todos los bloques y páginas involucradas en metadatos auxiliares.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/references-parsing.test.mjs && npm run transcribe:catalog 
Criterios de aceptación
• references.jsonl existe.
• Cada referencia tiene código determinista.
• Las líneas de continuación quedan unidas.
• No se pierde texto bilingüe.
Token de cierre
[TASK_COMPLETE: T015] 
[x] T016 — Implementa parseo de libros bíblicos
Objetivo
Transcribe las tablas de páginas 8 y 9 hacia JSONL de catálogo.
Precondiciones
• T015 completada.
• Existen page_0008.json y page_0009.json.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-bible-books.mjs tools/dictionary-pipeline/tests/bible-books-parsing.test.mjs tools/dictionary-pipeline/intermediate/catalog/bible_books.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea bible-books-parsing.test.mjs para exigir:
• Se usan páginas 8 y 9.
• Se detectan columnas: 
• miskito
• short_code
• english
• spanish
• Página 8 se marca como hebrew_scriptures.
• Página 9 se marca como greek_scriptures.
• Las filas partidas se conservan sin descarte.
• Si una celda es ambigua, se genera revisión con blocking = true.
• Cada fila tiene UID determinista.
Implementación
Usa coordenadas de columna cuando estén disponibles. No dependas solo de espacios. Conserva raw_text completo de cada fila.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/bible-books-parsing.test.mjs && npm run transcribe:catalog 
Criterios de aceptación
• bible_books.jsonl existe.
• Cada fila tiene las cuatro columnas esperadas o revisión bloqueante.
• Las páginas 8 y 9 quedan trazadas.
• No se pierde contenido de tabla.
Token de cierre
[TASK_COMPLETE: T016] 
[x] T017 — Implementa modelo base de entrada de diccionario
Objetivo
Define la estructura de entrada del diccionario principal antes de dividir traducciones, variantes, ejemplos y notas.
Precondiciones
• T016 completada.
• Existen páginas page_0010.json a page_0295.json.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-entry.mjs tools/dictionary-pipeline/src/parse/parse-dictionary-pages.mjs tools/dictionary-pipeline/src/schemas/dictionary-entry.schema.mjs tools/dictionary-pipeline/tests/entry-parsing.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Actualiza entry-parsing.test.mjs para exigir que una entrada base tenga:
object_type uid headword normalized_headword sort_key entry_type parent_entry_uid part_of_speech raw_part_of_speech source_page source_blocks raw_text segments verification_status extraction_confidence 
Exige detección de inicio de entrada por combinación de:
• Indentación primaria.
• Lema seguido de guion largo o equivalente.
• Parte de habla entre paréntesis.
• Referencia cruzada autónoma.
• Estilo visual de entrada.
Implementación
Implementa parse-entry.mjs sin extraer todavía traducciones detalladas.
Divide cada entrada en segmentos crudos:
headword variant_segment part_of_speech_segment definition_segment example_segments note_segments reference_segments cross_reference_segments raw_text 
Si la división es incierta, conserva raw_text completo y marca revisión.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/entry-parsing.test.mjs 
Criterios de aceptación
• Se detectan entradas simples.
• Se detectan entradas con variantes.
• Se detectan entradas con ejemplos.
• Se detectan continuaciones.
• No se pierde ningún segmento crudo.
Token de cierre
[TASK_COMPLETE: T017] 
[x] T018 — Implementa parseo de traducciones
Objetivo
Divide definiciones bilingües sin alterar el texto original.
Precondiciones
• T017 completada.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-entry-translations.mjs tools/dictionary-pipeline/tests/entry-translations.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea entry-translations.test.mjs para exigir:
• Texto antes del separador bilingüe principal / después del guion se asigna a inglés.
• Texto después del separador bilingüe principal / después del guion se asigna a español.
• Separadores dentro de abreviaturas no dividen traducciones.
• Separadores dentro de códigos no dividen traducciones.
• Separadores dentro de expresiones internas no dividen traducciones.
• Si la división es dudosa, se conserva raw_text y se marca revisión.
• No se completa traducción faltante.
Implementación
Implementa salida de traducciones como arreglo ordenado:
{ "english_text": "", "spanish_text": "", "translation_order": 1, "is_literal": false, "note": null, "raw_text": "" } 
No traduzcas. No corrijas. No reordenes definiciones.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/entry-translations.test.mjs 
Criterios de aceptación
• Traducciones simples se dividen correctamente.
• Traducciones dudosas se conservan completas.
• El texto canónico permanece intacto.
Token de cierre
[TASK_COMPLETE: T018] 
[x] T019 — Implementa parseo de variantes
Objetivo
Extrae variantes declaradas sin convertirlas indebidamente en entradas independientes.
Precondiciones
• T018 completada.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-entry-variants.mjs tools/dictionary-pipeline/tests/entry-variants.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea entry-variants.test.mjs para exigir detección de:
a/t: Alt: fs/ea: former spelling also spelled alternatively formas entre paréntesis junto al lema formas sin diacríticos en texto pequeño formas constructivas declaradas formas irregulares declaradas 
Exige tipos permitidos:
also_spelled alternative former_spelling diacriticless construct irregular parenthetical related unknown 
Implementación
Cada variante debe tener:
variant_text normalized_variant variant_type note raw_text source_blocks 
No conviertas variantes en lemas independientes salvo evidencia clara. Si hay duda, usa variant_type = "unknown" y revisión.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/entry-variants.test.mjs 
Criterios de aceptación
• Variantes con signos se conservan.
• Variantes sin diacríticos se guardan como auxiliares.
• No se altera el lema canónico.
Token de cierre
[TASK_COMPLETE: T019] 
[x] T020 — Implementa parseo de ejemplos, notas y referencias cruzadas
Objetivo
Extrae ejemplos, notas y vínculos internos desde cada entrada del diccionario.
Precondiciones
• T019 completada.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-entry-examples.mjs tools/dictionary-pipeline/src/parse/parse-entry-notes.mjs tools/dictionary-pipeline/src/parse/parse-entry-cross-references.mjs tools/dictionary-pipeline/tests/entry-examples.test.mjs tools/dictionary-pipeline/tests/entry-notes.test.mjs tools/dictionary-pipeline/tests/entry-cross-references.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea pruebas para exigir detección de ejemplos:
(Ex/Ej: (ExEj: (Ex/Ej( (ExEj( Ex: Ej: 
Cada ejemplo debe conservar:
miskito_text english_text spanish_text source_code source_detail raw_reference_text raw_text source_blocks example_order 
Crea pruebas para notas:
(Note/Nota: (Note: (Nota: 
Usa tipos permitidos:
usage grammar spelling diacritic regional source warning cross_reference visual_status unknown 
Crea pruebas para referencias cruzadas:
See also Ver también see/ver See entry below Ver entrada debajo irregularity of irregularidad de 
Usa estados de resolución:
resolved unresolved ambiguous not_applicable 
Implementación
No descartes ejemplos incompletos. No completes traducciones faltantes. No resuelvas destinos ambiguos. Conserva texto bilingüe completo en notas.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/entry-examples.test.mjs tools/dictionary-pipeline/tests/entry-notes.test.mjs tools/dictionary-pipeline/tests/entry-cross-references.test.mjs 
Criterios de aceptación
• Ejemplos quedan ordenados por example_order.
• Notas quedan ordenadas por note_order.
• Referencias ambiguas no se fuerzan.
• Todo objeto derivado mantiene source_blocks.
Token de cierre
[TASK_COMPLETE: T020] 
[x] T021 — Genera particiones JSONL del diccionario principal
Objetivo
Transcribe páginas 10 a 295 hacia archivos JSONL particionados.
Precondiciones
• T020 completada.
• Existen páginas page_0010.json a page_0295.json.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-dictionary-pages.mjs tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/review/needs_review.jsonl tools/dictionary-pipeline/intermediate/review/rejected_blocks.jsonl tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl tools/dictionary-pipeline/tests/dictionary-partitions.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea dictionary-partitions.test.mjs para exigir:
• Se leen solo páginas 10 a 295.
• Se generan particiones deterministas: 
• entries_pages_0010_0025.jsonl
• entries_pages_0026_0050.jsonl
• entries_pages_0051_0075.jsonl
• entries_pages_0076_0100.jsonl
• entries_pages_0101_0125.jsonl
• entries_pages_0126_0150.jsonl
• entries_pages_0151_0175.jsonl
• entries_pages_0176_0200.jsonl
• entries_pages_0201_0225.jsonl
• entries_pages_0226_0250.jsonl
• entries_pages_0251_0275.jsonl
• entries_pages_0276_0295.jsonl
• Cada línea es JSON válido.
• Cada entrada tiene UID único.
• Cada entrada referencia páginas y bloques existentes.
• El orden es: 
• source_page ASC
• reading_order ASC
• headword ASC
• uid ASC
Implementación
Integra el comando:
npm run transcribe:dictionary 
No dependas del orden del sistema de archivos. No generes un único JSON gigante. No pierdas entradas partidas entre páginas.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/dictionary-partitions.test.mjs && npm run transcribe:dictionary 
Criterios de aceptación
• Existen todas las particiones esperadas.
• No hay líneas JSONL vacías intermedias.
• Cada entrada tiene trazabilidad.
• Las entradas dudosas quedan en revisión sin pérdida de texto.
Token de cierre
[TASK_COMPLETE: T021] 
[x] T022 — Implementa parseo general del apéndice
Objetivo
Clasifica y transcribe páginas 296 a 330 como secciones de apéndice.
Precondiciones
• T021 completada.
• Existen páginas page_0296.json a page_0330.json.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-appendix.mjs tools/dictionary-pipeline/tests/appendix-parsing.test.mjs tools/dictionary-pipeline/intermediate/appendix/sections.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea appendix-parsing.test.mjs para exigir:
• Se leen solo páginas 296 a 330.
• Cada sección tiene: 
• object_type
• uid
• section
• heading
• source_page
• source_blocks
• raw_text
• verification_status
• extraction_confidence
• Páginas con múltiples secciones conservan secondary_sections.
• Encabezados visibles priorizan sobre rangos.
Implementación
Genera sections.jsonl.
No resumas. No corrijas. No descartes tablas, reglas ni frases; déjalas trazadas para tareas específicas.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/appendix-parsing.test.mjs 
Criterios de aceptación
• sections.jsonl existe.
• Cada sección apunta a bloques existentes.
• Las páginas finales 329 y 330 se clasifican por extracción verificable.
Token de cierre
[TASK_COMPLETE: T022] 
[ ] [x]  Implementa parseo de tablas verbales
Objetivo
Transcribe tablas verbales preservando filas, columnas y trazabilidad visual.
Precondiciones
• T022 completada.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-verb-tables.mjs tools/dictionary-pipeline/tests/verb-tables.test.mjs tools/dictionary-pipeline/intermediate/appendix/verb_tables.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea verb-tables.test.mjs para exigir:
• Cada tabla tiene table_uid.
• Cada fila tiene row_uid.
• Cada fila conserva columns.
• Cada fila conserva raw_text.
• Cada fila conserva source_page.
• Cada fila conserva source_blocks.
• Las coordenadas se usan cuando están disponibles.
• Si una fila no puede separarse en columnas, se conserva completa y se marca revisión.
Implementación
No transformes tablas visibles en párrafos. No reordenes columnas sin evidencia. No completes celdas faltantes.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/verb-tables.test.mjs 
Criterios de aceptación
• verb_tables.jsonl existe.
• Filas y columnas son trazables.
• Las filas dudosas se conservan completas.
Token de cierre
[TASK_COMPLETE: T023] 
[ ] [x]  Implementa parseo de reglas gramaticales
Objetivo
Transcribe reglas gramaticales del apéndice sin resumen ni corrección.
Precondiciones
• T023 completada.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-grammar-rules.mjs tools/dictionary-pipeline/tests/grammar-rules.test.mjs tools/dictionary-pipeline/intermediate/appendix/grammar_rules.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea grammar-rules.test.mjs para exigir que cada regla tenga:
object_type uid section heading rule_text examples source_page source_blocks raw_text verification_status extraction_confidence 
Exige que:
• Las reglas no se resuman.
• Los ejemplos internos se conserven.
• Los encabezados se conserven.
• Las reglas dudosas se marquen para revisión.
Implementación
Implementa parse-grammar-rules.mjs.
No corrijas redacción. No normalices texto canónico. No fusiones reglas si no hay evidencia.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/grammar-rules.test.mjs 
Criterios de aceptación
• grammar_rules.jsonl existe.
• Cada regla es reconstruible desde sus bloques.
• Las reglas conservan texto original.
Token de cierre
[TASK_COMPLETE: T024] 
[ ] [x]  Implementa parseo de frases, expresiones y saludos
Objetivo
Transcribe frases, expresiones y saludos desde el apéndice.
Precondiciones
• T024 completada.
Archivos permitidos
tools/dictionary-pipeline/src/parse/parse-phrases.mjs tools/dictionary-pipeline/tests/phrases.test.mjs tools/dictionary-pipeline/intermediate/appendix/phrases.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea phrases.test.mjs para exigir que cada frase tenga:
phrase_text normalized_phrase english_text spanish_text category source_page source_blocks raw_text confidence verification_status 
Exige que:
• phrase_text preserve diacríticos.
• normalized_phrase aplique normalización auxiliar.
• Si los idiomas no pueden separarse, se conserva raw_text.
• La separación dudosa genera revisión.
• Las frases se ordenan por página y orden de lectura.
Implementación
No traduzcas. No completes campos faltantes. No descartes expresiones incompletas.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/phrases.test.mjs 
Criterios de aceptación
• phrases.jsonl existe.
• Cada frase tiene trazabilidad.
• Las dudas quedan registradas sin pérdida de texto.
Token de cierre
[TASK_COMPLETE: T025] 
[ ] [x]  Ejecuta parseo completo del apéndice
Objetivo
Integra secciones, tablas, reglas y frases en el comando parse-appendix.
Precondiciones
• T025 completada.
• Existen páginas 296 a 330.
Archivos permitidos
tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/src/parse/parse-appendix.mjs tools/dictionary-pipeline/src/parse/parse-verb-tables.mjs tools/dictionary-pipeline/src/parse/parse-grammar-rules.mjs tools/dictionary-pipeline/src/parse/parse-phrases.mjs tools/dictionary-pipeline/intermediate/appendix/sections.jsonl tools/dictionary-pipeline/intermediate/appendix/verb_tables.jsonl tools/dictionary-pipeline/intermediate/appendix/grammar_rules.jsonl tools/dictionary-pipeline/intermediate/appendix/phrases.jsonl tools/dictionary-pipeline/intermediate/review/needs_review.jsonl tools/dictionary-pipeline/tests/appendix-integration.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea appendix-integration.test.mjs para exigir:
• El comando npm run transcribe:appendix genera los cuatro archivos esperados.
• Cada archivo JSONL es válido.
• Las páginas 296 a 330 quedan cubiertas por objetos derivados o revisiones.
• No se generan objetos fuera del directorio de apéndice.
• Las revisiones bloqueantes se conservan.
Implementación
Integra el comando:
npm run transcribe:appendix 
Ejecuta parseo por orden de página ascendente. No dependas del orden del sistema de archivos.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/appendix-integration.test.mjs && npm run transcribe:appendix 
Criterios de aceptación
• Los cuatro JSONL de apéndice existen.
• Cada objeto tiene trazabilidad.
• Las secciones dudosas no se pierden.
Token de cierre
[TASK_COMPLETE: T026] 
[ ] [x]  Implementa validadores JSON y JSONL
Objetivo
Valida estructura, tipos, campos obligatorios y valores permitidos de todos los archivos intermedios.
Precondiciones
• T026 completada.
Archivos permitidos
tools/dictionary-pipeline/src/validate/validate-json.mjs tools/dictionary-pipeline/src/validate/validate-jsonl.mjs tools/dictionary-pipeline/src/validate/validate-pages.mjs tools/dictionary-pipeline/tests/validation.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Actualiza validation.test.mjs para exigir:
• JSON inválido falla.
• JSONL con línea inválida falla.
• JSONL con línea vacía intermedia falla.
• Archivo vacío solo se permite para revisión sin incidencias.
• Campos críticos faltantes fallan.
• Estados no permitidos fallan.
• Tipos incorrectos fallan.
• Rutas afectadas aparecen en errores.
Implementación
Implementa validadores puros.
No dependas de validación visual. No ignores errores para continuar.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/validation.test.mjs 
Criterios de aceptación
• Los validadores detectan estructura inválida.
• Los errores son deterministas.
• No se modifica ninguna salida intermedia.
Token de cierre
[TASK_COMPLETE: T027] 
[ ] [x]  Implementa validación de UID y trazabilidad
Objetivo
Garantiza unicidad de UID y reconstrucción desde páginas y bloques fuente.
Precondiciones
• T027 completada.
Archivos permitidos
tools/dictionary-pipeline/src/validate/validate-uids.mjs tools/dictionary-pipeline/src/validate/validate-traceability.mjs tools/dictionary-pipeline/tests/uid-traceability.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea uid-traceability.test.mjs para exigir:
• UID duplicado falla.
• UID con patrón inválido falla.
• UID con timestamp falla.
• UID con forma de UUID aleatorio falla.
• source_block inexistente falla.
• Bloque de página incorrecta falla.
• Objeto derivado no listado en derived_objects falla.
• Entrada que referencia página inexistente falla.
• Revisión con bloque inexistente falla si declara bloque concreto.
Implementación
Implementa validación global de UIDs en:
pages blocks dictionary_entries catalog appendix review visual_elements 
Implementa trazabilidad desde cada objeto a página y bloque.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/uid-traceability.test.mjs 
Criterios de aceptación
• No hay duplicados silenciosos.
• Todo objeto derivado puede rastrearse a su fuente.
• Los errores indican UID y ruta afectada.
Token de cierre
[TASK_COMPLETE: T028] 
[ ] [x]  Implementa validación de normalización
Objetivo
Verifica que la normalización auxiliar no altere texto canónico.
Precondiciones
• T028 completada.
Archivos permitidos
tools/dictionary-pipeline/src/validate/validate-normalization.mjs tools/dictionary-pipeline/tests/normalization-validation.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea normalization-validation.test.mjs para exigir:
• raw_text conserva diacríticos.
• headword conserva diacríticos.
• phrase_text conserva diacríticos.
• normalized_headword aplica conversión auxiliar.
• normalized_phrase aplica conversión auxiliar.
• Campos normalizados están en NFC.
• Espacios internos se colapsan solo en campos normalizados.
• Pérdida de circunflejo en campo canónico falla.
Implementación
Implementa validate-normalization.mjs.
No modifiques datos durante validación. Solo reporta fallos.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/normalization-validation.test.mjs 
Criterios de aceptación
• La validación detecta pérdida de texto canónico.
• La validación detecta normalización auxiliar incompleta.
• Los errores indican campo y UID.
Token de cierre
[TASK_COMPLETE: T029] 
[ ] [x]  Implementa checksums intermedios
Objetivo
Genera checksums.json con SHA-256 de fuente, salidas intermedias y reportes existentes.
Precondiciones
• T029 completada.
Archivos permitidos
tools/dictionary-pipeline/src/io/checksum.mjs tools/dictionary-pipeline/src/validate/validate-checksums.mjs tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/tests/checksums.test.mjs tools/dictionary-pipeline/intermediate/checksums.json TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/intermediate/review/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea checksums.test.mjs para exigir:
• checksums.json incluye PDF fuente.
• Incluye manifest.json.
• Incluye cada page_NNNN.json.
• Incluye cada JSONL de catálogo.
• Incluye cada JSONL de diccionario.
• Incluye cada JSONL de apéndice.
• Incluye cada JSONL de revisión.
• Incluye reportes existentes.
• Las claves se ordenan alfabéticamente.
• El hash cambia si cambia el contenido.
• La validación falla si falta una ruta esperada.
Implementación
Integra el comando:
npm run transcribe:checksums 
Escribe checksums.json de forma atómica. Usa saltos de línea estables.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/checksums.test.mjs && npm run transcribe:checksums 
Criterios de aceptación
• checksums.json existe.
• Las claves están ordenadas.
• Los hashes son SHA-256 válidos.
• No se modifica ninguna salida transcrita.
Token de cierre
[TASK_COMPLETE: T030] 
[ ] [x]  Implementa reportes de extracción y cobertura
Objetivo
Genera reportes Markdown verificables sobre páginas, cobertura y estado de transcripción.
Precondiciones
• T030 completada.
Archivos permitidos
tools/dictionary-pipeline/src/report/build-page-report.mjs tools/dictionary-pipeline/src/report/build-coverage-report.mjs tools/dictionary-pipeline/src/report/build-final-report.mjs tools/dictionary-pipeline/tests/reports.test.mjs tools/dictionary-pipeline/reports/page_extraction_report.md tools/dictionary-pipeline/reports/coverage_report.md tools/dictionary-pipeline/reports/transcription_report.md TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/intermediate/review/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea reports.test.mjs para exigir:
page_extraction_report.md incluye:
conteo de páginas conteo de bloques por página sección detectada páginas con elementos visuales páginas con tablas páginas con texto de color 
coverage_report.md incluye:
raw_chars por página assigned_chars por página unassigned_chars por página estado por página 
transcription_report.md incluye:
total de entradas total de abreviaturas total de referencias total de libros bíblicos total de frases total de reglas total de tablas total de revisiones estado final 
Implementación
Genera reportes desde archivos intermedios existentes. No inventes conteos. No incluyas contenido no trazado. Ordena páginas ascendentemente.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/reports.test.mjs 
Criterios de aceptación
• Los tres reportes existen.
• Los totales derivan de archivos intermedios.
• Los reportes son reproducibles.
Token de cierre
[TASK_COMPLETE: T031] 
[ ] [x]  Implementa validación global de transcripción
Objetivo
Ejecuta todas las validaciones en orden fijo y bloquea cualquier cierre inválido.
Precondiciones
• T031 completada.
Archivos permitidos
tools/dictionary-pipeline/src/validate/validate-transcription.mjs tools/dictionary-pipeline/src/validate/validate-manifest.mjs tools/dictionary-pipeline/src/validate/validate-pages.mjs tools/dictionary-pipeline/src/validate/validate-json.mjs tools/dictionary-pipeline/src/validate/validate-jsonl.mjs tools/dictionary-pipeline/src/validate/validate-uids.mjs tools/dictionary-pipeline/src/validate/validate-traceability.mjs tools/dictionary-pipeline/src/validate/validate-coverage.mjs tools/dictionary-pipeline/src/validate/validate-normalization.mjs tools/dictionary-pipeline/src/validate/validate-checksums.mjs tools/dictionary-pipeline/src/validate/validate-review-state.mjs tools/dictionary-pipeline/src/cli.mjs tools/dictionary-pipeline/tests/final-validation.test.mjs TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
Crea final-validation.test.mjs para exigir orden exacto:
1. validate-env 2. validate-manifest 3. validate-pages 4. validate-json 5. validate-jsonl 6. validate-uids 7. validate-traceability 8. validate-coverage 9. validate-normalization 10. validate-checksums 11. validate-review-state 
Exige que falle si:
• Falta manifest.json.
• Falta una página.
• Hay JSON inválido.
• Hay UID duplicado.
• Hay trazabilidad rota.
• Hay coverage_gaps.jsonl bloqueante.
• Hay needs_review.jsonl con blocking = true.
• Hay página en blocked.
• Hay página en needs_review durante cierre final.
Implementación
Implementa validate-transcription.mjs.
Integra el comando:
npm run validate:transcription 
No modifiques archivos durante validación global.
Comando exacto de validación
node --test tools/dictionary-pipeline/tests/final-validation.test.mjs && npm run validate:transcription 
Criterios de aceptación
• La validación global termina con código 0 solo si todo es válido.
• Cualquier error bloqueante termina con código distinto de 0.
• El error incluye código, mensaje, ruta afectada y tarea si aplica.
Token de cierre
[TASK_COMPLETE: T032] 
[ ] [x]  Ejecuta prueba completa del pipeline
Objetivo
Verifica que todas las pruebas del pipeline pasen juntas sin dependencia de estado externo.
Precondiciones
• T032 completada.
• Todas las pruebas unitarias existen.
Archivos permitidos
tools/dictionary-pipeline/tests/** TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/src/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** package.json package-lock.json cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
No agregues funcionalidad nueva. Solo corrige pruebas si están mal alineadas con contratos superiores y dentro del alcance permitido.
Implementación
Ejecuta la suite completa. Si una prueba falla por código, bloquea y no modifiques en esta tarea. Si una prueba falla por aserción incorrecta, corrige solo la prueba afectada y vuelve a ejecutar.
Comando exacto de validación
npm test 
Criterios de aceptación
• Todas las pruebas terminan con código 0.
• No se modifican salidas intermedias.
• No se modifica código fuente.
Token de cierre
[TASK_COMPLETE: T033] 
[ ] [x]  Ejecuta regeneración determinista completa
Objetivo
Regenera salidas intermedias en orden fijo y verifica reproducibilidad.
Precondiciones
• T033 completada.
• Existe manifest.json.
• Existen scripts de transcripción.
Archivos permitidos
tools/dictionary-pipeline/intermediate/manifest.json tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/intermediate/review/** tools/dictionary-pipeline/intermediate/checksums.json tools/dictionary-pipeline/reports/** TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/src/** tools/dictionary-pipeline/tests/** package.json package-lock.json cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
No agregues pruebas nuevas. Usa las pruebas existentes como contrato.
Implementación
Ejecuta exactamente esta secuencia:
npm run transcribe:init npm run transcribe:pages npm run transcribe:catalog npm run transcribe:dictionary npm run transcribe:appendix npm run transcribe:checksums 
No cambies código. No cambies pruebas. No alteres el PDF.
Comando exacto de validación
npm run transcribe:init && npm run transcribe:pages && npm run transcribe:catalog && npm run transcribe:dictionary && npm run transcribe:appendix && npm run transcribe:checksums && npm run validate:transcription 
Criterios de aceptación
• Todas las salidas esperadas existen.
• La validación global pasa.
• La ejecución no requiere red.
• La ejecución no usa Python.
• La ejecución no produce archivos fuera de alcance.
Token de cierre
[TASK_COMPLETE: T034] 
[ ] [x]  Cierra manifiesto como completado
Objetivo
Cambia manifest.status a completed solo después de validación completa.
Precondiciones
• T034 completada.
• npm test pasa.
• npm run validate:transcription pasa.
• No hay revisiones bloqueantes.
• SUM(unassigned_chars) = 0.
Archivos permitidos
tools/dictionary-pipeline/intermediate/manifest.json tools/dictionary-pipeline/intermediate/checksums.json tools/dictionary-pipeline/reports/transcription_report.md TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/src/** tools/dictionary-pipeline/tests/** tools/dictionary-pipeline/intermediate/pages/** tools/dictionary-pipeline/intermediate/dictionary_entries/** tools/dictionary-pipeline/intermediate/catalog/** tools/dictionary-pipeline/intermediate/appendix/** tools/dictionary-pipeline/intermediate/review/** cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
No escribas prueba nueva. Usa la validación global existente.
Implementación
Ejecuta primero:
npm test npm run validate:transcription 
Si ambos comandos pasan, actualiza solo:
manifest.status = completed 
Luego recalcula:
tools/dictionary-pipeline/intermediate/checksums.json tools/dictionary-pipeline/reports/transcription_report.md 
No cambies contenido transcrito.
Comando exacto de validación
npm test && npm run validate:transcription && npm run transcribe:checksums && npm run validate:transcription 
Criterios de aceptación
• manifest.status = "completed".
• Checksums se recalculan.
• Reporte final refleja estado completado.
• La validación global pasa después del cambio.
• No existen revisiones bloqueantes.
• No existen brechas de cobertura.
Token de cierre
[TASK_COMPLETE: T035] 
[ ] [x]  Verifica cierre total de transcripción
Objetivo
Confirma que la transcripción completa está lista y emite token final.
Precondiciones
• T035 completada.
• manifest.status = "completed".
Archivos permitidos
TASKS.md 
Archivos prohibidos
tools/dictionary-pipeline/input/** tools/dictionary-pipeline/src/** tools/dictionary-pipeline/tests/** tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** package.json package-lock.json cualquier ruta no listada en archivos permitidos 
Prueba TDD obligatoria
No escribas pruebas. No modifiques código. No modifiques salidas.
Implementación
Ejecuta validación final sin cambios:
npm test npm run validate:transcription 
Si ambos comandos terminan con código 0, marca esta tarea como [x].
Comando exacto de validación
npm test && npm run validate:transcription 
Criterios de aceptación
• Toda la suite pasa.
• La validación global pasa.
• El manifiesto está completado.
• No hay archivos temporales *.tmp.
• No hay contenido transcrito fuera de tools/dictionary-pipeline/intermediate/**.
• No hay reportes fuera de tools/dictionary-pipeline/reports/**.
Token de cierre
[TRANSCRIPTION_COMPLETE: ALL_PAGES]
