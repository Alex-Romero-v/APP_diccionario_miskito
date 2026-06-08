# Arquitectura objetivo

## Principios

- Offline primero: la app no depende de red, claves ni servicios externos.
- Datos canonicos separados de datos indexados: preservar texto original y
  generar campos normalizados auxiliares.
- SQLite valida antes de Room: no se copia ningun asset sin integridad.
- Busqueda explicable: cada resultado debe tener razon de ranking.
- UI lexicografica: la salida debe parecer diccionario, no lista generica.
- Ligereza: remover dependencias que no aporten al runtime offline.

## Capas

```text
tools/dictionary-pipeline-node/
  Lee JSONL/catalagos/apendices -> genera SQLite validada

app/src/main/assets/dictionary.db
  Asset final preempaquetado, validado antes de release

data/local/
  Room entities, DAOs, relaciones y FTS/search tables

data/repository/
  DictionaryRepository, MetadataRepository, repos de favoritos/historial

domain/
  Normalizacion, ranking, modelos, politicas de busqueda

ui/
  Compose: busqueda, resultados, detalle, settings, about
```

## Flujo de datos

1. JSONL canonico conserva `raw_text`, pagina, headword, segmentos y flags.
2. Generador Node corrige codificacion, extrae sentidos y traducciones.
3. SQLite se valida con conteos, integridad y consultas de muestra.
4. Room abre `dictionary.db` desde asset.
5. Repository normaliza consulta, consulta indice y aplica ranking.
6. UI muestra resultado enriquecido y detalle por sentidos.

## No hacer

- No incluir el PDF completo en APK.
- No usar Gemini, Firebase AI, Retrofit u OkHttp para busqueda.
- No crear traducciones sinteticas.
- No ocultar errores de DB con estados vacios.
- No mantener documentos que declaren validaciones no ejecutadas.
