# MANUAL_DE_USO.md ## 1. Propósito Usa este manual para operar la transcripción completa del PDF fuente hacia archivos intermedios JSON y JSONL verificables. Este manual no reemplaza los documentos de contrato. Ejecuta siempre bajo la autoridad de: ```text CONSTITUTION.md SPEC.md PLAN.md TASKS.md ORCHESTRATION.md MANUAL_DE_USO.md 
No uses este manual para generar bases de datos. No uses este manual para crear interfaces. No uses este manual para modificar el PDF fuente. No uses Python. No uses red. No uses servicios remotos.
2. Resultado esperado
Al finalizar correctamente, deben existir salidas intermedias bajo:
tools/dictionary-pipeline/intermediate/ 
Con esta estructura mínima:
tools/dictionary-pipeline/intermediate/ ├── manifest.json ├── pages/ │ ├── page_0001.json │ ├── page_0002.json │ └── page_0330.json ├── dictionary_entries/ │ ├── entries_pages_0010_0025.jsonl │ ├── entries_pages_0026_0050.jsonl │ └── entries_pages_0276_0295.jsonl ├── catalog/ │ ├── abbreviations.jsonl │ ├── references.jsonl │ └── bible_books.jsonl ├── appendix/ │ ├── sections.jsonl │ ├── verb_tables.jsonl │ ├── grammar_rules.jsonl │ └── phrases.jsonl ├── review/ │ ├── needs_review.jsonl │ ├── rejected_blocks.jsonl │ └── coverage_gaps.jsonl └── checksums.json 
También deben existir reportes bajo:
tools/dictionary-pipeline/reports/ ├── page_extraction_report.md ├── coverage_report.md └── transcription_report.md 
3. Requisitos previos
Antes de iniciar, verifica que exista Node.js:
node --version 
Verifica que exista npm:
npm --version 
Verifica que el PDF fuente exista exactamente en:
tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf 
No cambies el nombre del PDF. No muevas el PDF. No edites el PDF. No copies el PDF como parte del flujo normal.
4. Restricciones obligatorias
Durante toda la operación:
No uses Python. No uses python3. No uses pip. No uses poetry. No uses conda. No uses notebooks. No uses red. No uses OCR remoto. No uses servicios externos. No generes bases de datos. No escribas contenido transcrito fuera de intermediate. No escribas reportes fuera de reports. 
Si detectas una violación, detén la ejecución.
Usa este token:
[TRANSCRIPTION_BLOCKED: FORBIDDEN_TOOL_USAGE] 
5. Preparación inicial
Desde la raíz del proyecto, ejecuta:
node --version && npm --version 
Si ambos comandos responden correctamente, continúa.
Si falta Node.js, detén la operación y registra:
[TRANSCRIPTION_BLOCKED: NODE_UNAVAILABLE] 
Si falta npm, detén la operación y registra:
[TRANSCRIPTION_BLOCKED: NPM_UNAVAILABLE] 
6. Lectura obligatoria antes de operar
Antes de iniciar cualquier tarea, lee en este orden:
1. CONSTITUTION.md 2. SPEC.md 3. PLAN.md 4. TASKS.md 5. ORCHESTRATION.md 6. MANUAL_DE_USO.md 
No ejecutes tareas si no existen estos documentos.
Si falta alguno, detén la operación y registra:
[TRANSCRIPTION_BLOCKED: PRECONDITION_FAILED] 
7. Forma correcta de trabajar
Ejecuta una sola tarea por ciclo.
En cada ciclo:
1. Lee los documentos obligatorios. 2. Busca la primera tarea pendiente en TASKS.md. 3. Verifica que todas las tareas anteriores estén completadas. 4. Verifica las precondiciones de la tarea. 5. Verifica archivos permitidos y prohibidos. 6. Escribe o actualiza primero la prueba obligatoria. 7. Implementa solo el alcance de la tarea. 8. Ejecuta el comando exacto de validación. 9. Marca la tarea como completada solo si la validación pasa. 10. Emite el token correspondiente. 
No ejecutes tareas posteriores. No combines tareas. No modifiques archivos fuera del alcance de la tarea activa. No marques tareas manualmente sin ejecutar su validación.
8. Estados de tareas
Usa solo estos estados en TASKS.md:
[ ] pendiente [x] completada 
No uses otros estados.
No escribas comentarios adicionales junto al estado.
Ejemplo correcto:
## [x] T001 — Inicializa contrato Node.js y scripts mínimos 
Ejemplo incorrecto:
## [en progreso] T001 — Inicializa contrato Node.js y scripts mínimos 
9. Tokens operativos
Cuando una tarea termine correctamente, emite:
[TASK_COMPLETE: <ID>] 
Ejemplo:
[TASK_COMPLETE: T001] 
Cuando una tarea falle, emite:
[TASK_BLOCKED: <ID>: <REASON>] 
Ejemplo:
[TASK_BLOCKED: T004: PDF_PAGE_COUNT_MISMATCH] 
Cuando toda la transcripción esté completada, emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
10. Razones válidas de bloqueo
Usa solo estas razones:
NODE_UNAVAILABLE NPM_UNAVAILABLE DEPENDENCY_LOCK_MISSING PDF_MISSING PDF_PAGE_COUNT_MISMATCH PRECONDITION_FAILED TEST_FAILED VALIDATION_FAILED WRITE_SCOPE_VIOLATION FORBIDDEN_TOOL_USAGE FORBIDDEN_NETWORK_USAGE FORBIDDEN_PYTHON_USAGE SCHEMA_VIOLATION TRACEABILITY_VIOLATION COVERAGE_GAP BLOCKING_REVIEW_EXISTS CHECKSUM_MISMATCH TASK_ORDER_VIOLATION UNKNOWN_TASK AMBIGUOUS_STATE 
No inventes razones nuevas.
Si no sabes cuál usar, usa:
VALIDATION_FAILED 
11. Instalación de dependencias
Si el proyecto ya contiene package-lock.json, instala dependencias con:
npm ci 
No uses:
npm install 
salvo que una tarea específica autorice agregar dependencias.
Si una dependencia es necesaria pero no existe package-lock.json, bloquea:
[TRANSCRIPTION_BLOCKED: DEPENDENCY_LOCK_MISSING] 
12. Validación de entorno
Ejecuta:
npm run validate:env 
Si pasa, continúa.
Si falla, no ejecutes transcripción.
Registra:
[TRANSCRIPTION_BLOCKED: VALIDATION_FAILED] 
13. Secuencia normal de ejecución completa
Usa esta secuencia solo cuando las tareas correspondientes ya estén implementadas y permitidas por TASKS.md:
npm run transcribe:init npm run transcribe:pages npm run transcribe:catalog npm run transcribe:dictionary npm run transcribe:appendix npm run transcribe:checksums npm run validate:transcription 
No ejecutes toda la secuencia para saltarte tareas pendientes.
14. Ejecución por tarea
14.1 Inicialización
Ejecuta cuando corresponda a la tarea activa:
npm run transcribe:init 
Debe crear:
tools/dictionary-pipeline/intermediate/manifest.json 
Verifica que manifest.json declare:
schema_version = transcription-intermediate-v1 page_count = 330 runtime.engine = node runtime.python_allowed = false runtime.network_allowed = false status = in_progress 
14.2 Extracción de páginas
Ejecuta:
npm run transcribe:pages 
Debe crear exactamente 330 archivos:
tools/dictionary-pipeline/intermediate/pages/page_0001.json ... tools/dictionary-pipeline/intermediate/pages/page_0330.json 
Verifica:
Cada página tiene uid. Cada página tiene raw_text. Cada página tiene raw_text_sha256. Cada página tiene blocks. Cada bloque tiene block_id. Cada bloque tiene bbox. Cada bloque tiene reading_order. Cada bloque tiene trazabilidad. 
14.3 Catálogo
Ejecuta:
npm run transcribe:catalog 
Debe crear:
tools/dictionary-pipeline/intermediate/catalog/abbreviations.jsonl tools/dictionary-pipeline/intermediate/catalog/references.jsonl tools/dictionary-pipeline/intermediate/catalog/bible_books.jsonl 
Verifica que cada línea JSONL sea JSON válido.
14.4 Diccionario principal
Ejecuta:
npm run transcribe:dictionary 
Debe crear particiones bajo:
tools/dictionary-pipeline/intermediate/dictionary_entries/ 
Verifica que existan:
entries_pages_0010_0025.jsonl entries_pages_0026_0050.jsonl entries_pages_0051_0075.jsonl entries_pages_0076_0100.jsonl entries_pages_0101_0125.jsonl entries_pages_0126_0150.jsonl entries_pages_0151_0175.jsonl entries_pages_0176_0200.jsonl entries_pages_0201_0225.jsonl entries_pages_0226_0250.jsonl entries_pages_0251_0275.jsonl entries_pages_0276_0295.jsonl 
No aceptes un único JSON gigante.
14.5 Apéndice
Ejecuta:
npm run transcribe:appendix 
Debe crear:
tools/dictionary-pipeline/intermediate/appendix/sections.jsonl tools/dictionary-pipeline/intermediate/appendix/verb_tables.jsonl tools/dictionary-pipeline/intermediate/appendix/grammar_rules.jsonl tools/dictionary-pipeline/intermediate/appendix/phrases.jsonl 
Verifica que cada objeto conserve:
source_page source_blocks raw_text verification_status extraction_confidence 
14.6 Checksums
Ejecuta:
npm run transcribe:checksums 
Debe crear:
tools/dictionary-pipeline/intermediate/checksums.json 
Verifica que incluya hashes de:
PDF fuente manifest.json páginas JSON catálogo JSONL diccionario JSONL apéndice JSONL revisión JSONL reportes existentes 
14.7 Validación global
Ejecuta:
npm run validate:transcription 
Debe pasar solo si:
Todos los JSON son válidos. Todos los JSONL son válidos. Todos los UID son únicos. Toda trazabilidad existe. La cobertura es aritméticamente válida. No hay pérdida de texto canónico. No hay revisiones bloqueantes. No hay brechas de cobertura bloqueantes. Los checksums coinciden. 
15. Pruebas
Ejecuta la suite completa con:
npm test 
No cierres una tarea si npm test falla cuando la tarea exige suite completa.
Si una prueba falla, no marques la tarea como completada.
Usa:
[TASK_BLOCKED: <ID>: TEST_FAILED] 
16. Revisión de archivos JSON
Para cada archivo .json, verifica:
Es JSON válido. Tiene salto final de línea. No contiene comentarios. No contiene undefined. No contiene NaN. No contiene Infinity. Respeta el esquema aplicable. 
Si falla, bloquea:
[TASK_BLOCKED: <ID>: SCHEMA_VIOLATION] 
17. Revisión de archivos JSONL
Para cada archivo .jsonl, verifica:
Cada línea no vacía es JSON válido. No hay líneas vacías intermedias. Cada objeto tiene uid. Cada objeto tiene object_type. Cada objeto tiene trazabilidad. El orden es determinista. 
Los archivos de revisión pueden estar vacíos si no hay incidencias.
Si falla, bloquea:
[TASK_BLOCKED: <ID>: SCHEMA_VIOLATION] 
18. Revisión de cobertura
Verifica en cada página:
raw_chars = assigned_chars + unassigned_chars 
Para cierre final, verifica:
SUM(unassigned_chars) = 0 
Si hay caracteres no asignados, no cierres.
Usa:
[TASK_BLOCKED: <ID>: COVERAGE_GAP] 
19. Revisión de trazabilidad
Cada objeto derivado debe apuntar a páginas y bloques existentes.
Verifica:
source_page existe. source_blocks no está vacío cuando aplica. Cada bloque existe en su página. Cada UID es único. Cada página puede reconstruirse desde raw_text y blocks. Cada entrada puede reconstruirse desde source_blocks. 
Si falla, bloquea:
[TASK_BLOCKED: <ID>: TRACEABILITY_VIOLATION] 
20. Revisión de texto canónico
Verifica que el texto canónico preserve:
diacríticos circunflejos puntuación mayúsculas minúsculas saltos significativos texto pequeño texto en color notas ejemplos variantes referencias tablas 
No corrijas. No modernices. No traduzcas. No completes. No resumas. No elimines contenido por parecer repetido.
Si no puedes clasificar contenido, consérvalo en revisión.
21. Manejo de revisiones
Los archivos de revisión son:
tools/dictionary-pipeline/intermediate/review/needs_review.jsonl tools/dictionary-pipeline/intermediate/review/rejected_blocks.jsonl tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl 
Cada revisión debe tener:
object_type uid source_page source_blocks raw_text reason suggested_resolution blocking verification_status 
Si existe cualquier revisión con:
blocking = true 
no cierres la transcripción.
Usa:
[TASK_BLOCKED: <ID>: BLOCKING_REVIEW_EXISTS] 
22. Manejo de archivos temporales
Antes de cerrar una tarea, busca archivos temporales:
*.tmp 
No debe quedar ninguno.
Si existe un temporal residual, bloquea:
[TASK_BLOCKED: <ID>: VALIDATION_FAILED] 
23. Recuperación después de bloqueo
Si una tarea queda bloqueada:
1. No marques la tarea como completada. 2. No avances a la siguiente tarea. 3. Corrige solo la causa del bloqueo. 4. Relee los documentos. 5. Reejecuta la misma tarea. 6. Ejecuta el mismo comando exacto de validación. 
No saltes tareas bloqueadas.
No cambies criterios de aceptación para hacer pasar la tarea.
No edites documentos superiores salvo instrucción explícita de fase documental.
24. Regeneración completa
Cuando el pipeline esté implementado y las tareas lo permitan, ejecuta:
npm run transcribe:init && npm run transcribe:pages && npm run transcribe:catalog && npm run transcribe:dictionary && npm run transcribe:appendix && npm run transcribe:checksums && npm run validate:transcription 
Si pasa, ejecuta:
npm test 
Si ambos pasan, la transcripción es reproducible.
25. Cierre del manifiesto
Solo cambia:
manifest.status 
a:
completed 
cuando todo esto sea verdadero:
npm test pasa. npm run validate:transcription pasa. Existen exactamente 330 páginas JSON. SUM(unassigned_chars) = 0. No hay revisiones bloqueantes. No hay UID duplicados. No hay trazabilidad rota. No hay checksums inválidos. No hay archivos temporales. 
Después de cambiar el estado, recalcula checksums:
npm run transcribe:checksums 
Luego valida otra vez:
npm run validate:transcription 
26. Verificación final
Ejecuta:
npm test && npm run validate:transcription 
Confirma:
T001 a T036 están [x]. manifest.status = completed. page_count = 330. Existen 330 archivos page_NNNN.json. Existen particiones JSONL del diccionario. Existen JSONL de catálogo. Existen JSONL de apéndice. Existen archivos de revisión. No hay revisiones bloqueantes. No hay brechas de cobertura. No hay archivos *.tmp. No hay contenido transcrito fuera de intermediate. No hay reportes fuera de reports. 
Si todo pasa, registra:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
27. Comandos de diagnóstico
Usa estos comandos para diagnóstico local.
Ver entorno:
node --version && npm --version 
Ver scripts disponibles:
npm run 
Ejecutar pruebas:
npm test 
Validar entorno:
npm run validate:env 
Validar transcripción:
npm run validate:transcription 
Regenerar checksums:
npm run transcribe:checksums 
No uses comandos que invoquen Python.
28. Errores frecuentes
28.1 Falta el PDF
Síntoma:
PDF_MISSING 
Acción:
Coloca el PDF en la ruta canónica. No cambies su nombre. Reejecuta la misma tarea. 
28.2 Conteo de páginas incorrecto
Síntoma:
PDF_PAGE_COUNT_MISMATCH 
Acción:
Verifica que el PDF fuente sea el correcto. No continúes con extracción. 
28.3 Falta package-lock.json
Síntoma:
DEPENDENCY_LOCK_MISSING 
Acción:
No ejecutes dependencias no bloqueadas. Regenera el bloqueo solo si una tarea lo permite. 
28.4 Fallo de esquema
Síntoma:
SCHEMA_VIOLATION 
Acción:
Identifica el archivo y campo reportado. Corrige solo el generador o prueba de la tarea activa. Reejecuta la validación exacta. 
28.5 Trazabilidad rota
Síntoma:
TRACEABILITY_VIOLATION 
Acción:
Verifica source_page. Verifica source_blocks. Verifica que el bloque exista en la página declarada. No inventes bloques. 
28.6 Brecha de cobertura
Síntoma:
COVERAGE_GAP 
Acción:
Localiza la página afectada. Asigna el contenido a una categoría válida. Si no puede clasificarse, conserva el texto en revisión. No cierres mientras la brecha sea bloqueante. 
28.7 Revisión bloqueante
Síntoma:
BLOCKING_REVIEW_EXISTS 
Acción:
Resuelve la revisión desde la evidencia del PDF. No inventes contenido. No borres la revisión sin resolver la causa. 
29. Archivos que nunca debes modificar manualmente
No modifiques manualmente:
tools/dictionary-pipeline/input/** 
No edites manualmente contenido transcrito para hacer pasar validaciones.
Corrige el extractor, parser o validador correspondiente dentro de la tarea activa.
30. Archivos que puedes inspeccionar
Puedes leer:
CONSTITUTION.md SPEC.md PLAN.md TASKS.md ORCHESTRATION.md MANUAL_DE_USO.md tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** tools/dictionary-pipeline/tests/** tools/dictionary-pipeline/src/** 
Lee los reportes para diagnosticar, no para sustituir validaciones.
31. Regla de oro
No cierres nada por confianza.
Cierra solo por validación.
La transcripción se considera lista únicamente cuando este comando pasa:
npm test && npm run validate:transcription 
y el manifiesto declara:
status = completed 
Entonces emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES]