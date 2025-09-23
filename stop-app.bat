@echo off
REM Script para detener la aplicación HandicApp en Windows
REM Autor: Script generado automáticamente

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║    🐴🐴🐴    H A N D I C A P P    🐴🐴🐴                ║
echo  ║                                                              ║
echo  ║        ╭─────────────────────────────────────────╮          ║
echo  ║        │                                         │          ║
echo  ║        │    🐎        🏇        🐴              │          ║
echo  ║        │                                         │          ║
echo  ║        │     ╭─╮     ╭─╮     ╭─╮                │          ║
echo  ║        │    ╱   ╲   ╱   ╲   ╱   ╲               │          ║
echo  ║        │   ╱  🐴  ╲ ╱  🏇  ╲ ╱  🐎  ╲              │          ║
echo  ║        │  ╱_______╲╱_______╲╱_______╲             │          ║
echo  ║        │                                         │          ║
echo  ║        │        🛑 DETENIENDO APLICACIÓN 🛑        │          ║
echo  ║        │                                         │          ║
echo  ║        ╰─────────────────────────────────────────╯          ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar si docker-compose está disponible
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: docker-compose no está instalado.
    pause
    exit /b 1
)

set COMPOSE_FILES=-f docker-compose.yml -f docker-compose.override.yml
REM Detener los contenedores
echo 📦 Deteniendo contenedores (con override de desarrollo)...
docker-compose %COMPOSE_FILES% down -v --remove-orphans

REM Verificar el estado
echo.
echo 🔍 Estado final:
docker-compose %COMPOSE_FILES% ps

echo.
echo ✅ ¡Aplicación detenida correctamente!
echo    Para iniciar nuevamente: start-app.bat
echo.
pause
