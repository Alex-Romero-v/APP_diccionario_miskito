# CONSTITUTION.md ## 1. Propósito Gobierna exclusivamente la transcripción completa, minuciosa, verificable y determinista del PDF: `tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf` Convierte el contenido del PDF en objetos JSON y JSONL intermedios. No generes bases de datos. No generes código de interfaz. No generes artefactos finales de consumo. No hagas referencias a sistemas externos a la transcripción. ## 2. Autoridad documental Aplica esta jerarquía de autoridad: 1. `CONSTITUTION.md` 2. `SPEC.md` 3. `PLAN.md` 4. `TASKS.md` 5. `ORCHESTRATION.md` 6. `MANUAL_DE_USO.md` 7. `TRANSCRIPTION_AGENT.txt` 8. `DATABASE_GENERATION.txt` 9. PDF fuente Cuando exista conflicto, obedece el documento de mayor autoridad. Cuando un documento heredado exija Python, ignóralo para esta transcripción. Cuando un documento heredado mencione objetivos que no sean transcripción, trátalos como contexto no ejecutable. ## 3. Entorno obligatorio Usa Node.js. No uses Python. No uses `python`. No uses `python3`. No uses `pip`. No uses `poetry`. No uses `conda`. No uses notebooks. No uses servicios remotos. No uses red para extraer, completar, traducir, corregir o validar contenido. Ejecuta todo el procesamiento de forma local y reproducible. Antes de ejecutar cualquier tarea, verifica: ```bash node --version npm --version 
Si Node.js no está disponible, bloquea la ejecución y emite:
[TRANSCRIPTION_BLOCKED: NODE_UNAVAILABLE] 
Si una tarea requiere una dependencia no instalada y no existe package-lock.json, bloquea la ejecución y emite:
[TRANSCRIPTION_BLOCKED: DEPENDENCY_LOCK_MISSING] 
4. Fuente primaria
Usa el PDF como fuente primaria.
El PDF analizado contiene 330 páginas.
Todas las páginas tienen texto extraíble.
El PDF contiene imágenes embebidas, incluyendo la portada y al menos una imagen interna.
El PDF contiene diferencias visuales relevantes, incluyendo color de fuente, tablas, encabezados, pies, números de página, marcas diacríticas y bloques con estado visual especial.
La transcripción debe preservar el contenido canónico y registrar la evidencia visual necesaria para revisión.
5. Alcance único
Transcribe:
• portada;
• índice;
• instrucciones de uso;
• notas del diccionario;
• abreviaturas;
• referencias;
• libros bíblicos;
• diccionario principal;
• apéndice gramatical;
• tablas verbales;
• reglas;
• ejemplos;
• notas;
• variantes;
• frases;
• expresiones;
• saludos;
• imágenes;
• tablas;
• encabezados;
• pies;
• números de página;
• texto en color;
• texto pequeño;
• signos de puntuación;
• signos diacríticos;
• referencias internas;
• referencias bibliográficas;
• bloques dudosos;
• bloques no asignados.
No omitas contenido por considerarlo repetido, secundario, visual, auxiliar o difícil de clasificar.
6. Principio de fidelidad absoluta
Preserva el texto original del PDF.
No modernices ortografía.
No corrijas traducciones.
No regularices gramática.
No completes abreviaturas no explícitas.
No inventes equivalencias.
No traduzcas contenido faltante.
No elimines circunflejos.
No reemplaces texto canónico por texto normalizado.
No conviertas signos tipográficos sin registrar el cambio.
No fusiones entradas si la evidencia visual o textual no lo permite.
No dividas entradas si no existe evidencia estructural suficiente.
Cuando dudes, conserva el bloque original y márcalo para revisión.
7. Cobertura del 100%
Cada carácter extraído del PDF debe quedar asignado exactamente a una de estas categorías:
• page.raw_text;
• dictionary_entry.raw_text;
• catalog;
• appendix;
• phrase;
• visual_element;
• needs_review;
• rejected_block.
No permitas pérdida silenciosa.
No permitas bloques sin trazabilidad.
No marques una página como completada si contiene caracteres no asignados.
Cada página debe declarar:
{ "raw_chars": 0, "assigned_chars": 0, "unassigned_chars": 0 } 
Acepta una página solo si:
raw_chars = assigned_chars + unassigned_chars 
Acepta la transcripción completa solo si:
SUM(unassigned_chars) = 0 
Si existe contenido que no puede clasificarse, escríbelo en review/coverage_gaps.jsonl y bloquea el cierre final.
8. Trazabilidad obligatoria
Cada objeto generado debe incluir:
• object_type;
• uid;
• source_page;
• source_blocks;
• raw_text;
• extraction_confidence;
• verification_status.
Cada bloque de página debe incluir:
• block_id;
• page_number;
• text;
• block_type;
• bbox;
• reading_order;
• font_summary;
• color_summary;
• confidence.
Cada entrada debe poder reconstruirse desde sus bloques fuente.
Cada bloque fuente debe pertenecer a una página.
Cada página debe poder reconstruirse desde el texto extraído y los bloques registrados.
9. Evidencia visual
Extrae y registra la evidencia visual cuando afecte interpretación o revisión.
Registra:
• coordenadas;
• orden de lectura;
• tamaño aproximado de fuente;
• familia tipográfica si está disponible;
• negrita;
• cursiva;
• color RGB o hexadecimal;
• posición de columnas;
• tablas;
• imágenes;
• texto pequeño;
• saltos de línea significativos;
• divisiones por página;
• entradas partidas entre páginas.
Para texto en color, conserva el texto y añade metadatos visuales.
No uses el color para alterar el contenido canónico.
Si el color indica que falta verificación, registra:
{ "visual_status": "requires_verification" } 
10. Normalización
Genera formas normalizadas solo como campos auxiliares.
Mantén intacto el texto canónico.
Aplica normalización auxiliar de búsqueda con estas reglas:
{ "unicode": "NFC", "trim_outer_spaces": true, "collapse_internal_spaces": true, "casefold": true, "preserve_original_text": true, "create_diacriticless_search_forms": true } 
Convierte únicamente en campos normalizados:
â -> a ê -> e î -> i ô -> o û -> u Â -> a Ê -> e Î -> i Ô -> o Û -> u 
No apliques esta conversión al texto canónico.
11. Formato de salida
Escribe salidas intermedias bajo:
tools/dictionary-pipeline/intermediate/ tools/dictionary-pipeline/reports/ 
Usa JSONL particionado.
No escribas un único JSON gigante.
No dependas del orden del sistema de archivos.
Ordena siempre de forma determinista por:
source_page ASC reading_order ASC headword ASC uid ASC 
12. Estructura mínima de salida
Genera esta estructura:
tools/dictionary-pipeline/intermediate/ ├── manifest.json ├── pages/ │ ├── page_0001.json │ ├── page_0002.json │ └── ... ├── dictionary_entries/ │ ├── entries_pages_0010_0025.jsonl │ ├── entries_pages_0026_0050.jsonl │ └── ... ├── catalog/ │ ├── abbreviations.jsonl │ ├── references.jsonl │ └── bible_books.jsonl ├── appendix/ │ ├── sections.jsonl │ ├── verb_tables.jsonl │ ├── grammar_rules.jsonl │ └── phrases.jsonl ├── review/ │ ├── needs_review.jsonl │ ├── rejected_blocks.jsonl │ └── coverage_gaps.jsonl └── checksums.json 
13. Archivos permitidos
Modifica únicamente:
tools/dictionary-pipeline/src/**/*.js tools/dictionary-pipeline/src/**/*.mjs tools/dictionary-pipeline/src/**/*.cjs tools/dictionary-pipeline/src/**/*.ts tools/dictionary-pipeline/tests/**/*.js tools/dictionary-pipeline/tests/**/*.mjs tools/dictionary-pipeline/tests/**/*.ts tools/dictionary-pipeline/intermediate/** tools/dictionary-pipeline/reports/** package.json package-lock.json CONSTITUTION.md SPEC.md PLAN.md TASKS.md ORCHESTRATION.md MANUAL_DE_USO.md 
Lee únicamente:
tools/dictionary-pipeline/input/** TRANSCRIPTION_AGENT.txt DATABASE_GENERATION.txt CONSTITUTION.md SPEC.md PLAN.md TASKS.md ORCHESTRATION.md MANUAL_DE_USO.md 
14. Archivos prohibidos
No modifiques archivos fuera del alcance permitido.
No escribas artefactos finales.
No escribas binarios derivados salvo reportes de extracción visual explícitamente definidos en PLAN.md.
No sobrescribas el PDF fuente.
No renombres el PDF fuente.
No alteres documentos heredados.
15. Identificadores deterministas
Genera uid deterministas.
No uses UUID aleatorio.
No uses timestamps dentro de uid.
No uses orden accidental del sistema de archivos.
Usa este patrón base:
<prefix>-p<page_4_digits>-b<block_4_digits>-<slug> 
Ejemplos:
entry-p0010-b0001-abakaia page-p0001 block-p0010-b0007 phrase-p0328-b0003-aisabe reference-p0006-db 
Si dos objetos producen el mismo slug, agrega sufijo determinista:
-002 -003 
16. Estados permitidos
Usa solo estos estados:
parsed verified needs_review blocked rejected 
No inventes estados.
No marques verified sin validación.
No marques rejected sin conservar raw_text y reason.
17. Confianza
Asigna extraction_confidence con escala decimal entre 0 y 1.
Usa:
1.00 texto extraído directamente y asignado sin ambigüedad 0.95 texto extraído directamente con estructura clara 0.85 texto extraído directamente con unión de líneas 0.70 texto extraído directamente con ambigüedad de bloque 0.50 texto legible solo mediante evidencia visual parcial 0.00 bloque no transcribible 
No uses confianza para omitir contenido.
18. Manejo de ambigüedad
Si una entrada, nota, ejemplo, tabla o frase no puede clasificarse con certeza, conserva el texto en el objeto más cercano y agrega una fila en:
tools/dictionary-pipeline/intermediate/review/needs_review.jsonl 
Incluye:
{ "uid": "", "source_page": 0, "source_blocks": [], "raw_text": "", "reason": "", "suggested_resolution": "", "blocking": true } 
Si la ambigüedad impide cobertura total, bloquea la página.
19. Reglas de lectura del PDF
Usa extracción textual con Node.js como primera fuente.
Usa renderizado visual local como verificación de:
• tablas;
• columnas;
• imágenes;
• color;
• texto pequeño;
• encabezados;
• pies;
• entradas partidas;
• signos diacríticos dudosos.
No uses OCR si el texto ya es extraíble.
Si una imagen contiene información no representada en texto extraíble, registra el elemento visual y transcribe solo lo verificable.
Si no puedes leer un elemento visual con herramientas locales, marca revisión bloqueante.
20. Control de páginas
Procesa cada página como unidad verificable.
No cierres una página sin:
• archivo pages/page_NNNN.json;
• bloques ordenados;
• cobertura calculada;
• clasificación de sección;
• checksum del texto bruto;
• lista de objetos derivados;
• estado final.
Usa numeración de archivo basada en la página real del PDF:
page_0001.json page_0002.json ... page_0330.json 
No renumeres según el índice interno.
Si el índice impreso contradice el número real de página, conserva ambos valores:
{ "pdf_page_number": 3, "printed_page_number": 3, "index_declared_page": 2 } 
21. Secciones reconocidas
Clasifica páginas con estos valores:
cover index usage dictionary_notes abbreviations references bible_books dictionary appendix_overview verb_overview verb_tables verb_tense_guide regular_verbs irregular_verbs nouns verb_to_noun construct_forms comparisons numbers_years pronunciation short_forms grammar_rules phrases unknown 
No inventes secciones.
Si una página contiene varias secciones, registra:
{ "section": "primary_section", "secondary_sections": [] } 
22. Validación obligatoria
Ninguna tarea puede completarse sin ejecutar su validador.
Los validadores deben estar implementados en Node.js.
Todo comando de validación debe ser exacto y declarado en TASKS.md.
Una tarea solo puede marcarse completada si:
• el comando termina con código 0;
• no hay cambios fuera de alcance;
• no hay cobertura pendiente;
• los checksums se actualizan;
• los reportes se escriben;
• los estados son coherentes.
23. Tokens obligatorios
Al completar una tarea, emite:
[TASK_COMPLETE: <ID>] 
Al bloquear una tarea, emite:
[TASK_BLOCKED: <ID>: <REASON>] 
Al completar una página, emite:
[PAGE_COMPLETE: <PAGE_NUMBER>] 
Al bloquear una página, emite:
[PAGE_BLOCKED: <PAGE_NUMBER>: <REASON>] 
Al completar toda la transcripción, emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES] 
No emitas el token final si existe cualquier página, bloque u objeto en estado blocked o needs_review.
24. Prohibición de invención
No generes contenido lingüístico nuevo.
No completes ejemplos truncados sin evidencia.
No infieras traducciones faltantes.
No traduzcas términos no traducidos.
No mejores redacción.
No reemplaces una forma por otra más probable.
No uses conocimiento externo para corregir el PDF.
El contenido final debe poder auditarse contra el PDF.
25. Pruebas mínimas globales
Todo el sistema documental posterior debe exigir pruebas para:
• existencia del PDF fuente;
• hash del PDF fuente;
• conteo de páginas;
• extracción de texto por página;
• existencia de archivos page_0001.json a page_0330.json;
• cobertura por página;
• ausencia de caracteres sin asignar;
• validez JSON;
• validez JSONL línea por línea;
• unicidad de uid;
• trazabilidad de bloques;
• preservación de diacríticos;
• normalización auxiliar;
• consistencia de referencias;
• consistencia de secciones;
• ausencia de Python;
• ausencia de red;
• ausencia de escrituras fuera de alcance.
26. Criterio final de aceptación
Acepta la transcripción solo si:
[ ] Existen 330 archivos de página. [ ] Existe manifest.json. [ ] Existe checksums.json. [ ] Existen particiones JSONL. [ ] Todo JSON es válido. [ ] Todo JSONL es válido línea por línea. [ ] Cada uid es único. [ ] Cada objeto tiene trazabilidad. [ ] Cada página tiene cobertura completa. [ ] No existen bloques sin clasificar. [ ] No existen páginas bloqueadas. [ ] No existen objetos needs_review bloqueantes. [ ] No existen caracteres perdidos. [ ] El PDF fuente conserva su hash. [ ] No se usó Python. [ ] No se usó red. [ ] No se escribieron archivos fuera de alcance. [ ] Los validadores Node.js pasan con código 0. 
Solo entonces emite:
[TRANSCRIPTION_COMPLETE: ALL_PAGES]