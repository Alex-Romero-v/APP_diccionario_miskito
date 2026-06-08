# Spec Driven Development para este repo

Este repositorio usa SDD portable inspirado en `Alex-Romero-v/Arnes`.

## Documentos por feature

```text
specs/<feature>/
|-- idea.md
|-- requirements.md
|-- design.md
`-- tasks.md
```

## Estados

- `pending`: idea sin documentacion completa.
- `spec_ready`: documentacion lista; espera aprobacion humana.
- `in_progress`: implementacion aprobada.
- `done`: implementacion verificada.
- `blocked`: bloqueo critico documentado.

## Requirements

Cada requirement usa ID estable `R<n>` y forma EARS:

- Ubicuo: `El sistema DEBE ...`
- Evento: `CUANDO ..., el sistema DEBE ...`
- Estado: `MIENTRAS ..., el sistema DEBE ...`
- No deseado: `SI ... ENTONCES el sistema DEBE ...`

Cada `R<n>` debe aparecer en `tasks.md` y tener prueba o verificacion concreta.

## Tasks

Cada task tiene:

- ID `T<n>`;
- checkbox `[ ]` o `[x]`;
- descripcion ejecutable;
- requirements cubiertos;
- archivos esperados;
- comando de verificacion.
- precondiciones cuando existan;
- archivos permitidos y prohibidos cuando la task pueda invadir otro subsistema;
- fases Red, Green y Refactor;
- evidencia esperada.

El implementer ejecuta una task por vez, en orden.

Una task es demasiado grande si requiere cambiar pipeline, Android y release en
el mismo paso. En ese caso debe dividirse antes de implementar.
