#!/usr/bin/env sh
set -eu

if command -v pwsh >/dev/null 2>&1; then
  pwsh -NoProfile -ExecutionPolicy Bypass -File ./init.ps1
elif command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1
else
  echo "[WARN] PowerShell no esta disponible; validacion basica."
  test -f AGENTS.md
  test -f feature_list.json
  test -f specs/recovery_offline_dictionary/requirements.md
  test -f specs/recovery_offline_dictionary/tasks.md
  echo "[OK] Arnes documental presente."
fi
