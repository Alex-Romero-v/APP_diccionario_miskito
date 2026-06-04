# CONSTITUTION.md

## 1. Identidad operativa del proyecto
Desarrolla una aplicación Android nativa, liviana, offline-first y verificable para consultar el diccionario miskito basado en **BÎLA YUMHPA – MISKITU-ENGLISH-ESPAÑOL**.
Construye la versión 1 como una herramienta diaria de consulta, no como una app experimental ni como un visor de PDF.
Transforma el contenido documental del diccionario en una base SQLite local estructurada, consultable sin internet y optimizada para dispositivos Android de bajos recursos.

Prioriza siempre:
1. utilidad diaria;
2. funcionamiento sin internet;
3. búsqueda rápida;
4. claridad de lectura;
5. bajo consumo de recursos;
6. reproducibilidad del pipeline;
7. preservación del texto original;
8. verificabilidad automática;
9. ausencia de permisos innecesarios;
10. arquitectura mantenible.

No implementes funciones fuera del alcance de la versión 1.

---

## 2. Objetivo rector
Permite que una persona busque palabras miskitas, españolas o inglesas sin conexión a internet y vea resultados claros con traducciones, variantes, ejemplos, notas, referencias y datos de origen.

Cumple este objetivo sin depender de:
1. cuentas de usuario;
2. conexión permanente;
3. servidores remotos;
4. inteligencia artificial generativa;
5. OCR en tiempo de uso;
6. audio;
7. cámara;
8. permisos sensibles;
9. sincronización comunitaria;
10. edición abierta del diccionario desde la app.

---

## 3. Alcance obligatorio de la versión 1
Implementa únicamente las capacidades necesarias para que la app funcione como diccionario offline útil, estable y práctico.

Incluye obligatoriamente:
1. búsqueda offline en miskito;
2. búsqueda offline desde español hacia miskito;
3. búsqueda offline desde inglés hacia miskito;
4. búsqueda sin circunflejos;
5. búsqueda por variantes ortográficas registradas;
6. visualización de entradas principales;
7. visualización de subentradas cuando existan;
8. visualización de traducción al español;
9. visualización de traducción al inglés;
10. visualización de ejemplos en miskito;
11. visualización de traducciones de ejemplos al español;
12. visualización opcional de traducciones de ejemplos al inglés;
13. visualización de notas del diccionario;
14. visualización de referencias o códigos de fuente;
15. favoritos locales;
16. historial local;
17. ajustes básicos;
18. tamaño de letra configurable;
19. modo claro;
20. modo oscuro;
21. pantalla acerca del diccionario;
22. base SQLite local incluida con la app;
23. pipeline interno reproducible para convertir el diccionario fuente en base SQLite;
24. conservación de página de origen;
25. conservación de `raw_text` por entrada;
26. reporte de extracción;
27. reporte de errores;
28. validaciones automáticas de integridad;
29. pruebas unitarias;
30. pruebas instrumentadas mínimas.

---

## 4. Exclusiones obligatorias de la versión 1
No implementes estas funciones en la versión 1:
1. traducción automática de frases completas;
2. inteligencia artificial generativa;
3. chat en miskito;
4. OCR dentro de la app;
5. cámara;
6. audio de pronunciación;
7. cuentas de usuario;
8. inicio de sesión;
9. sincronización comunitaria;
10. edición abierta de palabras;
11. sugerencias públicas sin moderación;
12. conjugador verbal completo;
13. analizador morfológico avanzado;
14. curso completo de miskito;
15. juegos;
16. gamificación pesada;
17. anuncios;
18. recolección de datos personales;
19. analíticas invasivas;
20. visor interno del PDF completo como función principal;
21. dependencia obligatoria de internet;
22. permisos de cámara;
23. permisos de micrófono;
24. permisos de ubicación;
25. permisos de contactos;
26. permisos de SMS;
27. permisos de teléfono;
28. permisos amplios de almacenamiento externo.

Si una tarea intenta introducir una exclusión, bloquéala.
Emite:
`[TASK_BLOCKED: SCOPE_V1_EXCLUSION]`

---

## 5. Principios no negociables

### 5.1 Offline primero
Garantiza que la app pueda instalarse, abrirse, buscar, mostrar detalles, guardar favoritos y consultar historial sin internet.
No introduzcas dependencias obligatorias de red para funciones principales.

### 5.2 Búsqueda tolerante
Permite buscar sin circunflejos. Normaliza:
- `â` como `a`;
- `ê` como `e`;
- `î` como `i`;
- `ô` como `o`;
- `û` como `u`;
- `Â` como `a`;
- `Ê` como `e`;
- `Î` como `i`;
- `Ô` como `o`;
- `Û` como `u`.
Conserva siempre la forma visible original del diccionario.

### 5.3 Verificabilidad
No marques ninguna tarea como completada si no ejecutaste el comando exacto de validación definido para esa tarea.
No aceptes verificaciones manuales como sustituto de pruebas automatizadas cuando exista comando de validación.

### 5.4 Atomicidad
Modifica solamente los archivos permitidos por la tarea activa.
No combines tareas.
No agregues refactors laterales.
No cambies arquitectura, nombres, dependencias ni comportamiento fuera del alcance explícito de la tarea activa.

### 5.5 Datos auditables
Conserva `raw_text` y `source_page` para cada entrada estructurada cuando sea posible.
No elimines información original durante la extracción.
Si una entrada no puede clasificarse con confianza, preserva el texto original y márcala como baja confianza.

### 5.6 Rendimiento primero
No cargues todo el diccionario en memoria.
Consulta una tabla de búsqueda optimizada antes de recuperar detalles relacionales.
Evita animaciones pesadas, imágenes grandes, dependencias innecesarias y consultas costosas en cada pulsación.

### 5.7 Privacidad local
No recolectes datos personales.
No envíes historial, favoritos ni búsquedas a servidores.
No uses anuncios.
No uses analíticas invasivas.

### 5.8 Compatibilidad
Diseña para celulares Android de bajos recursos.
Mantén la app liviana, clara y estable.
No elijas una solución visual sofisticada si perjudica rendimiento, legibilidad o mantenimiento.

---

## 6. Stack técnico normativo
Usa este stack salvo que una tarea posterior justifique una excepción explícita y verificable:
Lenguaje: Kotlin Plataforma: Android nativo UI: Jetpack Compose Base local: SQLite mediante Room Búsqueda: SQLite FTS4 compatible con Android Ajustes: DataStore Preferences Arquitectura: MVVM + Repository Concurrencia: Kotlin Coroutines + Flow Pruebas unitarias: JUnit Pruebas Android: AndroidX Test Build: Gradle Kotlin DSL Distribución: APK debug para pruebas y AAB release cuando corresponda 

No introduzcas frameworks multiplataforma.
No conviertas la app a Flutter, React Native, Ionic ni webview.
No agregues backend obligatorio.

## 7. Arquitectura obligatoria
Organiza el código bajo separación estricta de responsabilidades.
Usa esta estructura conceptual:
app/ src/main/java/.../ ui/ search/ entrydetail/ favorites/ history/ phrases/ settings/ about/ navigation/ theme/ viewmodel/ domain/ normalizer/ search/ formatting/ data/ local/ database/ dao/ entity/ fts/ repository/ preferences/ di/ src/main/assets/ dictionary.db tools/ dictionary-pipeline/ src/ tests/ input/ output/ docs/ 

Respeta estas reglas:
• Coloca lógica de normalización en domain/normalizer.
• Coloca ranking de búsqueda en domain/search.
• Coloca consultas SQL y DAO en data/local/dao.
• Coloca entidades Room en data/local/entity.
• Coloca modelos FTS en data/local/fts.
• Coloca repositorios en data/repository.
• Coloca estado de UI en ViewModels.
• No ejecutes SQL desde composables.
• No accedas a Room directamente desde UI.
• No mezcles pipeline de conversión con código runtime Android.
• No guardes datos del usuario en assets.
• No incluyas favoritos ni historial precargados en la base distribuida.

## 8. Modelo de datos obligatorio
Implementa como mínimo estas tablas conceptuales:
• entries;
• translations;
• variants;
• examples;
• notes;
• references;
• entry_references;
• search_index;
• favorites;
• history;
• metadata;
• phrases.

8.1 Tabla entries
Debe representar entradas principales, subentradas, frases o expresiones.
Campos mínimos:
id headword normalized_headword sort_key entry_type parent_entry_id part_of_speech raw_part_of_speech source_page raw_text verification_status extraction_confidence has_examples has_notes has_variants created_at updated_at 

8.2 Tabla translations
Debe contener equivalencias asociadas a entradas.
Campos mínimos:
id entry_id spanish_text english_text translation_order is_literal note 

8.3 Tabla variants
Debe permitir buscar formas alternativas sin duplicar entradas.
Campos mínimos:
id entry_id variant_text normalized_variant variant_type note 
Tipos permitidos:
also_spelled former_spelling alternative no_diacritic short_form unknown 

8.4 Tabla examples
Debe preservar ejemplos y traducciones.
Campos mínimos:
id entry_id miskito_text spanish_text english_text source_code source_detail example_order is_literal_translation 

8.5 Tabla notes
Debe conservar notas separadas de traducciones.
Campos mínimos:
id entry_id note_type note_text note_order 
Tipos permitidos:
grammar usage spelling warning see_also literal editorial unknown 

8.6 Tabla references
Debe expandir códigos de fuente cuando sea posible.
Campos mínimos:
code short_name full_description language reference_type 

8.7 Tabla entry_references
Debe vincular referencias con entradas, ejemplos o notas.
Campos mínimos:
id entry_id example_id note_id reference_code raw_reference_text 

8.8 Tabla search_index
Debe ser una tabla FTS optimizada.
Debe indexar:
entry_id headword normalized_headword variants_text spanish_text english_text examples_text notes_text 

No busques directamente en todas las tablas relacionales durante cada pulsación del usuario.

8.9 Tabla favorites
Debe guardar favoritos locales.
Campos mínimos:
entry_id created_at 

No precargues favoritos.

8.10 Tabla history
Debe guardar historial local.
Campos mínimos:
entry_id last_opened_at open_count 

Actualiza open_count cuando el usuario abra repetidamente una entrada.

8.11 Tabla metadata
Debe describir la base instalada.
Campos mínimos:
key value 
Claves obligatorias:
dictionary_name dictionary_source dictionary_date database_version build_date entries_count examples_count app_min_supported_version 

8.12 Tabla phrases
Debe existir solo si el pipeline puede poblarla con confianza suficiente.
Campos mínimos:
id phrase_text normalized_phrase spanish_text english_text category source_page raw_text 
Categorías permitidas:
greeting farewell expression question common_phrase unknown 

## 9. Reglas obligatorias de normalización
Implementa un componente llamado:
MiskitoTextNormalizer 

Debe cumplir:
• convierte a minúsculas;
• recorta espacios al inicio;
• recorta espacios al final;
• colapsa espacios múltiples;
• convierte circunflejos a vocal simple;
• normaliza vocales mayúsculas con circunflejo;
• elimina puntuación superficial para búsqueda;
• conserva guiones internos cuando sean relevantes;
• no altera el texto visible presentado al usuario;
• no destruye raw_text.

Casos obligatorios:
"BÎLA" -> "bila" " Gâd " -> "gad" "ÂISA" -> "aisa" "bîla." -> "bila" "aisa-yapti" -> "aisa-yapti" 
Crea pruebas unitarias para cada caso.

## 10. Reglas obligatorias de búsqueda
Implementa búsqueda con debounce entre:
250 ms y 350 ms 

Si la consulta tiene menos de 2 caracteres, muestra estado inicial, resultados limitados o mensaje de longitud mínima.
Ordena relevancia así:
• coincidencia exacta con headword;
• coincidencia exacta con normalized_headword;
• coincidencia exacta con variante;
• coincidencia por inicio de headword;
• coincidencia por inicio de variante;
• coincidencia dentro de traducción española;
• coincidencia dentro de traducción inglesa;
• coincidencia dentro de ejemplos;
• coincidencia dentro de notas.

La búsqueda debe soportar:
• texto miskito;
• texto español;
• texto inglés;
• palabras con circunflejo;
• palabras sin circunflejo;
• variantes;
• palabras compuestas;
• búsqueda parcial.

Mensaje obligatorio sin resultados:
No se encontró esta palabra. Pruebe escribirla sin marcas, revise la ortografía o busque solo una parte de la palabra. 

## 11. Pantallas obligatorias
Implementa estas pantallas:
• búsqueda;
• detalle de entrada;
• favoritos;
• historial;
• frases cuando existan datos confiables;
• ajustes;
• acerca del diccionario.

11.1 Pantalla de búsqueda
Debe contener:
• barra de búsqueda;
• placeholder: Buscar en miskito, español o inglés;
• filtros simples: Todo, Miskito, Español, Inglés;
• lista de resultados;
• estado inicial;
• estado sin resultados;
• estado de error de base;
• indicador discreto de carga si la consulta tarda.

Cada resultado debe mostrar:
• headword;
• categoría gramatical si existe;
• traducción breve al español;
• etiqueta de variante si aplica;
• indicador de ejemplos si existen;
• indicador de notas si existen.

11.2 Pantalla de detalle
Debe contener secciones en este orden:
• encabezado;
• traducciones;
• variantes;
• ejemplos;
• notas;
• referencias;
• información técnica mínima.

El encabezado debe mostrar:
• palabra principal;
• categoría gramatical;
• botón favorito;
• etiqueta En revisión si aplica.

Traducciones:
• muestra español primero;
• muestra inglés según ajuste del usuario.

Ejemplos:
• muestra oración miskita;
• muestra traducción literal al español;
• muestra inglés opcionalmente;
• indica si la traducción es literal.

Información técnica mínima:
• página de origen;
• versión de base;
• estado de revisión.

11.3 Pantalla de favoritos
Debe permitir:
• ver favoritos;
• abrir entrada favorita;
• quitar favorito;
• buscar dentro de favoritos si hay muchos.

Mensaje vacío obligatorio:
Aún no ha guardado palabras favoritas. 

11.4 Pantalla de historial
Debe permitir:
• ver entradas recientes;
• ordenar por last_opened_at descendente;
• abrir entrada;
• borrar historial completo.

Mensaje vacío obligatorio:
Aún no ha consultado palabras. 

11.5 Pantalla de frases
Muestra esta pantalla solo si el pipeline extrajo frases confiables.
Si no hay datos confiables, ocúltala del menú o muestra:
La sección de frases todavía no está disponible en esta versión del diccionario. 

11.6 Pantalla de ajustes
Debe incluir:
• tamaño de letra: pequeño, normal, grande, muy grande;
• tema: sistema, claro, oscuro;
• mostrar inglés: siempre, solo en detalle, ocultar;
• borrar historial;
• versión de app;
• versión del diccionario.

11.7 Pantalla acerca del diccionario
Debe incluir:
• nombre del diccionario;
• fecha o versión;
• descripción breve;
• versión de base local;
• cantidad de entradas;
• aclaración offline;
• créditos;
• licencia o estado de permisos;
• aviso sobre traducciones literales;
• canal de soporte si existe.

Texto base obligatorio:
Esta aplicación está basada en el diccionario BÎLA YUMHPA – MISKITU-ENGLISH-ESPAÑOL. El contenido fue estructurado para permitir consulta rápida sin conexión a internet. Las traducciones de ejemplos pueden ser literales, siguiendo el estilo del diccionario original. 

## 12. Pipeline de conversión obligatorio
Crea una herramienta interna reproducible para convertir el diccionario fuente en base SQLite.
No copies manualmente el contenido del diccionario dentro del código Android.
El pipeline debe recibir:
Archivo PDF o texto estructurado extraído del diccionario 
Debe producir:
dictionary.db metadata.json extraction_report.json errors_report.csv parser_confidence_report.csv 

Ejecuta estas fases:
• extrae texto por página;
• conserva número de página;
• detecta bloques de entrada;
• detecta palabra principal;
• detecta categoría gramatical;
• detecta traducción inglesa;
• detecta traducción española;
• detecta variantes;
• detecta ejemplos;
• detecta notas;
• detecta referencias;
• detecta subentradas;
• normaliza texto;
• genera índices;
• valida integridad;
• crea SQLite;
• ejecuta pruebas de integridad;
• genera reportes.

Regla crítica:
Cada entrada estructurada debe conservar raw_text original. 

## 13. Reglas de extracción
Detecta patrones como:
Palabra (categoría) – inglés / español 
Detecta marcadores:
a/t: fs/ea: Alt: See also Ver también see/ver Note Nota Ex Ej Ex/Ej ExEj Construct 

13.1 Entrada principal
Trata como entrada principal un bloque que inicia con palabra o frase miskita seguida opcionalmente por categoría y traducción.

13.2 Subentrada
Relaciona subentradas con parent_entry_id cuando sea posible.
No inventes relaciones si la evidencia estructural es insuficiente.

13.3 Ejemplos
Separa, cuando sea posible:
• texto miskito;
• traducción inglesa;
• traducción española;
• referencia.
Si no puedes separar con confianza, conserva el bloque en raw_text y marca baja confianza.

13.4 Notas
Guarda notas en la tabla notes.
No mezcles notas con traducciones principales.

13.5 Variantes
Guarda variantes en la tabla variants.
No crees entradas duplicadas para variantes.
Si el usuario busca una variante, devuelve la entrada principal.

## 14. Manejo de baja confianza
Cuando el parser no pueda clasificar una entrada con seguridad:
• conserva raw_text;
• conserva source_page si existe;
• asigna extraction_confidence = low;
• asigna verification_status = unknown;
• incluye el caso en parser_confidence_report.csv;
• evita mostrar campos mal separados como definitivos;
• permite mostrar estructura mínima en la app.
Texto obligatorio para detalle de baja confianza:
Entrada pendiente de revisión estructural. 

## 15. Validaciones obligatorias de datos
Antes de generar la base final, valida:
• ninguna entrada tiene id vacío;
• ninguna entrada tiene headword vacío;
• toda entrada tiene normalized_headword;
• toda traducción pertenece a una entrada existente;
• todo ejemplo pertenece a una entrada existente;
• toda variante pertenece a una entrada existente;
• toda nota pertenece a una entrada existente;
• no hay variantes duplicadas para la misma entrada;
• no hay favoritos precargados;
• no hay historial precargado;
• existe tabla metadata;
• existe tabla FTS;
• el índice FTS se puede consultar;
• la base SQLite abre correctamente;
• entries_count en metadata coincide con conteo real;
• examples_count en metadata coincide con conteo real;
• cada entrada con has_examples = true tiene ejemplos;
• cada entrada con has_notes = true tiene notas;
• cada entrada con has_variants = true tiene variantes;
• cada entry_reference.reference_code existe en references o queda registrado como referencia cruda no expandida.

Si falla una validación, bloquea la generación de base final.
Emite:
[TASK_BLOCKED: DATA_VALIDATION_FAILED]

## 16. Estados obligatorios de interfaz
Implementa estos estados:
• inicial sin búsqueda;
• escribiendo;
• cargando;
• con resultados;
• sin resultados;
• error de base de datos;
• detalle cargado;
• detalle no encontrado;
• favoritos vacío;
• historial vacío;
• frases vacío;
• frases no disponible;
• ajustes cargados;
• actualización no disponible si se implementa;
• sin internet para actualización si se implementa.

Mensaje obligatorio de error de base:
No se pudo abrir el diccionario local. Intente reiniciar la aplicación. 
Mensaje obligatorio sin internet en actualización:
No hay conexión disponible para buscar actualizaciones. El diccionario local sigue funcionando sin internet. 

## 17. Reglas de permisos
No declares permisos sensibles en la versión 1.
Permiso permitido solo si existe actualización manual:
<uses-permission android:name="android.permission.INTERNET" /> 
Permisos prohibidos:
CAMERA RECORD_AUDIO ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION READ_CONTACTS WRITE_CONTACTS READ_SMS SEND_SMS CALL_PHONE READ_PHONE_STATE READ_EXTERNAL_STORAGE WRITE_EXTERNAL_STORAGE MANAGE_EXTERNAL_STORAGE READ_CALENDAR WRITE_CALENDAR 

Si una tarea agrega un permiso prohibido, bloquéala.
Emite:
[TASK_BLOCKED: FORBIDDEN_PERMISSION]

## 18. Reglas de actualización del diccionario
La actualización remota del diccionario es opcional en la versión 1.
Si se implementa, debe ser manual y segura.
Flujo obligatorio:
• usuario abre ajustes;
• usuario pulsa Buscar actualización del diccionario;
• app consulta metadata remota;
• app muestra versión, fecha y tamaño;
• usuario confirma descarga;
• app descarga a archivo temporal;
• app verifica checksum;
• app valida estructura de base;
• app reemplaza base anterior solo después de validación exitosa;
• app conserva base anterior si falla cualquier paso.

Prohibido:
• descargar automáticamente sin permiso;
• reemplazar base durante descarga;
• dejar app sin diccionario si falla descarga;
• descargar usando datos móviles sin confirmación clara;
• hacer que la búsqueda dependa de internet.

Si no se implementa actualización en V1, no agregues permiso INTERNET.

## 19. Reglas de rendimiento
Cumple estos objetivos:
• pantalla inicial visible en menos de 2 segundos en dispositivo bajo razonable;
• búsqueda común completada en menos de 300 ms después del debounce;
• detalle abierto sin bloqueo perceptible;
• base no cargada completa en memoria;
• consultas ejecutadas fuera del hilo principal;
• lista de resultados paginada o limitada;
• uso bajo de RAM;
• APK/AAB sin recursos decorativos pesados;
• sin animaciones complejas;
• sin librerías innecesarias.

Si una implementación carga todo el diccionario en memoria para buscar, bloquéala.
Emite:
[TASK_BLOCKED: PERFORMANCE_REGRESSION]

## 20. Reglas de diseño visual
Diseña interfaz sobria y legible.
Cumple:
• fondo limpio;
• alto contraste;
• texto legible;
• botones fáciles de tocar;
• pocas pantallas;
• separación clara entre traducción, ejemplo y nota;
• tarjetas simples;
• iconos prudentes;
• modo claro;
• modo oscuro;
• tamaño de letra configurable.

Usa fuente del sistema Android.
No incluyas fuentes personalizadas salvo necesidad comprobada para caracteres miskitos.
Renderiza correctamente:
â ê î ô û Â Ê Î Ô Û ñ á é í ó ú ¿ ? ¡ ! 

## 21. Reglas de privacidad
Implementa privacidad por diseño.
Obligatorio:
• guarda favoritos solo localmente;
• guarda historial solo localmente;
• permite borrar historial;
• no envíes consultas a servidores;
• no envíes favoritos a servidores;
• no envíes historial a servidores;
• no uses publicidad;
• no uses analíticas invasivas;
• no requieras cuenta;
• no requieras inicio de sesión.

Si una tarea intenta recolectar datos personales sin autorización explícita, bloquéala.
Emite:
[TASK_BLOCKED: PRIVACY_VIOLATION]

## 22. Reglas de pruebas
Toda tarea de implementación debe incluir prueba antes o junto con el cambio.
Usa TDD cuando la tarea modifique lógica de:
• normalización;
• búsqueda;
• ranking;
• parser;
• validación de base;
• repositorios;
• favoritos;
• historial;
• preferencias;
• formateo de entradas.

Ninguna tarea puede completarse sin comando exacto de validación.
Comandos base permitidos:
./gradlew testDebugUnitTest 
./gradlew connectedDebugAndroidTest 
./gradlew lintDebug 
./gradlew assembleDebug 
./gradlew :app:check 
python -m pytest tools/dictionary-pipeline/tests 
python tools/dictionary-pipeline/src/build_dictionary.py --input tools/dictionary-pipeline/input --output tools/dictionary-pipeline/output 
python tools/dictionary-pipeline/src/validate_dictionary_db.py --db tools/dictionary-pipeline/output/dictionary.db 

Cada tarea posterior debe declarar exactamente qué comando ejecutar.
No uses comandos genéricos como “probar la app” o “verificar manualmente”.

## 23. Protocolo operativo obligatorio para CODEX
Ejecuta siempre este ciclo:
1. Lee CONSTITUTION.md. 
2. Lee SPEC.md si existe. 
3. Lee PLAN.md si existe. 
4. Lee TASKS.md si existe. 
5. Lee ORCHESTRATION.md si existe. 
6. Selecciona exactamente una tarea pendiente. 
7. Verifica precondiciones. 
8. Confirma archivos permitidos y prohibidos. 
9. Escribe o ajusta prueba fallida. 
10. Ejecuta comando de prueba esperado para confirmar fallo cuando aplique. 
11. Modifica solo archivos permitidos. 
12. Ejecuta comando exacto de validación. 
13. Si falla, corrige dentro del alcance. 
14. Si sigue fallando, marca tarea bloqueada. 
15. Si pasa, marca tarea completada. 
16. Emite token de estado. 

Tokens obligatorios:
[TASK_COMPLETE: <ID>] 
[TASK_BLOCKED: <ID>: <REASON>] 
[VALIDATION_PASSED: <COMMAND>] 
[VALIDATION_FAILED: <COMMAND>] 
[SCOPE_VIOLATION: <ID>] 

No emitas [TASK_COMPLETE: <ID>] sin validación exitosa.

## 24. Reglas de modificación de archivos
Antes de modificar, identifica:
• archivos permitidos;
• archivos prohibidos;
• archivos de solo lectura;
• comando de validación;
• resultado esperado.

Si necesitas modificar un archivo no permitido por la tarea activa, detente.
Emite:
[TASK_BLOCKED: FILE_SCOPE_VIOLATION]

No hagas cambios oportunistas.
No reformatees archivos no relacionados.
No actualices dependencias sin tarea explícita.
No cambies minSdk, targetSdk, package name, esquema de base ni navegación global sin tarea explícita.

## 25. Reglas de dependencias
No agregues dependencias sin cumplir todas estas condiciones:
• la dependencia es necesaria para una tarea activa;
• no existe solución simple con librerías ya presentes;
• no introduce permisos innecesarios;
• no aumenta excesivamente tamaño;
• no degrada compatibilidad;
• queda documentada en PLAN.md;
• queda cubierta por validación.

Si una dependencia introduce red, tracking, anuncios o permisos sensibles, bloquéala.
Emite:
[TASK_BLOCKED: UNSAFE_DEPENDENCY]

## 26. Reglas de base preempaquetada
Incluye dictionary.db como asset solo cuando pase validaciones.
No incluyas una base parcial como final.
No incluyas datos de usuario en dictionary.db.
No incluyas favoritos precargados.
No incluyas historial precargado.

La base incluida debe contener metadata suficiente para mostrar:
• nombre del diccionario;
• versión de base;
• fecha de build;
• cantidad de entradas;
• cantidad de ejemplos.

## 27. Criterios globales de aceptación
La versión 1 será aceptable solo si cumple:
• instala correctamente;
• abre sin internet;
• busca sin internet;
• permite búsqueda miskito;
• permite búsqueda español;
• permite búsqueda inglés;
• encuentra palabras sin circunflejos;
• reconoce variantes cargadas;
• muestra resultados claros;
• muestra detalle de entrada;
• muestra traducciones;
• muestra ejemplos cuando existen;
• muestra notas cuando existen;
• muestra referencias cuando existen;
• permite guardar favoritos;
• permite quitar favoritos;
• muestra favoritos;
• registra historial;
• muestra historial;
• permite borrar historial;
• permite cambiar tamaño de letra;
• permite modo oscuro;
• no pide permisos innecesarios;
• no se cierra durante búsquedas comunes;
• conserva raw_text;
• conserva página de origen;
• permite regenerar base con pipeline;
• genera reporte de extracción;
• reporta entradas problemáticas;
• funciona aceptablemente en dispositivo de bajos recursos.

## 28. Condiciones de bloqueo global
Bloquea cualquier tarea que:
• rompa funcionamiento offline;
• agregue permisos prohibidos;
• elimine raw_text;
• elimine source_page;
• cargue todo el diccionario en memoria para buscar;
• duplique entradas por variantes;
• mezcle notas con traducciones sin estructura;
• introduzca IA generativa;
• introduzca cuentas;
• introduzca anuncios;
• introduzca tracking;
• dependa de internet para buscar;
• modifique archivos fuera de alcance;
• no tenga prueba verificable;
• no tenga comando exacto de validación;
• no preserve base anterior durante actualización;
• oculte errores de extracción;
• marque tareas como completas sin validación.
Token obligatorio:
[TASK_BLOCKED: GLOBAL_CONSTITUTION_VIOLATION]

## 29. Auditoría obligatoria por tarea
Al terminar cada tarea, registra:
ID de tarea: 
Archivos modificados: 
Archivos prohibidos tocados: 
Pruebas agregadas: 
Comando ejecutado: 
Resultado: 
Limitaciones: 
Token final: 

Si no puedes ejecutar el comando de validación, no marques la tarea como completada.
Emite:
[TASK_BLOCKED: VALIDATION_NOT_EXECUTED]

## 30. Regla final de autoridad
Este documento gobierna todas las fases posteriores.
Si SPEC.md, PLAN.md, TASKS.md, ORCHESTRATION.md o MANUAL_DE_USO.md contradicen esta constitución, prevalece esta constitución hasta que el usuario autorice una nueva versión de CONSTITUTION.md.

No interpretes ambigüedades para ampliar alcance.
Cuando exista duda técnica razonable, elige la opción que preserve:
• offline-first;
• bajo consumo;
• datos auditables;
• pruebas automatizadas;
• menor alcance;
• mayor claridad para usuarios de bajos recursos.

Fin de CONSTITUTION.md.
