# Verificacion del arnes SDD adaptado para APP_diccionario_miskito

$ErrorActionPreference = "Stop"
$exitCode = 0

function Ok($message) { Write-Host "[OK]    $message" -ForegroundColor Green }
function Warn($message) { Write-Host "[WARN]  $message" -ForegroundColor Yellow }
function Fail($message) {
    Write-Host "[FAIL]  $message" -ForegroundColor Red
    $script:exitCode = 1
}

Write-Host "-- 1. Archivos base del arnes --------------------------"

$required = @(
    "AGENTS.md",
    "feature_list.json",
    "progress/current.md",
    "progress/history.md",
    "CHECKPOINTS.md",
    "docs/specs.md",
    "docs/architecture.md",
    "docs/conventions.md",
    "docs/verification.md",
    "docs/audit-summary.md",
    "agents/leader.md",
    "agents/spec_author.md",
    "agents/implementer.md",
    "agents/reviewer.md",
    "specs/recovery_offline_dictionary/idea.md",
    "specs/recovery_offline_dictionary/requirements.md",
    "specs/recovery_offline_dictionary/design.md",
    "specs/recovery_offline_dictionary/tasks.md",
    "SPEC.md",
    "TASKS.md"
)

foreach ($file in $required) {
    if (Test-Path -LiteralPath $file -PathType Leaf) { Ok "Existe $file" }
    else { Fail "Falta $file" }
}

Write-Host ""
Write-Host "-- 2. Estructura Android -------------------------------"

if (Test-Path "settings.gradle.kts") { Ok "Existe settings.gradle.kts" } else { Fail "Falta settings.gradle.kts" }
if (Test-Path "app/build.gradle.kts") { Ok "Existe app/build.gradle.kts" } else { Fail "Falta app/build.gradle.kts" }
if (Test-Path "app/src/main/AndroidManifest.xml") { Ok "Existe AndroidManifest.xml" } else { Fail "Falta AndroidManifest.xml" }
if ((Test-Path "gradlew.bat") -or (Test-Path "gradlew")) { Ok "Existe Gradle Wrapper" } else { Warn "No existe Gradle Wrapper; esta correccion queda especificada en task T002" }

Write-Host ""
Write-Host "-- 3. Validando feature_list.json ----------------------"

try {
    $json = Get-Content -Raw feature_list.json | ConvertFrom-Json
    $inProgress = @($json.features | Where-Object { $_.status -eq "in_progress" })
    if ($inProgress.Count -gt 1) { Fail "Hay mas de una feature in_progress" } else { Ok "Como maximo una feature in_progress" }
    $feature = $json.features | Where-Object { $_.name -eq "recovery_offline_dictionary" }
    if ($feature -and $feature.status -eq "spec_ready") { Ok "Feature principal en spec_ready" } else { Fail "Feature principal no esta en spec_ready" }
} catch {
    Fail "feature_list.json invalido: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "-- 4. Validando trazabilidad documental ----------------"

$requirementsText = Get-Content -Raw "specs/recovery_offline_dictionary/requirements.md"
$tasksText = Get-Content -Raw "specs/recovery_offline_dictionary/tasks.md"
$matches = [regex]::Matches($requirementsText, "(?m)^### (R\d+)\b")
$requirementIds = @($matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object {
    [int]($_ -replace '^R', '')
} -Unique)
if ($requirementIds.Count -eq 0) {
    Fail "No se encontraron requirements R<n>"
} else {
    Ok "Requirements detectados: $($requirementIds.Count)"
}
foreach ($rid in $requirementIds) {
    if ($tasksText -match "(^|[^A-Za-z0-9_])$rid([^A-Za-z0-9_]|$)") { Ok "$rid cubierto en tasks.md" }
    else { Fail "$rid no aparece en tasks.md" }
}

$taskMatches = [regex]::Matches($tasksText, "(?m)^- \[ \] T\d{3}\b")
if ($taskMatches.Count -gt 0) { Ok "Tasks pendientes detectadas: $($taskMatches.Count)" }
else { Fail "No se encontraron tasks pendientes con formato Tnnn" }

Write-Host ""
Write-Host "-- 5. Resumen ------------------------------------------"
if ($exitCode -eq 0) { Ok "Arnes documental listo. Espera aprobacion humana antes de implementar." }
else { Fail "Arnes documental incompleto." }
exit $exitCode
