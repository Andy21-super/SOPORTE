param(
  [string]$DatabasePath = "$PSScriptRoot\..\backend\prisma\dev.db"
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..").Path
$stage = Join-Path $root "release\cpanel\soporte-app"
$zip = Join-Path $root "release\SOPORTE-CPANEL.zip"
$tarGz = Join-Path $root "release\SOPORTE-CPANEL.tar.gz"

$env:VITE_API_URL = "/api"
$env:VITE_SOCKET_URL = "same-origin"
$env:CPANEL_BUILD = "true"
try {
  & npm.cmd --workspace frontend run build
  if ($LASTEXITCODE -ne 0) { throw "Fallo la compilacion del frontend" }
  & npm.cmd --workspace backend run build
  if ($LASTEXITCODE -ne 0) { throw "Fallo la compilacion del backend" }
} finally {
  Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue
  Remove-Item Env:VITE_SOCKET_URL -ErrorAction SilentlyContinue
  Remove-Item Env:CPANEL_BUILD -ErrorAction SilentlyContinue
}

if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "backend") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "frontend") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "prisma") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "uploads") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "backups") | Out-Null

Copy-Item "$root\deploy\cpanel\app.js" $stage
Copy-Item "$root\deploy\cpanel\package.json" $stage
Copy-Item "$root\deploy\cpanel\.env.example" $stage
Copy-Item "$root\deploy\cpanel\CPANEL-INSTALL.md" $stage
Copy-Item "$root\backend\dist" "$stage\backend\dist" -Recurse
Copy-Item "$root\frontend\dist" "$stage\frontend\dist" -Recurse
Copy-Item "$root\backend\prisma\schema.prisma" "$stage\prisma\schema.prisma"

& node "$root\scripts\prepare-cpanel-db.mjs" (Resolve-Path $DatabasePath).Path "$stage\data\soporte.db"
if ($LASTEXITCODE -ne 0) { throw "No se pudo preparar SQLite" }

if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }
& tar.exe -a -c -f $zip -C $stage .
if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el ZIP compatible con Linux" }

if (Test-Path $tarGz) { Remove-Item -LiteralPath $tarGz -Force }
& tar.exe -czf $tarGz -C $stage .
if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el TAR.GZ compatible con cPanel" }

Write-Output "Paquete creado: $zip"
Write-Output "Paquete alternativo: $tarGz"
