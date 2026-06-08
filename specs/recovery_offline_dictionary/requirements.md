# SPEC - recovery_offline_dictionary

## Resumen

Este SPEC define, con nivel ejecutable, la recuperacion de la app Android
offline `APP_diccionario_miskito`. La auditoria determino que el estado actual
no es funcional: las SQLite incluidas estan corruptas, la busqueda no puede
confiarse, la transcripcion esta presente pero no esta modelada
lexicograficamente, existe mojibake en codigo/datos y el build conserva deuda de
AI Studio. La implementacion posterior debe convertir el repositorio en una app
offline verificable, liviana y lista para pruebas de usuario.

La feature queda en `spec_ready`. Ningun agente debe modificar codigo, Gradle,
assets o scripts hasta que el humano apruebe pasar a `in_progress`.

## Glosario

- **Asset SQLite**: archivo `app/src/main/assets/dictionary.db` que Room copia y
  abre en runtime.
- **DB generada**: archivo producido por el pipeline en
  `tools/dictionary-pipeline/output/dictionary.db`.
- **Handoff**: carpeta `docs/agent-handoff/extracted/` con JSONL, catalogos,
  apendices, paginas, checksums y PDF fuente.
- **Entrada canonica**: registro JSONL de `intermediate/dictionary_entries`.
- **Texto canonico**: texto que se muestra al usuario, preservando diacriticos y
  forma original corregida de mojibake.
- **Texto normalizado**: forma auxiliar para busqueda, en minusculas, sin marcas
  diacriticas y sin puntuacion irrelevante.
- **Sentido**: una acepcion/traduccion ordenada de una entrada.
- **Mojibake**: texto corrupto por doble o mala decodificacion, por ejemplo
  secuencias con bytes UTF-8 interpretados como Latin-1.
- **Revisable**: entrada que se conserva pero se marca para revision porque una
  parte lexicografica no pudo extraerse con confianza.

## Invariantes obligatorios

- El sistema debe funcionar sin red en runtime.
- El PDF no debe empaquetarse en el APK final.
- La fuente inicial de datos es el handoff JSONL, no las SQLite corruptas.
- Ninguna traduccion, ejemplo, nota o variante debe inventarse.
- Todo conteo critico debe ser reproducible por comando.
- Toda DB que se copie al asset debe pasar integridad SQLite.
- Todo texto visible en UI debe estar libre de mojibake.
- Todo cambio de schema debe estar cubierto por prueba Room.

## Trazabilidad desde la auditoria

- SQLite corrupta -> R1-R8, R30-R34.
- JSONL con 6386 entradas -> R9-R15.
- Traducciones dentro de `definition_segment` -> R16-R22.
- Mojibake -> R23-R29.
- Normalizador y busqueda fragiles -> R35-R46.
- UI pobre para diccionario -> R47-R56.
- App pesada/offline/release inmaduro -> R57-R66.
- Evidencia y cierre SDD -> R67-R72.

## Requirements

### R1
CUANDO el agente inicie implementacion, el sistema DEBE verificar que el repo
contiene `settings.gradle.kts`, `app/build.gradle.kts`, `app/src/main`, el
handoff de datos y los documentos SDD activos.

### R2
SI no existe `gradlew` o `gradlew.bat`, ENTONCES el sistema DEBE tratarlo como
bloqueo de build reproducible hasta agregar Gradle Wrapper o documentar una
alternativa temporal no aceptable para cierre final.

### R3
CUANDO el pipeline genere `tools/dictionary-pipeline/output/dictionary.db`, el
sistema DEBE eliminar o reemplazar de forma segura cualquier archivo previo de
salida antes de crear la nueva DB.

### R4
CUANDO se cree la DB generada, el sistema DEBE crearla desde JSONL/catologos y
NO DEBE leer datos desde `app/src/main/assets/dictionary.db` ni desde una DB
anterior.

### R5
CUANDO se escriba la DB generada, el sistema DEBE cerrar transacciones y
conexiones antes de ejecutar cualquier validacion externa.

### R6
CUANDO termine la generacion de la DB, el sistema DEBE ejecutar
`PRAGMA integrity_check` y aceptar solamente el resultado exacto `ok`.

### R7
SI la DB generada devuelve error de apertura, `SQLITE_CORRUPT`, integridad
distinta de `ok` o tablas faltantes, ENTONCES el sistema DEBE fallar la tarea y
NO DEBE copiar esa DB al asset.

### R8
CUANDO se copie el asset final, el sistema DEBE copiar solamente desde
`tools/dictionary-pipeline/output/dictionary.db` despues de validacion verde y
registrar hash, tamano y fecha de generacion.

### R9
CUANDO se lean los JSONL canonicos, el sistema DEBE procesar solo lineas no
vacias de archivos `*.jsonl` bajo
`docs/agent-handoff/extracted/tools/dictionary-pipeline/intermediate/dictionary_entries`.

### R10
CUANDO se cuenten los JSONL canonicos, el sistema DEBE reportar conteo por
archivo, conteo total, cantidad de archivos y rango de paginas cubierto.

### R11
CUANDO el conteo total JSONL sea distinto de 6386, el sistema DEBE bloquear la
generacion final salvo que exista una regla de deduplicacion aprobada en el
SPEC.

### R12
CUANDO se inserten entradas en SQLite, el sistema DEBE conservar por entrada:
`uid`, `headword`, `normalized_headword`, `sort_key`, `entry_type`,
`part_of_speech`, `source_page`, `raw_text`, `verification_status`,
`extraction_confidence`, flags y orden de lectura.

### R13
CUANDO se valide la tabla `entries`, el sistema DEBE comparar su conteo contra
el conteo JSONL y contra `metadata.entriesCount`.

### R14
SI una entrada JSONL no puede mapearse a `entries`, ENTONCES el sistema DEBE
registrar `uid`, archivo fuente, razon y accion tomada en el reporte de datos.

### R15
CUANDO se genere metadata, el sistema DEBE escribir al menos:
`entriesCount`, `translationsCount`, `variantsCount`, `examplesCount`,
`notesCount`, `reviewableEntriesCount`, `databaseVersion`, `sourceName`,
`sourceDate`, `sourcePdfSha256`, `buildDate` y `generatorVersion`.

### R16
CUANDO `translations` contenga datos estructurados, el sistema DEBE usarlos como
fuente principal de sentidos sin perder `translation_order`.

### R17
CUANDO `translations` este vacio y `segments.definition_segment` contenga `/`,
el sistema DEBE interpretar la parte izquierda como ingles y la derecha como
espanol, conservando ambas como texto canonico.

### R18
CUANDO `definition_segment` incluya varios terminos separados por coma o punto
y coma dentro del mismo idioma, el sistema DEBE conservarlos en el mismo sentido
si representan sinonimos equivalentes de la misma acepcion.

### R19
CUANDO `definition_segment` incluya numeracion, subacepciones o separadores que
indiquen sentidos distintos, el sistema DEBE crear sentidos separados en orden
estable.

### R20
CUANDO el parser no pueda distinguir de forma segura sinonimos de sentidos
distintos, el sistema DEBE conservar el texto completo en un sentido unico y
marcar la entrada como revisable.

### R21
SI una entrada no tiene traduccion extraible ni `definition_segment` util,
ENTONCES el sistema DEBE conservarla buscable por headword y marcarla como
revisable sin inventar traduccion.

### R22
CUANDO se almacenen sentidos/traducciones, el sistema DEBE guardar texto
canonico, texto normalizado, orden, fuente de extraccion y bandera
`is_inferred_from_definition`.

### R23
CUANDO el pipeline lea texto, el sistema DEBE aplicar una funcion pura de
reparacion de mojibake antes de indexar o escribir texto visible.

### R24
CUANDO se repare mojibake, el sistema DEBE limitarse a reglas deterministas
cubiertas por tests y conservar `raw_text` original para auditoria.

### R25
CUANDO se normalice Unicode, el sistema DEBE preservar texto canonico en NFC y
crear texto buscable mediante NFD, eliminacion de marcas combinantes y
normalizacion de espacios.

### R26
CUANDO se escaneen archivos visibles, el sistema DEBE fallar si detecta
secuencias mojibake conocidas o caracter de reemplazo Unicode en Kotlin, XML,
Markdown activo o datos generados destinados a UI.

### R27
SI una secuencia sospechosa aparece dentro de un fixture negativo o documento
que explica mojibake, ENTONCES el sistema DEBE permitirla solo mediante lista de
excepciones explicita y acotada.

### R28
CUANDO la app muestre etiquetas de idioma, el sistema DEBE mostrar `Espanol`,
`Ingles` o sus equivalentes definidos sin texto corrupto ni caracteres
ilegibles.

### R29
CUANDO se cierre la feature, el sistema DEBE tener una prueba anti-mojibake que
falle antes de la correccion y pase despues.

### R30
CUANDO se valide `app/src/main/assets/dictionary.db`, el sistema DEBE abrirla
en modo lectura, ejecutar integridad, validar tablas Room y validar conteos.

### R31
CUANDO Room abra el asset en pruebas locales, el sistema DEBE consultar
`metadata`, `entries`, `translations` o `senses`, `variants`, `examples`,
`notes`, `search_index`, `favorites` e `history`.

### R32
CUANDO `favorites` e `history` se consulten en DB preempaquetada, el sistema
DEBE verificar que no contienen datos precargados de usuario.

### R33
SI Room no puede abrir el asset por mismatch de schema, ENTONCES el sistema DEBE
ajustar entidades/DAO/schema o regenerar DB, no ignorar el fallo.

### R34
CUANDO se agregue o modifique una tabla usada por Room, el sistema DEBE anadir o
actualizar una prueba local que consulte esa tabla.

### R35
CUANDO `MiskitoTextNormalizer.normalizeForSearch` reciba texto Unicode real, el
sistema DEBE devolver una forma minuscula, sin marcas diacriticas, con espacios
colapsados y sin puntuacion irrelevante.

### R36
CUANDO se normalicen palabras miskitas con circunflejo o acentos, el sistema
DEBE hacer coincidir la consulta sin diacritico con la forma canonica con
diacritico.

### R37
CUANDO se indexen campos buscables, el sistema DEBE indexar headword, variantes,
espanol, ingles, ejemplos y notas en columnas canonicas y normalizadas.

### R38
CUANDO el usuario escriba una consulta vacia, el sistema DEBE mostrar estado
inicial y NO DEBE consultar la DB.

### R39
CUANDO el usuario escriba una consulta de un caracter, el sistema DEBE mostrar
estado de consulta demasiado corta salvo que el filtro/UX documentado permita
busqueda de una letra.

### R40
CUANDO el usuario busque una palabra miskito exacta, el sistema DEBE rankear la
entrada exacta antes que variantes, prefijos, traducciones, ejemplos o notas.

### R41
CUANDO el usuario busque una palabra miskito sin diacritico, el sistema DEBE
devolver entradas equivalentes con diacritico y reportarlas como match
normalizado.

### R42
CUANDO el usuario busque en espanol, el sistema DEBE buscar en traducciones
espanolas normalizadas y devolver entradas miskito asociadas.

### R43
CUANDO FTS no devuelva resultados para una consulta valida, el sistema DEBE
ejecutar fallback normalizado antes de emitir estado vacio.

### R44
CUANDO se combinen resultados de FTS y fallback, el sistema DEBE deduplicar por
`entry_id` preservando el mejor match.

### R45
CUANDO se ordenen resultados, el sistema DEBE aplicar pesos deterministas:
headword exacto, headword normalizado, variante exacta, prefijo headword,
prefijo variante, traduccion espanola, traduccion inglesa, ejemplos, notas,
orden lexicografico y `entry_id`.

### R46
CUANDO ocurra un error de DB durante busqueda, el sistema DEBE mostrar un estado
de error verificable y NO DEBE presentar un vacio como si no hubiera resultados.

### R47
CUANDO se muestre un item de resultado, el sistema DEBE incluir headword, parte
de habla si existe, traduccion espanola primaria o coincidente, pagina fuente si
existe e indicadores de variantes, sentidos, ejemplos y notas.

### R48
CUANDO la consulta sea espanola, el sistema DEBE priorizar en el resumen del
resultado el sentido espanol que hizo match.

### R49
CUANDO una entrada tenga varios sentidos, el detalle DEBE mostrarlos numerados
en orden lexicografico original.

### R50
CUANDO una entrada tenga traduccion inglesa y el ajuste permita verla, el
detalle DEBE mostrar ingles como apoyo debajo del espanol, no como traduccion
principal.

### R51
CUANDO una entrada tenga variantes, el detalle DEBE mostrarlas en una seccion
separada con tipo/nota si existen.

### R52
CUANDO una entrada tenga ejemplos, el detalle DEBE mostrar miskito primero,
espanol si existe e ingles solo si el ajuste lo permite.

### R53
CUANDO una entrada tenga notas o referencias, el detalle DEBE mostrarlas sin
mezclarlas con traducciones.

### R54
CUANDO una entrada sea revisable, el detalle DEBE mostrar una indicacion tecnica
no alarmista en la seccion de auditoria, sin ocultar datos verificables.

### R55
CUANDO se abra la seccion tecnica, el sistema DEBE mostrar `uid`, `source_page`,
estado de verificacion, confianza y `raw_text`.

### R56
CUANDO no existan traducciones verificables, el sistema DEBE evitar mostrar
texto falso como traduccion y debe mostrar solo datos disponibles.

### R57
MIENTRAS la app sea offline, el manifest NO DEBE declarar permiso de internet ni
permisos sensibles no usados.

### R58
MIENTRAS la app sea offline, el runtime principal NO DEBE depender de
`GEMINI_API_KEY`, Firebase AI, Retrofit, OkHttp ni servicios remotos.

### R59
CUANDO se auditen dependencias, el sistema DEBE listar dependencias removidas,
dependencias conservadas y razon de cada dependencia conservada.

### R60
CUANDO se construya release, el sistema NO DEBE usar `debugConfig` como firma de
release.

### R61
CUANDO se construya release, el sistema DEBE producir un APK o AAB medible y
registrar tamano en evidencia.

### R62
CUANDO se configure minificacion o shrinking, el sistema DEBE conservar reglas
necesarias para Room, Hilt y Compose y probar build.

### R63
CUANDO se actualice README, el sistema DEBE remover instrucciones de AI Studio,
Gemini o claves remotas para uso normal.

### R64
CUANDO se actualice documentacion de uso, el sistema DEBE explicar que la app es
offline y que la fuente empaquetada es SQLite validada.

### R65
CUANDO se ejecute validacion final, el sistema DEBE ejecutar comandos Node,
SQLite, Android unit tests y build release en orden documentado.

### R66
SI alguna validacion final falla, ENTONCES el sistema DEBE mantener la feature
sin cerrar y registrar bloqueo con comando, salida relevante y siguiente accion.

### R67
CUANDO el implementer complete una tarea, el sistema DEBE registrar en
`progress/impl_recovery_offline_dictionary.md` task, requirements cubiertos,
archivos modificados, comando ejecutado y resultado.

### R68
CUANDO el implementer complete todas las tareas, el sistema DEBE registrar una
matriz final `R<n> -> test/comando`.

### R69
CUANDO el reviewer evalue la feature, el sistema DEBE crear
`progress/review_recovery_offline_dictionary.md` con veredicto,
trazabilidad, checkpoints, riesgos residuales y cambios requeridos si aplica.

### R70
CUANDO el reviewer encuentre una tarea marcada completa sin evidencia, el
sistema DEBE rechazar el cierre.

### R71
CUANDO el arnes documental se valide con `init.ps1`, el sistema DEBE confirmar
que todos los requirements aparecen en `tasks.md`.

### R72
CUANDO el humano no haya aprobado implementacion, el sistema DEBE mantener la
feature en `spec_ready` y NO DEBE ejecutar tareas de codigo.

## Criterios de aceptacion consolidados

- La documentacion SDD queda completa y trazable.
- DB generada y asset pasan integridad SQLite.
- Conteos JSONL, DB y metadata concuerdan con 6386 entradas o bloqueo
  justificado.
- Traducciones/sentidos se extraen de `translations` o `definition_segment`.
- No hay mojibake visible en UI ni datos generados para UI.
- Room abre el asset y consulta tablas criticas.
- Busqueda miskito/espanol funciona offline con ranking estable y fallback.
- UI muestra resultados y detalle con formato lexicografico enriquecido.
- App no requiere red, claves ni dependencias online para funciones
  principales.
- Release no usa firma debug y registra tamano.
- Evidencia y review quedan en `progress/`.

## Matriz inicial R -> test/comando esperado

- R1 -> `init.ps1`, `test_repo_shape_for_recovery`
- R2 -> `gradle_wrapper_exists`
- R3 -> `build_sqlite_removes_previous_output`
- R4 -> `build_sqlite_never_reads_asset_as_source`
- R5 -> `build_sqlite_closes_before_validation`
- R6 -> `validate_sqlite_integrity_ok`
- R7 -> `validate_sqlite_rejects_corrupt_db`
- R8 -> `asset_copy_requires_validated_source`
- R9 -> `jsonl_reader_uses_dictionary_entries_only`
- R10 -> `jsonl_counter_reports_files_pages_total`
- R11 -> `jsonl_counter_requires_6386`
- R12 -> `entry_mapping_preserves_required_fields`
- R13 -> `metadata_count_matches_entries`
- R14 -> `unmapped_entries_reported`
- R15 -> `metadata_contains_required_keys`
- R16 -> `structured_translations_preserve_order`
- R17 -> `definition_segment_extracts_english_spanish`
- R18 -> `definition_segment_keeps_synonyms_in_sense`
- R19 -> `definition_segment_splits_numbered_senses`
- R20 -> `ambiguous_definition_marks_reviewable`
- R21 -> `missing_translation_keeps_headword_searchable`
- R22 -> `translation_rows_include_source_and_normalized_text`
- R23 -> `repair_mojibake_is_pure`
- R24 -> `repair_mojibake_preserves_raw_text`
- R25 -> `unicode_canonical_and_search_forms`
- R26 -> `quality_scan_detects_mojibake`
- R27 -> `quality_scan_allows_only_declared_exceptions`
- R28 -> `ui_language_labels_are_clean`
- R29 -> `anti_mojibake_regression_test`
- R30 -> `asset_database_integrity_check_ok`
- R31 -> `room_asset_queries_all_critical_tables`
- R32 -> `prepackaged_db_has_empty_user_tables`
- R33 -> `room_schema_matches_asset`
- R34 -> `dao_tests_cover_changed_tables`
- R35 -> `normalizer_handles_unicode`
- R36 -> `normalizer_matches_diacriticless_miskito`
- R37 -> `search_index_contains_normalized_columns`
- R38 -> `empty_query_does_not_hit_db`
- R39 -> `short_query_state`
- R40 -> `exact_headword_ranks_first`
- R41 -> `diacriticless_query_finds_diacritic_entry`
- R42 -> `spanish_query_returns_miskito_entries`
- R43 -> `fallback_runs_when_fts_empty`
- R44 -> `search_deduplicates_best_match`
- R45 -> `ranker_orders_all_match_types`
- R46 -> `search_db_error_state`
- R47 -> `search_result_contains_enriched_fields`
- R48 -> `spanish_query_summary_uses_matching_sense`
- R49 -> `entry_detail_orders_senses`
- R50 -> `entry_detail_english_visibility`
- R51 -> `entry_detail_variants_section`
- R52 -> `entry_detail_examples_section`
- R53 -> `entry_detail_notes_references_sections`
- R54 -> `reviewable_entry_technical_notice`
- R55 -> `entry_detail_technical_section`
- R56 -> `entry_without_translation_does_not_fake_text`
- R57 -> `manifest_has_no_internet_permission`
- R58 -> `no_runtime_remote_dependency_required`
- R59 -> `dependency_audit_report`
- R60 -> `release_does_not_use_debug_signing`
- R61 -> `release_artifact_size_recorded`
- R62 -> `release_build_with_keep_rules`
- R63 -> `readme_no_ai_studio_runtime_instructions`
- R64 -> `readme_documents_offline_sqlite`
- R65 -> final validation command chain
- R66 -> blocked validation evidence
- R67 -> implementation evidence per task
- R68 -> final traceability matrix
- R69 -> reviewer report exists
- R70 -> reviewer rejects missing evidence
- R71 -> `init.ps1`
- R72 -> `feature_list.json` remains `spec_ready` before approval

DOC_DONE:requirements -> specs/recovery_offline_dictionary/requirements.md
