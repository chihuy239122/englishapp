param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [string]$OutputRoot = ""
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
  $OutputRoot = Join-Path $ProjectRoot "backups"
}
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stage = Join-Path $OutputRoot "english-app-$stamp"
New-Item -ItemType Directory -Path $stage -Force | Out-Null

$manifest = @()
$exclude = @("node_modules", "dist", ".wrangler", ".git", "alex-pro-cloudflare.env", ".env", ".env.*")
$files = Get-ChildItem -LiteralPath $ProjectRoot -Recurse -File | Where-Object {
  $relative = $_.FullName.Substring($ProjectRoot.Length).TrimStart('\')
  ($exclude | Where-Object { $relative -like "*$_*" }).Count -eq 0
}

foreach ($file in $files) {
  $relative = $file.FullName.Substring($ProjectRoot.Length).TrimStart('\')
  $manifest += [pscustomobject]@{
    path = $relative
    sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    bytes = $file.Length
  }
}

$manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $stage "manifest.json") -Encoding UTF8
@"
# English App handoff snapshot

Created: $((Get-Date).ToUniversalTime().ToString("o"))
Project root: $ProjectRoot
Cloudflare account: 0af62f8ed73f84c95453102139345d6f
Worker: english-app-api
D1: english_app_db (4ea5ccaa-c901-496c-ac0c-5854733c1428)
R2: english-app-audio
Pages: ispeakerreact

Secrets and environment files are excluded. See manifest.json for hashes.
"@ | Set-Content -LiteralPath (Join-Path $stage "LATEST.md") -Encoding UTF8
Set-Content -LiteralPath (Join-Path $OutputRoot "LATEST.md") -Value "Latest: $stage" -Encoding UTF8
Write-Output $stage
