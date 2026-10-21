$ErrorActionPreference = 'Stop'
# Synthetic data only: load declarations, never module/config/executors.
. 'C:/Users/kotar/.codex/research/invoke-atomic-20261017/Private/AtomicClassSchema.ps1'
. 'C:/Users/kotar/.codex/research/invoke-atomic-20261017/Public/New-Atomic.ps1'
$warnings = @()
$value = New-AtomicTestInputArgument -Name synthetic_count -Description synthetic -Type Integer -Default 'not-an-integer' -WarningVariable warnings -WarningAction SilentlyContinue
if ($value.default -ne 'not-an-integer') { throw 'Expected unchanged synthetic default' }
if ($warnings.Count -ne 1) { throw 'Expected numeric warning about the type label' }
$validWarnings = @()
$valid = New-AtomicTestInputArgument -Name synthetic_count -Description synthetic -Type Integer -Default '7' -WarningVariable validWarnings -WarningAction SilentlyContinue
if ($valid.default -ne '7' -or $validWarnings.Count -ne 1) { throw 'Valid default control failed' }
$now = [DateTime]::Parse('2026-10-17T12:00:00Z').ToUniversalTime()
$cutoff = $now.AddDays(30)
$old = $now.AddDays(-60)
$future = $now.AddDays(31)
if ($old -gt $cutoff) { throw 'Old timestamp unexpectedly selected' }
if (-not ($future -gt $cutoff)) { throw 'Future timestamp control failed' }
[ordered]@{ checks = 4; invalid_default = $value.default; valid_default = $valid.default; warning_invalid = @($warnings | ForEach-Object { $_.Message }); warning_valid = @($validWarnings | ForEach-Object { $_.Message }); rotation_predicate_old_selected = ($old -gt $cutoff); rotation_predicate_future_selected = ($future -gt $cutoff); limits = 'Authoring declarations and extracted date predicate only; no scheduled task, service, deletion, module import, test command, network or detector.' } | ConvertTo-Json -Depth 4
