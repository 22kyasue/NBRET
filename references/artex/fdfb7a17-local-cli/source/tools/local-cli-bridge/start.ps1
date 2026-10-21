param([int]$Port = 18789)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$runtimeDir = Join-Path $repoRoot 'work/cli-bridge'
[void][System.IO.Directory]::CreateDirectory($runtimeDir)
$tokenFile = Join-Path $runtimeDir 'token'
if (!(Test-Path -LiteralPath $tokenFile)) {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    [System.IO.File]::WriteAllText($tokenFile, [Convert]::ToBase64String($bytes), (New-Object System.Text.UTF8Encoding($false)))
}
$token = [System.IO.File]::ReadAllText($tokenFile).Trim()
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Headers @{Authorization="Bearer $token"} -TimeoutSec 2
    if ($health.status -eq 'ok') { Write-Output "Local CLI bridge already running on port $Port."; exit 0 }
} catch {}
if (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue) {
    throw "Port $Port is already occupied by a different service."
}
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$mainPath = Join-Path $PSScriptRoot 'main.mjs'
$process = Start-Process -FilePath $nodePath -ArgumentList @("`"$mainPath`"", '--token-file', "`"$tokenFile`"", '--port', "$Port") -WorkingDirectory $repoRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir 'stdout.log') -RedirectStandardError (Join-Path $runtimeDir 'stderr.log') -PassThru
[System.IO.File]::WriteAllText((Join-Path $runtimeDir 'pid'), "$($process.Id)", (New-Object System.Text.UTF8Encoding($false)))
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    if ($process.HasExited) { throw "Bridge exited; inspect work/cli-bridge/stderr.log." }
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Headers @{Authorization="Bearer $token"} -TimeoutSec 1
        if ($health.status -eq 'ok') { Write-Output "Local CLI bridge ready on 127.0.0.1:$Port (PID $($process.Id))."; exit 0 }
    } catch {}
}
throw "Bridge startup could not be confirmed; inspect work/cli-bridge/stderr.log."
