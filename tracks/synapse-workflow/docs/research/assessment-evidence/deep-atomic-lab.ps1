param([string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
$sourceRoot = 'C:/Users/kotar/.codex/research/invoke-atomic-20261017'
$null = New-Item -ItemType Directory -Path $OutputDirectory
$atomics = Join-Path $OutputDirectory 'atomics'
$null = New-Item -ItemType Directory -Path (Join-Path $atomics 'T0000')
Set-Content -LiteralPath (Join-Path $atomics 'T0000/T0000.yaml') -Value '# synthetic placeholder; parser mocked'
# Never import the root module, config, logger or process functions.
foreach ($relative in @('Public/Invoke-AtomicTest.ps1','Private/Replace-InputArgs.ps1',
    'Private/Invoke-CheckPrereqs.ps1','Private/Get-PrereqExecutor.ps1',
    'Private/Write-KeyValue.ps1','Private/Write-PrereqResults.ps1')) {
    . (Join-Path $sourceRoot $relative)
}
$script:dispatches = [System.Collections.Generic.List[object]]::new()
function Get-TargetInfo { 'windows', $false, 'synthetic-temp', 'synthetic-host', 'synthetic-user' }
function Get-AtomicTechnique {
    param($Path)
    [PSCustomObject]@{ Count=1; attack_technique=@('T0000'); display_name='Synthetic orchestration'; atomic_tests=@(
        [PSCustomObject]@{name='Synthetic only'; auto_generated_guid='synthetic-guid'; description='Never executed';
            supported_platforms=@('windows'); input_arguments=@{}; dependency_executor_name='command_prompt';
            dependencies=@([PSCustomObject]@{description='missing synthetic prerequisite';prereq_command='SYNTHETIC-CHECK';get_prereq_command='SYNTHETIC-GET'});
            executor=[PSCustomObject]@{name='command_prompt';elevation_required=$false;command='SYNTHETIC-RUN';cleanup_command='SYNTHETIC-CLEANUP'}})
    }
}
function Invoke-ExecuteCommand {
    param($finalCommand,$executor,$executionPlatform,$TimeoutSeconds,$session,$interactive)
    $script:dispatches.Add([PSCustomObject]@{command=$finalCommand;executor=$executor})
    [PSCustomObject]@{ExitCode=7;IsTimeOut=$false;StandardOutput='synthetic failure';ErrorOutput='';ProcessId=0}
}
Invoke-AtomicTest T0000 -PathToAtomicsFolder $atomics -NoExecutionLog -WhatIf -SupressPathToAtomicsFolder
$whatIfCommands=@($script:dispatches | ForEach-Object {$_.command})
if ($whatIfCommands.Count -ne 1 -or $whatIfCommands[0] -ne 'SYNTHETIC-RUN') { throw 'Unexpected WhatIf dispatch behavior' }
$script:dispatches.Clear()
Invoke-AtomicTest T0000 -PathToAtomicsFolder $atomics -NoExecutionLog -CheckPrereqs -SupressPathToAtomicsFolder
$prereqCommands=@($script:dispatches | ForEach-Object {$_.command})
if ($prereqCommands.Count -ne 1 -or $prereqCommands[0] -ne 'SYNTHETIC-CHECK') { throw 'Unexpected prereq behavior' }
$script:dispatches.Clear()
$cleanupText = Invoke-AtomicTest T0000 -PathToAtomicsFolder $atomics -NoExecutionLog -Cleanup -SupressPathToAtomicsFolder 6>&1 | Out-String
$cleanupCommands=@($script:dispatches | ForEach-Object {$_.command})
if ($cleanupCommands.Count -ne 1 -or $cleanupCommands[0] -ne 'SYNTHETIC-CLEANUP' -or $cleanupText -notmatch 'Done executing cleanup') { throw 'Unexpected cleanup behavior' }
$sources=@{}
foreach($relative in @('Public/Invoke-AtomicTest.ps1','Private/Replace-InputArgs.ps1','Private/Invoke-CheckPrereqs.ps1')) {
    $sources[$relative]=(Get-FileHash -LiteralPath (Join-Path $sourceRoot $relative) -Algorithm SHA256).Hash
}
$receipt=[ordered]@{powershell=$PSVersionTable.PSVersion.ToString();scope='Real orchestration functions with mocked parser,target-info,command dispatcher; no Atomic command or process launched';
    whatIfDispatches=$whatIfCommands;checkPrereqDispatches=$prereqCommands;cleanupDispatches=$cleanupCommands;
    cleanupReturnedNonzero=7;cleanupStillPrintedDone=($cleanupText -match 'Done executing cleanup');cleanupText=$cleanupText;
    modelCalls=0;networkCalls=0;externalEffects=0;sources=$sources;
    scriptSha256=(Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256).Hash}
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'receipt.json') -Encoding UTF8
$receipt | ConvertTo-Json -Depth 8
