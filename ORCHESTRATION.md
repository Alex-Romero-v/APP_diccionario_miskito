# ORCHESTRATION.md

## 1. Identidad del documento
Este documento define el algoritmo de orquestación autónoma, secuencial, determinista, bloqueante y verificable que debes ejecutar para construir la versión 1 de la aplicación Android offline **Diccionario Miskito**.
Trata este documento como contrato operativo obligatorio para CODEX.

## 2. Jerarquía normativa obligatoria
Aplica esta jerarquía de autoridad en cada decisión:
1. CONSTITUTION.md 
2. SPEC.md 
3. PLAN.md 
4. TASKS.md 
5. ORCHESTRATION.md 
6. MANUAL_DE_USO.md 

## 3. Principio rector de ejecución
Ejecuta siempre el siguiente ciclo:
1. Lee contratos
2. Selecciona primera tarea pendiente
3. Verifica precondiciones
4. Verifica límites de archivos
5. Escribe o ajusta prueba TDD
6. Ejecuta prueba fallida cuando aplique
7. Implementa cambio mínimo
8. Ejecuta validación exacta
9. Corrige dentro del alcance si falla
10. Marca estado
11. Emite token
12. Detente

## 4. Tokens oficiales 
Usa estos tokens oficiales:
[TASK_COMPLETE: TASK-ID] 
[TASK_BLOCKED: TASK-ID] 
...

Fin de ORCHESTRATION.md.
