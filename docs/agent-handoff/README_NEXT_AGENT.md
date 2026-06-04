# README_NEXT_AGENT.md

## Proposito

Usa esta carpeta para cerrar los parches V1 de la app Android sin depender del pipeline Python roto que genero `db_build_error.txt`. El archivo principal versionable es:

```text
docs/agent-handoff/handoff_database_agent_complete_20260603-211934.zip
```

Tambien se conserva `handoff_database_agent_20260603-211934.zip` como paquete original recibido, pero ese ZIP no incluye todos los archivos necesarios para ejecutar `npm run validate:transcription` en una carpeta limpia. Usa el paquete `complete`.

## Contenido Del ZIP

El ZIP contiene:

- `tools/dictionary-pipeline/` con pipeline Node;
- `package.json` y `package-lock.json`;
- PDF fuente original;
- `intermediate/manifest.json`;
- 330 archivos `pages/page_*.json`;
- JSONL de 6386 entradas;
- catalogos de abreviaturas, referencias y libros biblicos;
- apendices;
- checksums;
- reportes;
- tests Node;
- documentos canonicos de transcripcion.

## Datos Canonicos

Conteos verificados durante preparacion del handoff:

- paginas: `330`
- entradas: `6386`
- abreviaturas: `24`
- referencias: `51`
- libros biblicos: `66`
- filas de apendice: `282`

`manifest.json` declara:

- `status: completed`
- `runtime.engine: node`
- `python_allowed: false`
- `network_allowed: false`
- `preserve_diacritics: true`
- `create_diacriticless_search_forms: true`

## Validacion Recomendada

Extrae el ZIP en una carpeta temporal y ejecuta:

```powershell
npm ci
npm test
npm run validate:transcription
```

Si el entorno ya tiene `node_modules` copiado desde `C:/Users/zr_ma/OneDrive/Documentos/dic_miskito/node_modules`, puedes omitir `npm ci`. Si `npm test` tarda demasiado en el entorno, no lo marques como pasado. Registra timeout y ejecuta al menos:

```powershell
npm run validate:transcription
```

## Uso En El Repo Android

No copies el ZIP directamente a `app/src/main/assets`. Genera primero una base SQLite validada en:

```text
tools/dictionary-pipeline/output/dictionary.db
```

Despues copia esa base validada a:

```text
app/src/main/assets/dictionary.db
```

Valida el asset antes de ejecutar release.

## Contratos

Lee en este orden antes de modificar:

1. `CONSTITUTION.md`
2. `SPEC.md`
3. `PLAN.md`
4. `TASKS.md`
5. `ORCHESTRATION.md`
6. `MANUAL_DE_USO.md`

Ejecuta solo la primera tarea pendiente.
