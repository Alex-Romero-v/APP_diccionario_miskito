# Resumen de auditoria

## Hallazgos criticos

1. `app/src/main/assets/dictionary.db` esta corrupta. SQLite devuelve
   `SQLITE_CORRUPT / database disk image is malformed`.
2. `tools/dictionary-pipeline/output/dictionary.db` tambien esta corrupta.
3. La transcripcion JSONL existe y suma 6386 entradas, pero el mapeo semantico
   es incompleto: muchas entradas tienen `translations` vacio aunque
   `segments.definition_segment` contiene ingles/espanol separado por `/`.
4. Hay mojibake en codigo, pruebas y datos generados: ejemplos observados
   incluyen `EspaÃƒÂ±ol`, `InglÃƒÂ©s`, `bÃƒÂ¢`, `Ã‚ISA` y `Ã¢â‚¬â€œ`.
5. `MiskitoTextNormalizer` normaliza secuencias mojibakeadas en vez de Unicode
   real.
6. La busqueda depende de FTS sobre una DB corrupta y no prueba casos
   miskito/espanol reales.
7. El formato de salida de resultados es pobre para un diccionario: no agrupa
   sentidos ni muestra suficiente contexto lexicografico.
8. La app incluye dependencias online o no usadas para un producto offline.
9. El repo remoto no trae Gradle Wrapper aunque documentos anteriores exigian
   `.\gradlew`.
10. El release usa `debugConfig` y no esta optimizado.

## Implicacion

La app debe tratarse como una recuperacion integral, no como un parche menor de
busqueda. La fuente canonica inicial son los JSONL y catalogos del handoff, no
las SQLite actuales.
