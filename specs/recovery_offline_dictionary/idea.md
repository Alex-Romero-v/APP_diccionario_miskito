# Idea mejorada - recovery_offline_dictionary

## Idea original

Mejorar la app Android del diccionario miskito para que sea funcional: completar
la transcripcion, devolver resultados al buscar, enriquecer la salida para
consultas miskito y espanol, funcionar sin internet y ser ligera para
dispositivos de bajo costo.

## Idea mejorada

Recuperar la app como diccionario offline confiable. La recuperacion debe partir
de la auditoria: las SQLite actuales estan corruptas, el JSONL canonico contiene
6386 entradas, muchas traducciones estan dentro de `segments.definition_segment`
y no en `translations`, hay mojibake visible, la normalizacion no maneja Unicode
real, la busqueda no esta verificada, el detalle no representa sentidos de forma
lexicografica y el build conserva dependencias/configuracion heredadas de AI
Studio.

La mejora debe convertir el handoff JSONL en una SQLite valida, abrirla con
Room, buscar en miskito y espanol sin red, ordenar resultados por relevancia,
mostrar sentidos enriquecidos y producir un release liviano.

## Objetivo

Que un usuario en un dispositivo Android de bajo costo pueda instalar la app,
abrirla sin internet, escribir una palabra miskito o espanola y recibir
resultados reales del diccionario con detalle claro, fuente trazable y texto sin
mojibake.

## Usuarios y contexto

- Estudiantes, docentes, hablantes y aprendices de miskito.
- Uso offline en zonas con conectividad limitada.
- Dispositivos Android de gama baja con almacenamiento y memoria limitados.
- Fuente inicial: PDF "BYD Bila Yumhpa Diccionario Miskito dictionary 20
  diciembre 2024.pdf" y handoff JSONL extraido.

## Alcance incluido

- Reparar el pipeline Node que genera SQLite desde JSONL.
- Extraer traducciones desde `definition_segment` cuando `translations` este
  vacio.
- Corregir mojibake en datos generados y UI visible.
- Validar integridad SQLite antes de copiar asset.
- Corregir schema/Room/DAO si no coincide con la DB.
- Implementar busqueda miskito, espanol e ingles opcional.
- Mejorar ranking y salida de resultados.
- Mejorar detalle de entrada con sentidos, variantes, ejemplos, notas y pagina.
- Aligerar dependencias runtime.
- Agregar Gradle Wrapper o validacion equivalente reproducible.
- Documentar evidencia por tarea.

## Fuera de alcance

- No redisenar toda la identidad visual.
- No crear una API remota.
- No usar IA en runtime.
- No corregir manualmente todo el PDF linea por linea salvo que la auditoria de
  datos marque casos especificos de baja confianza.
- No agregar audio, OCR en dispositivo ni sincronizacion online.

## Supuestos

- El conteo esperado inicial es 6386 entradas.
- Si se deduplican entradas, la diferencia debe estar justificada por un reporte
  reproducible.
- El PDF no debe empaquetarse en el APK final.
- Espanol y miskito tienen prioridad sobre ingles.
- Ingles puede mostrarse como apoyo configurable si existe en los datos.
- La app debe seguir usando Room y Compose salvo bloqueo tecnico fuerte.

## Riesgos

- El JSONL puede estar completo en cantidad pero incompleto en estructura.
- Reparar mojibake puede requerir una politica determinista y pruebas con
  muestras reales.
- FTS4/FTS5 puede variar por version de SQLite/Room; se necesita fallback.
- El asset corrupto puede ocultar fallos de schema que solo apareceran con DB
  valida.
- Quitar dependencias puede romper imports no evidentes; debe hacerse con tests.

DOC_DONE:idea -> specs/recovery_offline_dictionary/idea.md
