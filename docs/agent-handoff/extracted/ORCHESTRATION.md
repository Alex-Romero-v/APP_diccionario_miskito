# ORCHESTRATION.md ## 1. Propósito Orquesta la ejecución autónoma, secuencial, determinista y verificable de la transcripción completa del PDF fuente hacia objetos intermedios JSON y JSONL. Este documento regula el bucle operativo del agente. No transcribas contenido directamente desde este documento. No generes bases de datos. No generes código de consumo final. No modifiques el PDF fuente. No uses Python. No uses red. No uses servicios remotos. No ejecutes tareas fuera de `TASKS.md`. No redactes `MANUAL_DE_USO.md` durante esta fase. ## 2. Autoridad documental Aplica esta jerarquía estricta: ```text 1. CONSTITUTION.md 2. SPEC.md 3. PLAN.md 4. TASKS.md 5. ORCHESTRATION.md 6. MANUAL_DE_USO.md 7. TRANSCRIPTION_AGENT.txt 8. DATABASE_GENERATION.txt 9. PDF fuente 
Si existe conflicto, obedece el documento de mayor autoridad.
Si un documento heredado exige Python, ignóralo para esta fase.
Si un documento heredado exige generación de base de datos, ignóralo para esta fase.
Si un documento heredado menciona destinos finales fuera de la transcripción intermedia, trátalo como contexto no ejecutable.
3. Principios obligatorios de orquestación
Ejecuta siempre con estos principios:
atomicidad determinismo trazabilidad validación previa validación posterior escritura atómica alcance cerrado bloqueo ante duda un solo objetivo por tarea un solo estado por tarea un solo token final por ciclo 
No combines tareas. No anticipes tareas futuras. No repares errores fuera del alcance de la tarea activa. No marques una tarea como completada si no ejecutaste su comando exacto de validación. No modifiques documentos superiores para hacer pasar una tarea. No silencien fallos. No continúes después de un bloqueo.
4. Rutas canónicas
Usa esta ruta única del PDF fuente:
tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf 
Usa estas rutas de salida permitidas según tarea:
tools/dictionary-pipeline/intermediate/ tools/dictionary-pipeline/reports/ tools/dictionary-pipeline/src/ tools/dictionary-pipeline/tests/ package.json package-lock.json TASKS.md 
No escribas fuera de las rutas permitidas por la tarea activa.
Antes de escribir cualquier archivo, verifica que la ruta esté permitida explícitamente por la tarea activa.
Si una ruta no está listada en Archivos permitidos, bloquea.
Emite:
[TASK_BLOCKED: <ID>: WRITE_SCOPE_VIOLATION] 
5. Comandos base obligatorios
Verifica entorno con:
node --version npm --version 
Ejecuta pruebas con:
npm test 
Valida entorno con:
npm run validate:env 
Valida transcripción completa con:
npm run validate:transcription 
No uses:
python python3 pip poetry conda 
Si Node.js no está disponible, bloquea y emite:
[TRANSCRIPTION_BLOCKED: NODE_UNAVAILABLE] 
Si npm no está disponible, bloquea y emite:
[TRANSCRIPTION_BLOCKED: NPM_UNAVAILABLE] 
Si una dependencia requerida no está bloqueada en package-lock.json, bloquea y emite:
[TRANSCRIPTION_BLOCKED: DEPENDENCY_LOCK_MISSING] 
6. Estados permitidos
Usa únicamente estos estados en TASKS.md:
[ ] pendiente [x] completada 
No uses estados alternos.
No escribas comentarios de estado fuera del patrón de tarea.
No marques [x] sin validación exitosa.
No mantengas una tarea en ejecución entre ciclos.
Cada ciclo termina exactamente en uno de estos resultados:
[TASK_COMPLETE: <ID>] [TASK_BLOCKED: <ID>: <REASON>] [TRANSCRIPTION_COMPLETE: ALL_PAGES] 
7. Tokens permitidos
7.1 Token de tarea completada
Usa cuando la tarea activa cumple su comando exacto de validación con código 0:
[TASK_COMPLETE: <ID>] 
Ejemplo:
[TASK_COMPLETE: T014] 
7.2 Token de tarea bloqueada
Usa cuando una precondición, validación, prueba o restricción falla:
[TASK_BLOCKED: <ID>: <REASON>] 
Ejemplo:
[TASK_BLOCKED: T014: PRECONDITION_FAILED] 
7.3 Token de bloqueo global
Usa cuando el bloqueo impide seleccionar o ejecutar cualquier tarea:
[TRANSCRIPTION_BLOCKED: <REASON>] 
Ejemplo:
[TRANSCRIPTION_BLOCKED: NODE_UNAVAILABLE] 
7.4 Token final
Usa solo cuando T036 esté completada y la validación final pase:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
8. Razones de bloqueo permitidas
Usa solo estas razones normalizadas:
NODE_UNAVAILABLE NPM_UNAVAILABLE DEPENDENCY_LOCK_MISSING PDF_MISSING PDF_PAGE_COUNT_MISMATCH PRECONDITION_FAILED TEST_FAILED VALIDATION_FAILED WRITE_SCOPE_VIOLATION FORBIDDEN_TOOL_USAGE FORBIDDEN_NETWORK_USAGE FORBIDDEN_PYTHON_USAGE SCHEMA_VIOLATION TRACEABILITY_VIOLATION COVERAGE_GAP BLOCKING_REVIEW_EXISTS CHECKSUM_MISMATCH TASK_ORDER_VIOLATION UNKNOWN_TASK AMBIGUOUS_STATE 
No inventes razones nuevas.
Si el fallo no encaja, usa:
VALIDATION_FAILED 
9. Máquina de estados
Interpreta cada tarea de TASKS.md como una unidad atómica con esta máquina de estados:
PENDING -> PRECHECKING -> TEST_RED -> IMPLEMENTING -> VALIDATING -> COMPLETED PENDING -> PRECHECKING -> BLOCKED TEST_RED -> BLOCKED IMPLEMENTING -> BLOCKED VALIDATING -> BLOCKED 
No saltes estados.
No pases a COMPLETED sin ejecutar el comando exacto de validación.
No pases a IMPLEMENTING si no verificaste precondiciones.
No pases a VALIDATING si modificaste archivos fuera de alcance.
10. Algoritmo principal
Ejecuta este algoritmo en cada ciclo:
1. Lee CONSTITUTION.md. 2. Lee SPEC.md. 3. Lee PLAN.md. 4. Lee TASKS.md. 5. Lee ORCHESTRATION.md. 6. Verifica Node.js. 7. Verifica npm. 8. Verifica ausencia de uso de Python. 9. Verifica ausencia de uso de red. 10. Identifica la primera tarea con estado [ ] en TASKS.md. 11. Verifica que todas las tareas anteriores estén [x]. 12. Verifica precondiciones de la tarea activa. 13. Verifica archivos permitidos y prohibidos de la tarea activa. 14. Escribe o actualiza primero la prueba obligatoria. 15. Ejecuta la prueba específica para confirmar contrato. 16. Implementa solo el alcance de la tarea activa. 17. Ejecuta el comando exacto de validación definido en la tarea. 18. Si el comando falla, deja la tarea en [ ]. 19. Si el comando pasa, marca la tarea como [x]. 20. Emite exactamente un token final. 
Si no existe ninguna tarea pendiente, ejecuta:
npm test && npm run validate:transcription 
Si pasa y manifest.status = "completed", emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
Si falla, emite:
[TRANSCRIPTION_BLOCKED: VALIDATION_FAILED] 
11. Selección determinista de tarea
Selecciona siempre la primera tarea pendiente en orden ascendente por ID.
Orden válido:
T001 T002 T003 T004 T005 T006 T007 T008 T009 T010 T011 T012 T013 T014 T015 T016 T017 T018 T019 T020 T021 T022 T023 T024 T025 T026 T027 T028 T029 T030 T031 T032 T033 T034 T035 T036 
No ejecutes T015 si T014 no está [x].
No ejecutes una tarea posterior para desbloquear una anterior.
Si detectas una tarea posterior [x] mientras una anterior está [ ], bloquea y emite:
[TASK_BLOCKED: <ID>: TASK_ORDER_VIOLATION] 
12. Protocolo de prechequeo
Antes de cualquier tarea, ejecuta:
node --version && npm --version 
Luego verifica:
[ ] Existe CONSTITUTION.md. [ ] Existe SPEC.md. [ ] Existe PLAN.md. [ ] Existe TASKS.md. [ ] Existe ORCHESTRATION.md. [ ] La tarea activa existe en TASKS.md. [ ] La tarea activa tiene objetivo único. [ ] La tarea activa define precondiciones. [ ] La tarea activa define archivos permitidos. [ ] La tarea activa define archivos prohibidos. [ ] La tarea activa define prueba TDD obligatoria. [ ] La tarea activa define comando exacto de validación. [ ] La tarea activa define criterios de aceptación. [ ] La tarea activa define token de cierre. 
Si falta un elemento, bloquea:
[TASK_BLOCKED: <ID>: PRECONDITION_FAILED] 
13. Protocolo de verificación del PDF
Cuando la tarea requiera el PDF fuente, verifica:
[ ] El PDF existe. [ ] El PDF está en la ruta canónica. [ ] El PDF no fue modificado por la tarea activa. [ ] El conteo esperado es 330 páginas. [ ] El SHA-256 se calcula antes de extracción. 
Si el PDF no existe, emite:
[TRANSCRIPTION_BLOCKED: PDF_MISSING] 
Si el conteo de páginas no es 330, emite:
[TRANSCRIPTION_BLOCKED: PDF_PAGE_COUNT_MISMATCH] 
No copies el PDF. No renombres el PDF. No sobrescribas el PDF.
14. Protocolo TDD por tarea
Para cada tarea de implementación, ejecuta exactamente este patrón:
1. Localiza la prueba obligatoria en la tarea activa. 2. Crea o actualiza solo esa prueba. 3. Ejecuta la prueba específica. 4. Confirma que la prueba representa el contrato requerido. 5. Implementa solo los archivos permitidos. 6. Ejecuta el comando exacto de validación. 7. Marca la tarea como [x] solo si el comando termina con código 0. 8. Emite token. 
Si la prueba no puede ejecutarse por falta de infraestructura de una tarea previa, bloquea:
[TASK_BLOCKED: <ID>: PRECONDITION_FAILED] 
Si la prueba falla después de la implementación, bloquea:
[TASK_BLOCKED: <ID>: TEST_FAILED] 
Si la validación exacta falla, bloquea:
[TASK_BLOCKED: <ID>: VALIDATION_FAILED] 
15. Protocolo de modificación de archivos
Antes de modificar archivos, construye internamente esta lista:
allowed_files = archivos permitidos de la tarea activa forbidden_files = archivos prohibidos de la tarea activa planned_files = archivos que se intentan modificar 
Valida:
[ ] Cada planned_file está en allowed_files. [ ] Ningún planned_file coincide con forbidden_files. [ ] Ningún planned_file pertenece a tools/dictionary-pipeline/input/**. [ ] Ningún planned_file pertenece a rutas de fases futuras. 
Si falla, no escribas nada.
Emite:
[TASK_BLOCKED: <ID>: WRITE_SCOPE_VIOLATION] 
16. Protocolo de escritura atómica
Cuando una tarea escriba JSON, JSONL o Markdown generado, usa escritura atómica.
Secuencia obligatoria:
1. Escribe archivo temporal en la misma carpeta. 2. Valida serialización. 3. Valida salto final de línea. 4. Renombra temporal al destino final. 5. Verifica existencia del destino final. 6. Elimina temporales residuales si la operación falla. 
Convención:
<archivo>.tmp 
No dejes archivos temporales al cerrar una tarea.
Si queda un archivo temporal después de validación, bloquea:
[TASK_BLOCKED: <ID>: VALIDATION_FAILED] 
17. Protocolo JSON
Todo JSON generado debe cumplir:
UTF-8 NFC cuando aplique indentación estable de 2 espacios orden determinista de claves cuando sea posible salto final de línea sin comentarios sin valores undefined sin NaN sin Infinity 
Valida JSON antes de marcar tarea.
Si falla, emite:
[TASK_BLOCKED: <ID>: SCHEMA_VIOLATION] 
18. Protocolo JSONL
Todo JSONL generado debe cumplir:
una línea por objeto cada línea es JSON válido sin línea vacía intermedia salto final de línea permitido orden determinista sin objetos sin UID sin objetos sin trazabilidad 
Si un archivo JSONL de revisión no tiene incidencias, puede existir vacío.
Si un JSONL no vacío contiene línea inválida, bloquea:
[TASK_BLOCKED: <ID>: SCHEMA_VIOLATION] 
19. Protocolo de trazabilidad
Para cada objeto generado, exige:
object_type uid source_page source_blocks raw_text extraction_confidence verification_status 
Para cada bloque de página, exige:
block_id page_number text block_type bbox reading_order font_summary color_summary confidence 
Antes de completar una tarea que genera objetos derivados, verifica:
[ ] Cada source_page existe. [ ] Cada source_block existe. [ ] Cada uid es único. [ ] Cada objeto puede reconstruirse desde bloques fuente. [ ] Cada bloque fuente pertenece a su página declarada. 
Si falla, emite:
[TASK_BLOCKED: <ID>: TRACEABILITY_VIOLATION] 
20. Protocolo de cobertura
Para cada página, exige:
raw_chars = assigned_chars + unassigned_chars 
Para cierre final, exige:
SUM(unassigned_chars) = 0 
Si una página tiene caracteres no asignados durante tareas intermedias, registra revisión según la tarea activa.
Si se intenta cerrar la transcripción con caracteres no asignados, bloquea:
[TASK_BLOCKED: <ID>: COVERAGE_GAP] 
No cierres la transcripción si existe:
tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl 
con incidencias bloqueantes.
21. Protocolo de revisión
Usa archivos de revisión para conservar contenido dudoso, no para ocultar errores.
Archivos obligatorios:
tools/dictionary-pipeline/intermediate/review/needs_review.jsonl tools/dictionary-pipeline/intermediate/review/rejected_blocks.jsonl tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl 
Cada revisión debe incluir:
object_type uid source_page source_blocks raw_text reason suggested_resolution blocking verification_status 
Si blocking = true, no cierres la transcripción.
Si existe revisión bloqueante al validar cierre final, emite:
[TASK_BLOCKED: <ID>: BLOCKING_REVIEW_EXISTS] 
22. Protocolo de normalización
Conserva el texto canónico intacto.
No apliques normalización destructiva a:
raw_text headword phrase_text example text note text definition text page.raw_text block.text 
Aplica normalización auxiliar solo a campos normalizados.
Conversión auxiliar permitida:
â -> a ê -> e î -> i ô -> o û -> u Â -> a Ê -> e Î -> i Ô -> o Û -> u 
Si un campo canónico pierde circunflejo por normalización, bloquea:
[TASK_BLOCKED: <ID>: VALIDATION_FAILED] 
23. Protocolo de comandos por fase
Ejecuta comandos solo cuando la tarea activa lo indique.
Inicialización
npm run validate:env npm run transcribe:init 
Extracción de páginas
npm run transcribe:pages 
Catálogo
npm run transcribe:catalog 
Diccionario principal
npm run transcribe:dictionary 
Apéndice
npm run transcribe:appendix 
Checksums
npm run transcribe:checksums 
Validación global
npm run validate:transcription 
Suite completa
npm test 
No ejecutes comandos de fases futuras para hacer pasar una tarea actual.
24. Secuencia completa autorizada
Cuando TASKS.md lo permita expresamente, ejecuta esta secuencia completa:
npm run transcribe:init && npm run transcribe:pages && npm run transcribe:catalog && npm run transcribe:dictionary && npm run transcribe:appendix && npm run transcribe:checksums && npm run validate:transcription 
No uses esta secuencia para tareas unitarias salvo que la tarea activa lo indique.
25. Manejo de fallos
Ante cualquier fallo:
1. Detén la ejecución. 2. No marques la tarea como [x]. 3. No continúes con la siguiente tarea. 4. Conserva evidencia generada válida si está dentro de alcance. 5. Elimina temporales inválidos si fueron creados por la tarea activa. 6. Emite token de bloqueo exacto. 
No intentes reparación fuera de alcance.
No ocultes errores cambiando criterios de aceptación.
No edites documentos superiores para desbloquear.
No repitas comandos indefinidamente.
26. Recuperación determinista
Cuando una tarea quede bloqueada, la siguiente ejecución debe:
1. Leer documentos desde cero. 2. Identificar la misma tarea pendiente. 3. Verificar si la causa del bloqueo fue corregida. 4. Reejecutar solo la tarea activa. 5. Validar con el mismo comando exacto. 
No saltes una tarea bloqueada.
No marques como completada una tarea bloqueada sin ejecutar validación.
No limpies salidas válidas de tareas anteriores salvo que la tarea activa lo autorice.
27. Validación de tareas completadas
Antes de ejecutar una tarea pendiente, verifica todas las tareas anteriores marcadas [x].
Para cada tarea anterior completada, confirma:
[ ] Su salida esperada existe si aplica. [ ] Su comando de validación sigue disponible. [ ] No hay evidencia de archivos temporales. [ ] No hay modificación fuera de alcance atribuible. 
Si una tarea anterior marcada [x] ya no cumple sus salidas mínimas, bloquea la tarea actual:
[TASK_BLOCKED: <ID>: PRECONDITION_FAILED] 
28. Control de dependencias
No agregues dependencias salvo que la tarea activa lo permita.
Si agregas dependencia autorizada:
1. Declárala en package.json. 2. Actualiza package-lock.json. 3. Verifica que no requiera red durante ejecución normal. 4. Verifica licencia y disponibilidad local si la tarea lo exige. 5. Ejecuta prueba exacta de la tarea. 
Si package-lock.json falta después de declarar dependencias, bloquea:
[TRANSCRIPTION_BLOCKED: DEPENDENCY_LOCK_MISSING] 
29. Prohibición de red
No uses red para:
extraer texto corregir texto traducir texto completar abreviaturas resolver dudas lingüísticas validar contenido descargar modelos descargar datos consultar documentación durante ejecución 
Si una herramienta intenta acceso de red, detén ejecución y emite:
[TASK_BLOCKED: <ID>: FORBIDDEN_NETWORK_USAGE] 
30. Prohibición de Python
No ejecutes:
python python3 pip poetry conda jupyter notebook 
No crees scripts Python.
No llames Python desde Node.js.
No declares scripts npm que invoquen Python.
Si detectas Python en la tarea activa, bloquea:
[TASK_BLOCKED: <ID>: FORBIDDEN_PYTHON_USAGE] 
31. Control de contenido canónico
Al transcribir:
preserva signos diacríticos preserva puntuación preserva mayúsculas y minúsculas preserva saltos significativos preserva texto en color como texto canónico con metadatos visuales preserva texto pequeño preserva referencias internas preserva ejemplos preserva notas preserva variantes preserva tablas preserva imágenes como elementos visuales 
No modernices ortografía. No corrijas traducciones. No inventes contenido. No resumas. No elimines duplicados por parecer repetidos. No fusiones entradas sin evidencia. No dividas entradas sin evidencia.
Si no puedes clasificar contenido, consérvalo y márcalo para revisión.
32. Validación final de cierre
Solo cierra cuando todo esto sea verdadero:
[ ] T001 a T036 están [x]. [ ] node --version termina con código 0. [ ] npm --version termina con código 0. [ ] npm test termina con código 0. [ ] npm run validate:transcription termina con código 0. [ ] manifest.status = "completed". [ ] page_count = 330. [ ] Existen exactamente 330 archivos page_NNNN.json. [ ] Existe manifest.json. [ ] Existe checksums.json. [ ] Existen particiones JSONL del diccionario. [ ] Existen JSONL de catálogo. [ ] Existen JSONL de apéndice. [ ] Existen archivos de revisión. [ ] No hay revisiones bloqueantes. [ ] SUM(unassigned_chars) = 0. [ ] No hay UID duplicados. [ ] No hay trazabilidad rota. [ ] No hay archivos temporales *.tmp. [ ] No existe contenido transcrito fuera de intermediate. [ ] No existe reporte fuera de reports. 
Si todo pasa, emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
33. Plantilla interna de ciclo
Usa esta plantilla lógica en cada ejecución:
CICLO: leer_documentos() validar_entorno() tarea = seleccionar_primera_pendiente() si tarea == null: validar_cierre_total() emitir [TRANSCRIPTION_COMPLETE: ALL_PAGES] terminar validar_orden(tarea) validar_precondiciones(tarea) validar_alcance(tarea) preparar_prueba_tdd(tarea) ejecutar_prueba_tarea(tarea) implementar_alcance(tarea) ejecutar_comando_validacion(tarea) si validacion_ok: marcar_tarea_completada(tarea) emitir [TASK_COMPLETE: tarea.id] si validacion_falla: dejar_tarea_pendiente(tarea) emitir [TASK_BLOCKED: tarea.id: VALIDATION_FAILED] 
No imprimas razonamiento interno.
No expliques el proceso al usuario durante ejecución.
Emite solo el token operativo al cerrar un ciclo de agente.
34. Salida esperada del agente por ciclo
Al finalizar una tarea correctamente, la salida visible debe ser exactamente:
[TASK_COMPLETE: <ID>] 
Al bloquear una tarea, la salida visible debe ser exactamente:
[TASK_BLOCKED: <ID>: <REASON>] 
Al bloquear la transcripción completa antes de seleccionar tarea, la salida visible debe ser exactamente:
[TRANSCRIPTION_BLOCKED: <REASON>] 
Al finalizar todo, la salida visible debe ser exactamente:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
No agregues explicación junto al token.
No agregues resumen junto al token.
No agregues lista de archivos junto al token.
35. Invariantes finales
Mantén siempre estas invariantes:
El PDF fuente es inmutable. La transcripción es local. La ejecución usa Node.js. La ejecución no usa Python. La ejecución no usa red. Cada tarea tiene un único objetivo. Cada tarea tiene validación exacta. Cada salida tiene trazabilidad. Cada página tiene cobertura aritmética. Cada bloqueo conserva la tarea pendiente. Cada cierre requiere validación completa. 
Si cualquier invariante se rompe, bloquea inmediatamente con el token correspondiente.