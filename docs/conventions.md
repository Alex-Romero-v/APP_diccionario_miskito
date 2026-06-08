# Convenciones

## Codificacion

- Todo archivo nuevo debe ser UTF-8.
- No introducir mojibake.
- Preservar diacriticos reales en campos canonicos.
- Los campos normalizados pueden remover diacriticos, pero nunca reemplazan el
  texto mostrado al usuario.

## Datos

- `entries.id` puede ser entero interno, pero debe conservarse `uid` de origen.
- Toda entrada debe conservar `source_page` y `raw_text` si existen.
- Toda regla de deduplicacion debe documentarse.
- Si una entrada no tiene traduccion verificable, no inventar una.

## Android

- Kotlin con patrones existentes de Room, Hilt, ViewModel y Compose.
- Tests locales para repositorios, normalizador, ranking y Room.
- UI sin permisos sensibles.
- Release sin firma debug.

## Documentacion de evidencia

- Cada task completada deja comando, resultado y archivos tocados en
  `progress/impl_recovery_offline_dictionary.md`.
- Cada cambio de conteo de datos se documenta con antes/despues.
