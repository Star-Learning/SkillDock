[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$DrawioPath,

    [string[]]$ExportFormats = @('png'),
    [string]$OutputDir,
    [string]$OutputBaseName,
    [string]$DrawioExe,
    [switch]$Crop,
    [int]$PageIndex = -1,
    [double]$Scale = 1.0
)

$ErrorActionPreference = 'Stop'
$allowedFormats = @('png', 'svg', 'pdf', 'html', 'json')
$source = [IO.Path]::GetFullPath($DrawioPath)
if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Draw.io 文件不存在: $source" }
if ([IO.Path]::GetExtension($source).ToLowerInvariant() -notin @('.drawio', '.xml')) { throw "输入必须是 .drawio 或 .xml 文件" }

function Resolve-DrawioExecutable {
    param([string]$ExplicitPath)
    $candidates = @($ExplicitPath, $env:DRAWIO_EXE, (Join-Path $env:LOCALAPPDATA 'Programs\draw.io\draw.io.exe'), (Join-Path $env:ProgramFiles 'draw.io\draw.io.exe'), (Join-Path $env:LOCALAPPDATA 'draw.io\draw.io.exe')) | Where-Object { $_ }
    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { return [IO.Path]::GetFullPath($candidate) }
    }
    $command = Get-Command 'draw.io.exe' -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    throw '找不到 Draw.io Desktop。请安装 Draw.io Desktop，或设置 DRAWIO_EXE / -DrawioExe。'
}

$formats = New-Object System.Collections.Generic.List[string]
foreach ($group in $ExportFormats) {
    foreach ($format in ($group -split ',')) {
        $normalized = $format.Trim().TrimStart('.').ToLowerInvariant()
        if (-not $normalized) { continue }
        if ($normalized -notin $allowedFormats) { throw "不支持的导出格式 '$format'，可用格式: $($allowedFormats -join ', ')" }
        if (-not $formats.Contains($normalized)) { $formats.Add($normalized) }
    }
}
if ($formats.Count -eq 0) { throw '至少指定一种导出格式' }

if (-not $OutputDir) { $OutputDir = Split-Path -Parent $source }
if (-not (Test-Path -LiteralPath $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }
if (-not $OutputBaseName) { $OutputBaseName = [IO.Path]::GetFileNameWithoutExtension($source) }
$executable = Resolve-DrawioExecutable $DrawioExe

foreach ($format in $formats) {
    $output = [IO.Path]::GetFullPath((Join-Path $OutputDir "$OutputBaseName.$format"))
    $arguments = @('--export', '--format', $format, '--output', $output)
    if ($Crop) { $arguments += '--crop' }
    if ($PageIndex -ge 0) { $arguments += @('--page-index', [string]$PageIndex) }
    if ($Scale -ne 1.0) { $arguments += @('--scale', [string]$Scale) }
    $arguments += $source
    & $executable @arguments
    if ($LASTEXITCODE -ne 0) { throw "Draw.io 导出 $format 失败，退出码 $LASTEXITCODE" }
    if (-not (Test-Path -LiteralPath $output -PathType Leaf)) { throw "Draw.io 未生成 $output" }
    $bytes = (Get-Item -LiteralPath $output).Length
    if ($bytes -le 0) { throw "导出文件为空: $output" }
    Write-Output ("{0}: {1} ({2} bytes)" -f $format.ToUpperInvariant(), $output, $bytes)
}
