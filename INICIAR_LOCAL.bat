@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado. Instala Node.js 22 LTS y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
if not exist "node_modules" (
  npm install
)
if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env"
)
if not exist "frontend\.env" (
  copy "frontend\.env.example" "frontend\.env"
)
npm run migrate || npm --workspace backend run sqlite:init
npm run seed
npm run dev
