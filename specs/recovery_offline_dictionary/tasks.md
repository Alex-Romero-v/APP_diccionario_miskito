# Tasks - recovery_offline_dictionary

## Protocolo obligatorio

El implementer ejecuta una sola task `[ ]` por ciclo, en orden. Para cada task:

1. Copia task activa y requirements en `progress/current.md`.
2. Ejecuta fase Red, aunque sea mediante inspeccion/test que demuestre el fallo.
3. Ejecuta fase Green con el cambio minimo.
4. Ejecuta fase Refactor solo dentro de archivos permitidos.
5. Ejecuta el comando de validacion indicado.
6. Registra evidencia en `progress/impl_recovery_offline_dictionary.md`.
7. Marca `[x]` solo si la validacion pasa.
8. Emite `TASK_DONE:T<n>`.

Si una validacion falla por un problema tecnico dentro del SPEC, resolver y
registrar `TASK_RETRY:T<n>`. Solo usar `TASK_BLOCKED:T<n>` si hace falta cambiar
SPEC, ampliar alcance, usar credenciales externas o ejecutar accion destructiva
no prevista.

## Cobertura resumida

- Preparacion reproducible: R1, R2, R63-R72 -> T001-T005.
- Auditoria y datos previos: R9-R15 -> T006-T010.
- Texto, mojibake y parseo lexicografico: R16-R29 -> T011-T022.
- SQLite generada, asset y Room: R3-R34, R37, R47-R48 -> T023-T039.
- Normalizacion y busqueda: R35-R46 -> T040-T048.
- UI lexicografica: R47-R56 -> T049-T057.
- Offline, release y cierre: R57-R72 -> T058-T070.

## Checklist detallado

### Fase A - Preparacion reproducible

- [ ] T001 - Registrar inicio de implementacion aprobada. Cubre: R67, R72.
  - Precondiciones: humano aprobo pasar `feature_list.json` a `in_progress`.
  - Permitidos: `feature_list.json`, `progress/current.md`,
    `progress/impl_recovery_offline_dictionary.md`.
  - Prohibidos: `app/**`, `tools/**`, assets.
  - Red: verificar que la feature esta `spec_ready`.
  - Green: cambiar a `in_progress` solo con aprobacion humana registrada.
  - Validacion: `Select-String -Path feature_list.json -Pattern 'in_progress'`.
  - Evidencia: aprobacion humana resumida y fecha.

- [ ] T002 - Agregar o restaurar Gradle Wrapper. Cubre: R2.
  - Permitidos: `gradlew`, `gradlew.bat`, `gradle/wrapper/**`,
    `docs/verification.md`, `README.md`.
  - Prohibidos: codigo Kotlin, DB, scripts de datos.
  - Red: `Test-Path .\gradlew.bat` debe fallar en estado actual.
  - Green: agregar wrapper compatible con el proyecto.
  - Refactor: documentar version de Gradle.
  - Validacion: `.\gradlew --version`.
  - Evidencia: version reportada.

- [ ] T003 - Crear prueba/chequeo de forma del repo. Cubre: R1.
  - Permitidos: `init.ps1`, `docs/verification.md`, pruebas de calidad si se
    decide ubicarlas bajo `app/src/test/.../quality`.
  - Red: demostrar que falta al menos un chequeo de ruta critica.
  - Green: validar `settings.gradle.kts`, `app/build.gradle.kts`, handoff,
    docs SDD y modulo Android.
  - Validacion: `.\init.ps1`.
  - Evidencia: salida OK.

- [ ] T004 - Eliminar referencias activas a AI Studio/Gemini en docs de uso.
  Cubre: R63, R64.
  - Permitidos: `README.md`, `docs/**`, `SPEC.md`, `TASKS.md`.
  - Prohibidos: `docs/agent-handoff/extracted/tools/**`.
  - Red: buscar `GEMINI_API_KEY`, `AI Studio`, `START_HERE`.
  - Green: reemplazar por instrucciones offline.
  - Validacion: `rg -n "GEMINI_API_KEY|AI Studio|START_HERE" README.md docs SPEC.md TASKS.md` sin coincidencias activas.
  - Evidencia: comando y resultado.

- [ ] T005 - Establecer formato de evidencia por task. Cubre: R67, R68.
  - Permitidos: `progress/impl_recovery_offline_dictionary.md`,
    `docs/verification.md`.
  - Red: archivo de evidencia no existe o no tiene plantilla.
  - Green: crear plantilla con secciones `TASK_DONE`, comandos, archivos,
    trazabilidad y riesgos.
  - Validacion: `Test-Path progress/impl_recovery_offline_dictionary.md`.
  - Evidencia: plantilla creada.

### Fase B - Auditoria de datos antes de generar DB

- [ ] T006 - Crear fixture minimo de JSONL con `definition_segment`. Cubre:
  R16-R22.
  - Permitidos: `tools/dictionary-pipeline-node/tests/fixtures/**`.
  - Prohibidos: handoff canonico.
  - Red: test inexistente para traducciones inferidas.
  - Green: agregar fixture con entrada tipo `Abakaia` y `Abakuk`.
  - Validacion: fixture existe y es JSONL valido.
  - Evidencia: rutas de fixtures.

- [ ] T007 - Extraer modulo puro de lectura JSONL. Cubre: R9, R10.
  - Permitidos: `tools/dictionary-pipeline-node/scripts/**`,
    `tools/dictionary-pipeline-node/src/**`, tests Node.
  - Prohibidos: Android.
  - Red: test que espera conteo por archivo falla.
  - Green: implementar lectura ordenada y conteo no vacio.
  - Validacion: `npm test`.
  - Evidencia: conteo esperado en test.

- [ ] T008 - Validar conteo canonico de 6386 entradas. Cubre: R10, R11.
  - Permitidos: scripts/tests Node, `progress/impl_...md`.
  - Red: ejecutar contador contra handoff y registrar salida actual.
  - Green: hacer fallar si total != 6386.
  - Validacion: comando Node de conteo contra handoff.
  - Evidencia: tabla por archivo y total.

- [ ] T009 - Implementar reporte de entradas no mapeadas. Cubre: R14.
  - Permitidos: pipeline Node, tests.
  - Red: fixture con JSON invalido o campo faltante no reporta uid/linea.
  - Green: reporte por archivo/linea/uid/razon.
  - Validacion: `npm test`.
  - Evidencia: fixture negativo.

- [ ] T010 - Crear auditoria inicial de handoff. Cubre: R10, R14, R15.
  - Permitidos: `tools/dictionary-pipeline/output/**`, `progress/**`.
  - Red: no existe reporte de auditoria.
  - Green: generar reporte con conteos JSONL, paginas, metadata fuente y
    posibles faltantes.
  - Validacion: `Test-Path tools/dictionary-pipeline/output/data-audit-report.json`.
  - Evidencia: resumen de conteos.

### Fase C - Texto, mojibake y normalizacion de pipeline

- [ ] T011 - Crear tests rojos de mojibake conocido. Cubre: R23, R24, R29.
  - Permitidos: tests Node/fixtures.
  - Red: fixture con texto corrupto no se repara.
  - Green: solo agregar tests, no implementacion.
  - Validacion: `npm test` debe fallar por tests nuevos.
  - Evidencia: salida roja esperada.

- [ ] T012 - Implementar `repairMojibake`. Cubre: R23, R24.
  - Permitidos: modulo Node de texto, tests.
  - Red: tests de T011 fallan.
  - Green: reparar secuencias conocidas y preservar raw.
  - Validacion: `npm test`.
  - Evidencia: casos reparados.

- [ ] T013 - Implementar normalizacion canonica/search en Node. Cubre: R25.
  - Permitidos: modulo Node de texto, tests.
  - Red: test con acentos/circunflejos falla.
  - Green: NFC para canonico, NFD sin marcas para busqueda.
  - Validacion: `npm test`.
  - Evidencia: ejemplos de entrada/salida.

- [ ] T014 - Agregar lista de excepciones anti-mojibake. Cubre: R26, R27.
  - Permitidos: prueba/calidad Node o Gradle, docs de excepciones.
  - Red: scanner detecta textos explicativos en specs.
  - Green: permitir solo fixtures/docs declarados.
  - Validacion: test anti-mojibake pasa.
  - Evidencia: lista de excepciones acotada.

- [ ] T015 - Escanear UI/docs activos contra mojibake. Cubre: R26, R28.
  - Permitidos: tests de calidad, strings/docs activos.
  - Red: scanner detecta strings corruptos actuales.
  - Green: corregir strings visibles.
  - Validacion: test/rg anti-mojibake sin hallazgos no exceptuados.
  - Evidencia: salida scanner.

### Fase D - Parseo lexicografico

- [ ] T016 - Crear tests rojos para parseo de `definition_segment`. Cubre:
  R17-R20.
  - Permitidos: tests Node.
  - Red: casos `/`, comas, punto y coma, ambiguo.
  - Green: solo tests.
  - Validacion: `npm test` falla en parseo.
  - Evidencia: nombres de tests.

- [ ] T017 - Implementar parser simple ingles/espanol por `/`. Cubre: R17.
  - Permitidos: modulo parser Node.
  - Red: test simple falla.
  - Green: parte izquierda ingles, derecha espanol.
  - Validacion: `npm test`.
  - Evidencia: caso `to overturn / volcar`.

- [ ] T018 - Implementar politica de sinonimos en mismo sentido. Cubre: R18.
  - Permitidos: parser Node/tests.
  - Red: comas pierden orden o crean sentidos erroneos.
  - Green: preservar sinonimos como texto de un sentido.
  - Validacion: `npm test`.
  - Evidencia: fixture con varios sinonimos.

- [ ] T019 - Implementar separacion de sentidos numerados. Cubre: R19.
  - Permitidos: parser Node/tests.
  - Red: numeracion queda colapsada.
  - Green: crear sentidos ordenados.
  - Validacion: `npm test`.
  - Evidencia: fixture multi-sentido.

- [ ] T020 - Implementar marca de revisable para ambiguedad. Cubre: R20, R21.
  - Permitidos: parser/mapping Node/tests.
  - Red: ambiguedad no queda reportada.
  - Green: sentido unico + `is_reviewable`.
  - Validacion: `npm test`.
  - Evidencia: razon de revision.

- [ ] T021 - Mapear `translations` estructurado como fuente principal. Cubre:
  R16, R22.
  - Permitidos: mapper Node/tests.
  - Red: fixture con `translations` pierde orden/fuente.
  - Green: mapear con `source_kind=structured`.
  - Validacion: `npm test`.
  - Evidencia: orden preservado.

- [ ] T022 - Mapear `definition_segment` cuando `translations` esta vacio.
  Cubre: R17, R22.
  - Permitidos: mapper Node/tests.
  - Red: entradas reales quedan sin traduccion.
  - Green: `source_kind=definition_segment` e inferencia marcada.
  - Validacion: `npm test`.
  - Evidencia: `Abakaia`/`Abakuk`.

### Fase E - SQLite generada

- [ ] T023 - Definir schema SQLite objetivo en generador. Cubre: R12, R15,
  R22, R37.
  - Permitidos: `build-sqlite.mjs`, tests.
  - Red: test inspecciona tablas/campos faltantes.
  - Green: crear tablas/campos necesarios.
  - Validacion: `npm test`.
  - Evidencia: SQL de tablas.

- [ ] T024 - Asegurar recreacion limpia de DB. Cubre: R3, R4.
  - Permitidos: generador/tests.
  - Red: crear archivo corrupto previo en temp y demostrar fallo.
  - Green: eliminar/recrear salida antes de abrir.
  - Validacion: `npm test`.
  - Evidencia: test con DB previa corrupta.

- [ ] T025 - Insertar entradas con campos obligatorios. Cubre: R12.
  - Permitidos: generador/tests.
  - Red: fixture verifica campos faltantes.
  - Green: insertar uid/headword/POS/pagina/raw/flags.
  - Validacion: `npm test`.
  - Evidencia: SELECT de fixture.

- [ ] T026 - Insertar sentidos/traducciones con normalizados. Cubre: R22.
  - Permitidos: generador/tests.
  - Red: traducciones no aparecen en tabla.
  - Green: insertar canonico, normalizado, orden y fuente.
  - Validacion: `npm test`.
  - Evidencia: conteo traducciones fixture.

- [ ] T027 - Insertar variantes, ejemplos y notas. Cubre: R15, R37.
  - Permitidos: generador/tests.
  - Red: fixture con variantes/ejemplos/notas queda vacio.
  - Green: insertar tablas relacionadas.
  - Validacion: `npm test`.
  - Evidencia: conteos por tabla.

- [ ] T028 - Insertar metadata obligatoria. Cubre: R15.
  - Permitidos: generador/tests.
  - Red: metadata obligatoria faltante.
  - Green: escribir todas las claves.
  - Validacion: `npm test`.
  - Evidencia: SELECT metadata.

- [ ] T029 - Crear search index canonico/normalizado. Cubre: R37.
  - Permitidos: generador/tests.
  - Red: busqueda en tabla indice no encuentra traduccion.
  - Green: poblar columnas por campo.
  - Validacion: `npm test`.
  - Evidencia: entrada fixture buscable.

- [ ] T030 - Cerrar transacciones y reabrir readonly para validacion. Cubre:
  R5, R6.
  - Permitidos: generador/validador/tests.
  - Red: integridad no se ejecuta sobre conexion nueva.
  - Green: cerrar y reabrir readonly.
  - Validacion: `npm test`.
  - Evidencia: test inspecciona flujo.

- [ ] T031 - Endurecer `validate-sqlite.mjs` para integridad. Cubre: R6, R7.
  - Permitidos: validador/tests.
  - Red: archivo corrupto se acepta o falla sin mensaje claro.
  - Green: rechazar corrupto, no SQLite, tablas faltantes.
  - Validacion: `npm test`.
  - Evidencia: mensajes esperados.

- [ ] T032 - Validar conteos 6386 contra DB real. Cubre: R11, R13.
  - Permitidos: generador/validador, `progress/**`.
  - Red: ejecutar contra estado actual y registrar fallo si existe.
  - Green: generar DB real y validar conteos.
  - Validacion: `node tools/dictionary-pipeline-node/scripts/validate-sqlite.mjs --db tools/dictionary-pipeline/output/dictionary.db --entries 6386`.
  - Evidencia: salida valida.

- [ ] T033 - Generar reporte de auditoria de datos final. Cubre: R14, R15,
  R20.
  - Permitidos: `tools/dictionary-pipeline/output/**`, scripts Node.
  - Red: reporte final faltante.
  - Green: reporte con revisables, conteos, mojibake reparado, no mapeadas.
  - Validacion: `Test-Path tools/dictionary-pipeline/output/data-audit-report.json`.
  - Evidencia: resumen.

### Fase F - Asset y Room

- [ ] T034 - Copiar DB validada al asset. Cubre: R8, R30.
  - Permitidos: `app/src/main/assets/dictionary.db`, `progress/**`.
  - Red: asset actual falla validacion.
  - Green: copiar DB validada.
  - Validacion: validador contra asset con `--entries 6386`.
  - Evidencia: hash source/asset.

- [ ] T035 - Crear prueba Room de apertura del asset. Cubre: R30, R31.
  - Permitidos: `app/src/test/java/**/data/local/database/**`.
  - Red: prueba falla con asset corrupto o schema mismatch.
  - Green: test abre asset y consulta tablas criticas.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: nombre de test.

- [ ] T036 - Verificar tablas de usuario vacias. Cubre: R32.
  - Permitidos: tests Room/DAO.
  - Red: no se valida favorites/history.
  - Green: assert favoritos/historial vacios.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test.

- [ ] T037 - Alinear entidades Room con schema. Cubre: R33, R34.
  - Permitidos: `app/src/main/java/**/data/local/**`,
    `app/src/test/java/**/data/local/**`.
  - Red: KSP/Room falla o test schema falla.
  - Green: ajustar entidades/DAO minimamente.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: entidades tocadas.

- [ ] T038 - Crear consultas DAO para resultados enriquecidos. Cubre: R47,
  R48.
  - Permitidos: DAO, relation/projection, tests DAO.
  - Red: proyeccion no contiene sentido/pagina/badges.
  - Green: consulta retorna campos enriquecidos.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test DAO.

- [ ] T039 - Crear consulta fallback normalizada. Cubre: R43, R44.
  - Permitidos: DAO/projection/tests.
  - Red: fallback no existe.
  - Green: DAO fallback por columnas normalizadas.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test DAO fallback.

### Fase G - Dominio de normalizacion y busqueda

- [ ] T040 - Crear tests rojos del normalizador Unicode Kotlin. Cubre: R35,
  R36.
  - Permitidos: `app/src/test/java/**/domain/normalizer/**`.
  - Red: tests fallan con implementacion actual.
  - Green: solo tests.
  - Validacion: `.\gradlew testDebugUnitTest` falla por tests nuevos.
  - Evidencia: salida roja.

- [ ] T041 - Implementar normalizador Unicode Kotlin. Cubre: R35, R36.
  - Permitidos: `MiskitoTextNormalizer.kt`, tests.
  - Red: tests T040 fallan.
  - Green: `java.text.Normalizer`, minusculas, espacios, diacriticos.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: tests verdes.

- [ ] T042 - Expandir `SearchMatchType`. Cubre: R45.
  - Permitidos: dominio search/tests.
  - Red: no existen tipos suficientes.
  - Green: agregar tipos necesarios sin romper mapper.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: enum/tipos.

- [ ] T043 - Reescribir tests de ranking completo. Cubre: R45.
  - Permitidos: `SearchRankerTest.kt`, `SearchRanker.kt`.
  - Red: orden esperado falla.
  - Green: pesos explicitos y desempate estable.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: matriz de pesos.

- [ ] T044 - Probar estado query vacia/corta. Cubre: R38, R39.
  - Permitidos: `SearchViewModelTest.kt`, parser query.
  - Red: query vacia/corta consulta DAO.
  - Green: estados inicial/too short sin DB.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: tests.

- [ ] T045 - Implementar clasificacion de match en repository. Cubre: R40-R45.
  - Permitidos: `DictionaryRepository.kt`, projection, tests repo.
  - Red: exacto/traduccion se ordenan mal.
  - Green: clasificar match por campos enriquecidos.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: tests repository.

- [ ] T046 - Integrar FTS + fallback en repository. Cubre: R42-R44.
  - Permitidos: repository, DAO, tests.
  - Red: consulta espanola/fallback vacia.
  - Green: combinar FTS y fallback, deduplicar por mejor match.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: tests espanol/fallback.

- [ ] T047 - Probar errores DB como estado de error. Cubre: R46.
  - Permitidos: ViewModel/repository tests.
  - Red: excepcion se convierte en vacio.
  - Green: estado Error verificable.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test.

- [ ] T048 - Pruebas de aceptacion de busqueda con datos reales. Cubre:
  R40, R41, R42, R43, R44, R45, R46.
  - Permitidos: tests Room/repository.
  - Red: casos `ba`, `baha`, `madre`, `casa`, `agua` fallan.
  - Green: hacerlos pasar con DB valida.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: resultados esperados.

### Fase H - UI de busqueda y detalle

- [ ] T049 - Ampliar modelo `SearchResult`. Cubre: R47, R48.
  - Permitidos: domain model, mappers, tests.
  - Red: faltan campos para UI.
  - Green: agregar campos sin datos falsos.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: mapper test.

- [ ] T050 - Actualizar item visual de resultado. Cubre: R47.
  - Permitidos: `ui/search/**`, tests UI.
  - Red: UI no muestra pagina/badges/sentido.
  - Green: layout compacto con campos enriquecidos.
  - Validacion: tests Compose o screenshot test existente.
  - Evidencia: prueba.

- [ ] T051 - Priorizar sentido coincidente en busqueda espanola. Cubre: R48.
  - Permitidos: repository/UI tests.
  - Red: resumen muestra primera traduccion no coincidente.
  - Green: usar `matchedSpanishText`.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test.

- [ ] T052 - Crear modelo de detalle con sentidos ordenados. Cubre: R49.
  - Permitidos: domain model, mapper, tests.
  - Red: detalle no representa sentidos.
  - Green: lista ordenada de sentidos/traducciones.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test multi-sentido.

- [ ] T053 - Actualizar seccion de traducciones a sentidos numerados. Cubre:
  R49, R50.
  - Permitidos: `ui/entrydetail/**`, tests UI.
  - Red: UI muestra lista plana.
  - Green: numeracion, espanol primero, ingles segun ajuste.
  - Validacion: tests UI/ViewModel.
  - Evidencia: test.

- [ ] T054 - Verificar secciones de variantes, ejemplos, notas y referencias.
  Cubre: R51, R52, R53.
  - Permitidos: `ui/entrydetail/**`, tests.
  - Red: secciones mezclan datos o no aparecen.
  - Green: secciones separadas y ordenadas.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: tests.

- [ ] T055 - Agregar seccion tecnica de auditoria. Cubre: R54, R55.
  - Permitidos: UI detalle/tests.
  - Red: uid/source_page/raw_text no visibles en modo tecnico.
  - Green: seccion secundaria con datos tecnicos.
  - Validacion: test UI.
  - Evidencia: test.

- [ ] T056 - Probar entrada sin traduccion verificable. Cubre: R56.
  - Permitidos: mapper/UI tests.
  - Red: UI inventa placeholder como traduccion.
  - Green: mostrar solo datos disponibles y nota tecnica.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test.

- [ ] T057 - Corregir estados de busqueda. Cubre: R38, R39, R46.
  - Permitidos: SearchScreen/ViewModel/tests.
  - Red: error/vacio/corto ambiguos.
  - Green: estados diferenciados.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: tests.

### Fase I - Offline, dependencias y release

- [ ] T058 - Probar manifest sin internet. Cubre: R57.
  - Permitidos: manifest tests.
  - Red: prueba detecta permisos sensibles.
  - Green: remover permisos si existen.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test.

- [ ] T059 - Auditar imports de dependencias remotas. Cubre: R58, R59.
  - Permitidos: reporte en `progress/**`, Gradle si se prepara remocion.
  - Red: listar Firebase/Retrofit/OkHttp/Moshi/secrets.
  - Green: reporte clasifica usada/no usada.
  - Validacion: `rg -n "firebase|retrofit|okhttp|GEMINI|secrets" app gradle README.md`.
  - Evidencia: reporte.

- [ ] T060 - Remover dependencias no usadas. Cubre: R58, R59.
  - Permitidos: `app/build.gradle.kts`, `gradle/libs.versions.toml`, tests si
    imports cambian.
  - Red: build o audit muestra dependencia no usada.
  - Green: remover una tanda coherente.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: dependencias removidas.

- [ ] T061 - Corregir firma release. Cubre: R60.
  - Permitidos: `app/build.gradle.kts`, tests quality.
  - Red: test detecta `signingConfig = signingConfigs.getByName("debugConfig")`
    en release.
  - Green: remover debug signing de release.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: test.

- [ ] T062 - Configurar minificacion/shrinking seguro o justificar no hacerlo.
  Cubre: R62.
  - Permitidos: Gradle, `proguard-rules.pro`, docs/evidencia.
  - Red: release no optimizado o sin justificacion.
  - Green: activar si pasa, o documentar bloqueo tecnico con medicion.
  - Validacion: `.\gradlew assembleRelease`.
  - Evidencia: resultado.

- [ ] T063 - Medir tamano de artefacto. Cubre: R61.
  - Permitidos: `progress/impl_...md`.
  - Red: no hay tamano registrado.
  - Green: registrar APK/AAB generado y bytes/MB.
  - Validacion: `Get-ChildItem app\build\outputs -Recurse -Include *.apk,*.aab`.
  - Evidencia: ruta y tamano.

- [ ] T064 - Actualizar README final de uso offline. Cubre: R63, R64.
  - Permitidos: `README.md`, docs.
  - Red: README no explica DB validada/offline.
  - Green: documentar instalacion, validacion y estado.
  - Validacion: inspeccion y busqueda sin AI Studio/Gemini.
  - Evidencia: secciones modificadas.

### Fase J - Validacion final y review

- [ ] T065 - Ejecutar validacion Node completa. Cubre: R65, R66.
  - Permitidos: `progress/impl_...md`.
  - Red: registrar comando antes de ejecutar.
  - Green: ejecutar `npm test` y validadores SQLite.
  - Validacion: `npm test`.
  - Evidencia: salida resumida.

- [ ] T066 - Ejecutar validacion Android completa. Cubre: R65, R66.
  - Permitidos: `progress/impl_...md`.
  - Red: registrar comando antes de ejecutar.
  - Green: ejecutar tests Android.
  - Validacion: `.\gradlew testDebugUnitTest`.
  - Evidencia: salida resumida.

- [ ] T067 - Ejecutar build release. Cubre: R60-R62, R65.
  - Permitidos: `progress/impl_...md`.
  - Red: registrar estado release antes.
  - Green: ejecutar build release.
  - Validacion: `.\gradlew assembleRelease`.
  - Evidencia: salida y artefacto.

- [ ] T068 - Completar matriz final R -> test/comando. Cubre: R68.
  - Permitidos: `progress/impl_...md`.
  - Red: matriz incompleta.
  - Green: listar R1-R72 con test/comando.
  - Validacion: inspeccion en `progress/impl_...md`.
  - Evidencia: matriz.

- [ ] T069 - Ejecutar `init.ps1` final. Cubre: R71.
  - Permitidos: `progress/impl_...md`.
  - Red: registrar salida previa si falla.
  - Green: ejecutar y registrar salida.
  - Validacion: `.\init.ps1`.
  - Evidencia: salida OK.

- [ ] T070 - Crear review final. Cubre: R69, R70.
  - Permitidos: `progress/review_recovery_offline_dictionary.md`,
    `feature_list.json` si se aprueba cierre.
  - Red: review no existe.
  - Green: reviewer valida checkpoints, tasks, evidencia, git status y riesgos.
  - Validacion: `Test-Path progress/review_recovery_offline_dictionary.md`.
  - Evidencia: `APPROVED` o `CHANGES_REQUESTED`.

DOC_DONE:tasks -> specs/recovery_offline_dictionary/tasks.md
