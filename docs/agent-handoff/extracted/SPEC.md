# SPEC.md ## 1. Propósito Define los requisitos funcionales y criterios de aceptación para transcribir íntegramente el PDF fuente en objetos intermedios JSON y JSONL. Este documento regula únicamente la transcripción. No generes bases de datos. No generes código de consumo final. No hagas referencia a ningún sistema externo a la transcripción. ## 2. Fuente obligatoria Usa exclusivamente este archivo como fuente primaria: ```text tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf 
Reconoce 330 páginas reales del PDF.
Clasifica la estructura documental mínima así:
Página 1: portada Página 2: índice Página 3: uso del diccionario Página 4: notas del diccionario Página 5: abreviaturas Páginas 6-7: referencias Páginas 8-9: libros bíblicos Páginas 10-295: diccionario principal Páginas 296-328: apéndices, gramática, tablas, reglas, frases, expresiones y saludos Páginas 329-330: contenido final según extracción verificable 
No confíes solo en el índice impreso.
Verifica cada página contra el texto y la evidencia visual.
3. Entorno funcional
Usa Node.js para extracción, transformación, validación y reportes.
No uses Python.
No uses servicios remotos.
No uses red.
No uses OCR remoto.
No uses herramientas interactivas.
La transcripción debe poder ejecutarse con comandos locales reproducibles.
4. Formato funcional de salida
Genera esta estructura:
tools/dictionary-pipeline/intermediate/ ├── manifest.json ├── pages/ │ ├── page_0001.json │ ├── page_0002.json │ └── page_0330.json ├── dictionary_entries/ │ ├── entries_pages_0010_0025.jsonl │ ├── entries_pages_0026_0050.jsonl │ └── ... ├── catalog/ │ ├── abbreviations.jsonl │ ├── references.jsonl │ └── bible_books.jsonl ├── appendix/ │ ├── sections.jsonl │ ├── verb_tables.jsonl │ ├── grammar_rules.jsonl │ └── phrases.jsonl ├── review/ │ ├── needs_review.jsonl │ ├── rejected_blocks.jsonl │ └── coverage_gaps.jsonl └── checksums.json 
No generes un único JSON gigante.
No guardes objetos sin trazabilidad.
No guardes contenido transcrito fuera de esta estructura.
5. Requisito funcional RF-001: manifiesto de corrida
Conducta requerida
Genera manifest.json antes de transcribir páginas.
Incluye como mínimo:
{ "schema_version": "transcription-intermediate-v1", "source_name": "BYD Bila Yumhpa Diccionario Miskito Dictionary", "source_date": "2024-12-20", "source_pdf_path": "tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf", "source_pdf_sha256": "", "page_count": 330, "language_scope": ["miskito", "english", "spanish"], "runtime": { "engine": "node", "python_allowed": false, "network_allowed": false }, "output_mode": "jsonl-partitioned", "normalization": { "unicode": "NFC", "preserve_diacritics": true, "create_diacriticless_search_forms": true }, "status": "in_progress" } 
Criterios de aceptación
Dado que existe el PDF fuente, cuando inicies la corrida, entonces calcula source_pdf_sha256.
Dado que el PDF contiene 330 páginas, cuando generes el manifiesto, entonces page_count debe ser 330.
Dado que la transcripción no ha terminado, cuando existan páginas pendientes, entonces status debe ser in_progress.
Dado que todas las páginas están validadas, cuando cierres la corrida, entonces cambia status a completed.
6. Requisito funcional RF-002: extracción por página
Conducta requerida
Genera un archivo por cada página:
tools/dictionary-pipeline/intermediate/pages/page_0001.json ... tools/dictionary-pipeline/intermediate/pages/page_0330.json 
Cada archivo debe incluir:
{ "object_type": "page", "uid": "page-p0001", "pdf_page_number": 1, "printed_page_number": null, "section": "cover", "secondary_sections": [], "raw_text": "", "raw_text_sha256": "", "blocks": [], "visual_elements": [], "derived_objects": [], "coverage": { "raw_chars": 0, "assigned_chars": 0, "unassigned_chars": 0 }, "verification_status": "parsed", "extraction_confidence": 1.0 } 
Criterios de aceptación
Dado un PDF de 330 páginas, cuando termine la extracción base, entonces deben existir exactamente 330 archivos page_NNNN.json.
Dado cualquier página, cuando se calcule cobertura, entonces raw_chars = assigned_chars + unassigned_chars.
Dado cualquier bloque extraído, cuando se escriba en una página, entonces debe tener block_id, text, block_type, bbox, reading_order, font_summary, color_summary y confidence.
Dado un número de página impreso visible, cuando difiera de la posición real del PDF, entonces conserva ambos valores.
7. Requisito funcional RF-003: bloques de texto
Conducta requerida
Divide cada página en bloques de lectura.
Usa tipos permitidos:
cover_title cover_subtitle cover_date index_item usage_paragraph dictionary_note abbreviation_item reference_item bible_book_row entry_candidate entry_continuation example note cross_reference appendix_heading appendix_paragraph verb_table_row grammar_rule phrase table_header table_row page_number visual_caption unclassified 
Criterios de aceptación
Dado un bloque con texto visible, cuando lo clasifiques, entonces usa exactamente uno de los tipos permitidos.
Dado un bloque no clasificable, cuando lo conserves, entonces usa unclassified y crea registro en review/needs_review.jsonl.
Dado un bloque de continuación entre páginas, cuando lo detectes, entonces registra el vínculo en continued_from o continued_to.
8. Requisito funcional RF-004: portada
Conducta requerida
Transcribe título, subtítulo, idiomas, descripción, fecha y elementos visuales de la portada.
Registra imágenes como visual_elements.
No inventes descripción para imágenes.
Describe únicamente ubicación, tipo y texto asociado si existe.
Criterios de aceptación
Dado que la página 1 contiene portada, cuando la proceses, entonces section debe ser cover.
Dado que la portada contiene imagen, cuando generes page_0001.json, entonces debe existir al menos un visual_element.
Dado que la portada contiene fecha, cuando la transcribas, entonces conserva el texto visible exacto.
9. Requisito funcional RF-005: índice
Conducta requerida
Transcribe todos los ítems del índice como bloques index_item.
Cada ítem debe conservar:
{ "declared_page": 0, "title_english": "", "title_spanish": "", "raw_text": "" } 
Criterios de aceptación
Dado que la página 2 contiene índice bilingüe, cuando la proceses, entonces cada línea de sección debe quedar representada.
Dado que un ítem del índice declara página, cuando lo transcribas, entonces conserva el número declarado.
Dado que el índice declara secciones posteriores, cuando clasifiques páginas, entonces no uses el índice como única evidencia.
10. Requisito funcional RF-006: instrucciones y notas
Conducta requerida
Transcribe las secciones de uso y notas como párrafos completos.
Preserva:
• saltos de párrafo;
• términos entre comillas;
• paréntesis;
• diacríticos;
• listas implícitas;
• equivalencias bilingües.
Criterios de aceptación
Dado un párrafo bilingüe, cuando lo transcribas, entonces no mezcles el texto inglés con el español en un único campo traducido.
Dado una nota sobre diacríticos, cuando la transcribas, entonces conserva todos los ejemplos con circunflejos.
Dado una nota sobre variantes, cuando la transcribas, entonces conserva el texto exacto aunque contenga errores o variantes ortográficas.
11. Requisito funcional RF-007: abreviaturas
Conducta requerida
Genera catalog/abbreviations.jsonl.
Cada línea debe cumplir:
{ "object_type": "abbreviation", "uid": "abbreviation-p0005-v", "code": "v", "english_text": "verb", "spanish_text": "verbo", "source_page": 5, "source_blocks": [], "raw_text": "", "verification_status": "parsed", "extraction_confidence": 1.0 } 
Criterios de aceptación
Dado que la página 5 contiene abreviaturas, cuando termines la página, entonces cada código visible debe estar en abbreviations.jsonl.
Dado que una abreviatura contiene dos idiomas, cuando la transcribas, entonces separa inglés y español sin perder raw_text.
Dado que una abreviatura contiene puntuación como a/t: o Alt:, cuando la transcribas, entonces conserva la puntuación en code.
12. Requisito funcional RF-008: referencias
Conducta requerida
Genera catalog/references.jsonl.
Cada referencia debe cumplir:
{ "object_type": "reference", "uid": "reference-p0006-db", "code": "db", "short_name": "", "full_description": "", "language": "bilingual", "reference_type": "source", "source_page": 6, "source_blocks": [], "raw_text": "", "verification_status": "parsed", "extraction_confidence": 1.0 } 
Criterios de aceptación
Dado que las referencias pueden ocupar varias líneas, cuando las transcribas, entonces une líneas pertenecientes al mismo código sin eliminar saltos significativos.
Dado que una referencia contiene descripción en inglés y español, cuando la transcribas, entonces conserva ambas.
Dado que una referencia contiene subcódigos, cuando los detectes, entonces conserva el texto completo en raw_text.
13. Requisito funcional RF-009: libros bíblicos
Conducta requerida
Genera catalog/bible_books.jsonl.
Cada fila debe cumplir:
{ "object_type": "bible_book", "uid": "bible-book-p0008-blasi-sturka", "section": "hebrew_scriptures", "miskito": "", "short_code": "", "english": "", "spanish": "", "source_page": 8, "source_blocks": [], "raw_text": "", "verification_status": "parsed", "extraction_confidence": 1.0 } 
Criterios de aceptación
Dado que las páginas 8 y 9 contienen tablas, cuando las proceses, entonces cada fila visible debe ser un objeto.
Dado que una celda se divide visualmente en varias líneas, cuando la transcribas, entonces reconstruye el valor completo y conserva evidencia en raw_text.
Dado que el encabezado diferencia secciones, cuando transcribas filas, entonces marca hebrew_scriptures o greek_scriptures.
14. Requisito funcional RF-010: entradas del diccionario
Conducta requerida
Genera objetos dictionary_entry en JSONL particionado.
Cada entrada debe cumplir:
{ "object_type": "dictionary_entry", "uid": "", "source_page": 10, "source_blocks": [], "headword": "", "normalized_headword": "", "sort_key": "", "entry_type": "main", "parent_uid": null, "raw_part_of_speech": null, "part_of_speech": null, "raw_text": "", "translations": [], "variants": [], "examples": [], "notes": [], "references": [], "cross_references": [], "flags": { "has_examples": false, "has_notes": false, "has_variants": false }, "verification_status": "parsed", "extraction_confidence": 1.0 } 
Valores permitidos de entry_type:
main subentry compound phrase_entry derived_form verb_form construct_form bible_book cross_reference_only unknown 
Criterios de aceptación
Dado una línea con lema y traducciones, cuando la proceses, entonces genera una entrada.
Dado una entrada con subentradas indentadas o relacionadas visualmente, cuando la proceses, entonces conserva relación mediante parent_uid si la evidencia es clara.
Dado una entrada partida entre páginas, cuando la proceses, entonces genera un solo objeto si la continuidad es verificable.
Dado una entrada ambigua, cuando la proceses, entonces conserva raw_text y marca needs_review.
15. Requisito funcional RF-011: traducciones
Conducta requerida
Cada traducción debe cumplir:
{ "english_text": null, "spanish_text": null, "translation_order": 1, "is_literal": false, "note": null, "raw_text": "" } 
Criterios de aceptación
Dado que una entrada contiene traducción inglesa antes de /, cuando la proceses, entonces escríbela en english_text.
Dado que una entrada contiene traducción española después de /, cuando la proceses, entonces escríbela en spanish_text.
Dado que una traducción contiene marcador Lit: o equivalente, cuando la proceses, entonces marca is_literal como true.
Dado que no puedes separar inglés y español con seguridad, cuando la proceses, entonces conserva el texto en raw_text y marca revisión.
16. Requisito funcional RF-012: variantes
Conducta requerida
Extrae variantes explícitas.
Reconoce como variantes:
a/t: Alt: fs/ea: former spelling also spelled alternatively formas sin diacríticos visibles formas entre paréntesis asociadas al lema formas constructivas explícitas formas relacionadas declaradas como variantes 
Cada variante debe cumplir:
{ "variant_text": "", "normalized_variant": "", "variant_type": "also_spelled", "note": null, "raw_text": "" } 
Valores permitidos de variant_type:
also_spelled alternative former_spelling diacriticless construct irregular parenthetical related unknown 
Criterios de aceptación
Dado una variante marcada con a/t:, cuando la extraigas, entonces usa also_spelled.
Dado una variante marcada con Alt:, cuando la extraigas, entonces usa alternative.
Dado una forma sin diacríticos visible junto a una forma con diacríticos, cuando la extraigas, entonces usa diacriticless.
Dado que una variante no puede clasificarse, cuando la conserves, entonces usa unknown y marca revisión.
17. Requisito funcional RF-013: ejemplos
Conducta requerida
Extrae ejemplos marcados con Ex, Ej, Ex/Ej, ExEj o variantes visibles.
Cada ejemplo debe cumplir:
{ "uid": "", "miskito_text": "", "english_text": null, "spanish_text": null, "source_code": null, "source_detail": null, "example_order": 1, "is_literal_translation": true, "raw_reference_text": null, "raw_text": "", "source_blocks": [] } 
Criterios de aceptación
Dado un ejemplo con referencia entre paréntesis, cuando lo extraigas, entonces conserva raw_reference_text.
Dado un ejemplo con código de fuente, cuando lo extraigas, entonces separa source_code si es inequívoco.
Dado un ejemplo con texto miskito, inglés y español, cuando lo proceses, entonces conserva los tres segmentos.
Dado un ejemplo dividido en varias líneas, cuando lo proceses, entonces une las líneas sin perder raw_text.
Dado un ejemplo sin traducción completa, cuando lo proceses, entonces no lo descartes.
18. Requisito funcional RF-014: notas
Conducta requerida
Extrae notas marcadas con Note, Nota, Note/Nota o bloques equivalentes.
Cada nota debe cumplir:
{ "uid": "", "note_type": "usage", "note_text": "", "note_order": 1, "language": "bilingual", "raw_text": "", "source_blocks": [] } 
Valores permitidos de note_type:
usage grammar spelling diacritic regional source warning cross_reference visual_status unknown 
Criterios de aceptación
Dado una nota bilingüe, cuando la extraigas, entonces conserva ambos idiomas.
Dado una nota sobre uso, cuando la clasifiques, entonces usa usage.
Dado una nota sobre gramática, cuando la clasifiques, entonces usa grammar.
Dado una nota no clasificable, cuando la conserves, entonces usa unknown y marca revisión.
19. Requisito funcional RF-015: referencias internas
Conducta requerida
Extrae referencias internas visibles como:
See also Ver también see/ver See entry below Ver entrada debajo irregularity of irregularidad de 
Cada referencia interna debe cumplir:
{ "type": "see_also", "target_text": "", "raw_text": "", "resolved_target_uid": null, "resolution_status": "unresolved" } 
Valores permitidos de type:
see see_also see_below irregularity_of compare source_reference unknown 
Valores permitidos de resolution_status:
resolved unresolved ambiguous not_applicable 
Criterios de aceptación
Dado una referencia interna textual, cuando la extraigas, entonces conserva el texto destino.
Dado que el destino puede resolverse a un lema único, cuando valides referencias, entonces escribe resolved_target_uid.
Dado que el destino no puede resolverse de forma única, cuando valides referencias, entonces marca ambiguous.
20. Requisito funcional RF-016: apéndices
Conducta requerida
Genera objetos en:
appendix/sections.jsonl appendix/verb_tables.jsonl appendix/grammar_rules.jsonl appendix/phrases.jsonl 
Clasifica apéndices por sección.
Conserva tablas, reglas, párrafos, encabezados y ejemplos.
Criterios de aceptación
Dado una página de apéndice con encabezado, cuando la proceses, entonces genera un objeto appendix_section.
Dado una tabla verbal, cuando la proceses, entonces genera filas en verb_tables.jsonl.
Dado una regla gramatical, cuando la proceses, entonces genera objetos en grammar_rules.jsonl.
Dado una frase, expresión o saludo, cuando la proceses, entonces genera objetos en phrases.jsonl.
21. Requisito funcional RF-017: frases, expresiones y saludos
Conducta requerida
Cada frase debe cumplir:
{ "object_type": "phrase", "uid": "", "phrase_text": "", "normalized_phrase": "", "english_text": null, "spanish_text": null, "category": null, "source_page": 328, "source_blocks": [], "raw_text": "", "confidence": 1.0, "verification_status": "parsed" } 
Criterios de aceptación
Dado una frase con traducción inglesa y española, cuando la extraigas, entonces separa ambos idiomas.
Dado una expresión sin categoría explícita, cuando la extraigas, entonces deja category como null.
Dado que la frase aparece dentro del diccionario principal, cuando esté claramente marcada como frase, entonces permite entry_type = phrase_entry.
22. Requisito funcional RF-018: evidencia visual
Conducta requerida
Registra elementos visuales cuando existan.
Cada elemento visual debe cumplir:
{ "uid": "", "object_type": "visual_element", "visual_type": "image", "source_page": 1, "bbox": null, "description": "", "associated_text": "", "requires_manual_review": false } 
Valores permitidos de visual_type:
image table colored_text small_text layout_marker page_number line unknown 
Criterios de aceptación
Dado una imagen visible, cuando proceses la página, entonces registra un visual_element.
Dado texto azul u otro color funcional, cuando lo detectes, entonces registra colored_text.
Dado una tabla, cuando la transcribas, entonces registra estructura textual y evidencia visual.
Dado un elemento visual no interpretable, cuando lo registres, entonces marca requires_manual_review = true.
23. Requisito funcional RF-019: normalización auxiliar
Conducta requerida
Genera campos normalizados sin alterar campos canónicos.
Aplica:
NFC trim exterior colapso de espacios internos casefold eliminación auxiliar de circunflejos miskitos para búsqueda 
Convierte solo en campos normalizados:
â -> a ê -> e î -> i ô -> o û -> u Â -> a Ê -> e Î -> i Ô -> o Û -> u 
Criterios de aceptación
Dado Bîla, cuando normalices, entonces el campo canónico permanece Bîla y el auxiliar puede ser bila.
Dado cualquier lema con circunflejo, cuando generes normalized_headword, entonces no modifiques headword.
Dado una frase con puntuación final, cuando generes normalized_phrase, entonces elimina solo lo definido por la regla documentada.
24. Requisito funcional RF-020: revisión
Conducta requerida
Genera review/needs_review.jsonl para ambigüedades.
Cada línea debe cumplir:
{ "object_type": "review_item", "uid": "", "source_page": 0, "source_blocks": [], "raw_text": "", "reason": "", "suggested_resolution": "", "blocking": true } 
Genera review/rejected_blocks.jsonl solo para bloques descartados con razón explícita.
Genera review/coverage_gaps.jsonl para cualquier contenido no asignado.
Criterios de aceptación
Dado un bloque ambiguo, cuando no puedas clasificarlo, entonces no lo descartes.
Dado un bloque rechazado, cuando lo escribas, entonces conserva raw_text y reason.
Dado un hueco de cobertura, cuando lo detectes, entonces bloquea la página.
25. Requisito funcional RF-021: checksums
Conducta requerida
Genera checksums.json.
Incluye hash de:
• PDF fuente;
• cada archivo de página;
• cada JSONL;
• cada catálogo;
• cada archivo de revisión;
• manifiesto.
Criterios de aceptación
Dado que un archivo intermedio cambia, cuando recalcules checksums, entonces cambia su hash correspondiente.
Dado que el PDF fuente cambia, cuando valides, entonces bloquea la transcripción.
Dado que falta un archivo esperado, cuando valides checksums, entonces falla.
26. Requisito funcional RF-022: particionado JSONL
Conducta requerida
Particiona entradas por rangos de páginas.
Usa rangos deterministas.
No mezcles páginas fuera del rango declarado por archivo.
Cada línea debe ser JSON válido independiente.
Criterios de aceptación
Dado una entrada de página 10, cuando se escriba, entonces debe aparecer en una partición cuyo rango incluya la página 10.
Dado una línea JSONL inválida, cuando valides, entonces bloquea la transcripción.
Dado dos objetos con el mismo uid, cuando valides, entonces falla.
27. Requisito funcional RF-023: preservación de contenido difícil
Conducta requerida
Preserva:
• diacríticos;
• signos invertidos;
• comillas;
• guiones;
• paréntesis;
• barras;
• abreviaturas;
• códigos de fuente;
• números;
• referencias bíblicas;
• encabezados;
• pies;
• texto pequeño;
• texto de color;
• saltos relevantes;
• entradas partidas;
• errores visibles del documento.
Criterios de aceptación
Dado texto con error aparente, cuando lo transcribas, entonces conserva el error.
Dado texto con diacrítico, cuando lo transcribas, entonces conserva el diacrítico.
Dado texto en letra pequeña, cuando lo transcribas, entonces no lo omitas.
28. Requisito funcional RF-024: validación global
Conducta requerida
La transcripción completa debe pasar validación global con Node.js.
El comando canónico será:
npm run validate:transcription 
La validación debe comprobar:
existencia del PDF fuente sha256 del PDF fuente disponibilidad de Node.js ausencia de Python en scripts de transcripción existencia de manifest.json page_count = 330 existencia de 330 páginas JSON validez JSON validez JSONL unicidad de uid trazabilidad de source_blocks cobertura completa por página ausencia de coverage_gaps bloqueantes ausencia de needs_review bloqueantes para cierre final preservación de diacríticos en campos canónicos normalización auxiliar correcta checksums coherentes particiones JSONL coherentes no escritura fuera de alcance 
Criterios de aceptación
Dado una transcripción incompleta, cuando ejecutes npm run validate:transcription, entonces debe fallar.
Dado cualquier página con unassigned_chars > 0, cuando ejecutes validación, entonces debe fallar.
Dado cualquier objeto sin source_blocks, cuando ejecutes validación, entonces debe fallar salvo objetos globales justificados.
Dado cualquier uso de Python en scripts de transcripción, cuando ejecutes validación, entonces debe fallar.
Dado que todas las condiciones pasan, cuando ejecutes validación, entonces debe terminar con código 0.
29. Escenarios BDD globales
Feature: Transcripción completa del PDF
Scenario: Crear manifiesto verificable
Dado que el PDF fuente existe
Cuando ejecutes la inicialización de transcripción
Entonces debes crear manifest.json
Y debes calcular source_pdf_sha256
Y debes registrar page_count como 330
Y debes marcar status como in_progress
Scenario: Extraer todas las páginas
Dado que el manifiesto existe
Cuando ejecutes la extracción por página
Entonces debes crear 330 archivos en pages/
Y cada archivo debe contener raw_text
Y cada archivo debe contener bloques ordenados
Y cada archivo debe contener cobertura calculada
Scenario: Transcribir catálogo inicial
Dado que las páginas 5 a 9 están extraídas
Cuando proceses catálogos
Entonces debes generar abreviaturas
Y debes generar referencias
Y debes generar libros bíblicos
Y cada objeto debe conservar raw_text
Scenario: Transcribir diccionario principal
Dado que las páginas 10 a 295 están extraídas
Cuando proceses entradas
Entonces debes generar entradas JSONL particionadas
Y debes extraer traducciones
Y debes extraer variantes
Y debes extraer ejemplos
Y debes extraer notas
Y debes extraer referencias internas
Y debes conservar toda ambigüedad en revisión
Scenario: Transcribir apéndices
Dado que las páginas 296 a 330 están extraídas
Cuando proceses apéndices
Entonces debes generar secciones
Y debes generar tablas verbales
Y debes generar reglas gramaticales
Y debes generar frases, expresiones y saludos
Y debes conservar tablas y bloques visuales
Scenario: Validar cobertura total
Dado que todas las páginas fueron procesadas
Cuando ejecutes la validación global
Entonces SUM(unassigned_chars) debe ser 0
Y no deben existir huecos de cobertura bloqueantes
Y no deben existir objetos sin trazabilidad
Y no deben existir uid duplicados
Scenario: Bloquear por contenido dudoso
Dado que existe texto no clasificable
Cuando proceses la página
Entonces debes conservarlo en needs_review.jsonl
Y debes marcar la página como needs_review o blocked
Y no debes emitir cierre final
Scenario: Cerrar transcripción
Dado que la validación global termina con código 0
Cuando actualices el manifiesto
Entonces status debe ser completed
Y debes emitir [TRANSCRIPTION_COMPLETE: ALL_PAGES]
30. Definición de terminado
La transcripción está terminada solo si:
[ ] Existe manifest.json. [ ] Existe checksums.json. [ ] Existen exactamente 330 archivos page_NNNN.json. [ ] Existen catálogos JSONL requeridos. [ ] Existen particiones JSONL del diccionario principal. [ ] Existen archivos JSONL de apéndice. [ ] Todo JSON es válido. [ ] Todo JSONL es válido línea por línea. [ ] Todo uid es único. [ ] Todo objeto transcrito tiene trazabilidad. [ ] Cada bloque pertenece a una página. [ ] Cada página declara cobertura. [ ] Ninguna página tiene caracteres sin asignar. [ ] No existen huecos de cobertura bloqueantes. [ ] No existen revisiones bloqueantes para cierre final. [ ] Los diacríticos canónicos se preservan. [ ] Las formas normalizadas no sustituyen texto canónico. [ ] Los checksums son coherentes. [ ] El PDF fuente conserva su hash. [ ] No se usó Python. [ ] No se usó red. [ ] No se escribieron archivos fuera del alcance. [ ] `npm run validate:transcription` termina con código 0. 
Si cualquier condición falla, no cierres la transcripción.
Emite:
[TRANSCRIPTION_BLOCKED: SPEC_VALIDATION_FAILED]