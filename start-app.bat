@echo off
REM Script para iniciar la aplicación HandicApp en Windows
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
echo  ║        │        🚀 INICIANDO APLICACIÓN 🚀        │          ║
echo  ║        │                                         │          ║
echo  ║        ╰─────────────────────────────────────────╯          ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar si Docker está ejecutándose
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está ejecutándose. Por favor, inicia Docker Desktop primero.
    pause
    exit /b 1
)

REM Verificar si docker-compose está disponible
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: docker-compose no está instalado.
    pause
    exit /b 1
)

REM Ejecutar docker-compose
set COMPOSE_FILES=-f docker-compose.yml -f docker-compose.override.yml
echo 📦 Ejecutando docker-compose up -d con override de desarrollo...
docker-compose %COMPOSE_FILES% up -d

REM Verificar el estado de los contenedores
echo.
echo 🔍 Verificando estado de los contenedores...
timeout /t 5 /nobreak >nul

REM Verificar que todos los contenedores estén ejecutándose
docker-compose %COMPOSE_FILES% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ ¡Docker Compose ejecutado exitosamente!
    echo.
    echo 📊 Estado de los servicios:
    docker-compose %COMPOSE_FILES% ps
    echo.
    echo 🌐 URLs disponibles:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:3003
    echo    PostgreSQL: localhost:5434
    echo    Redis: localhost:6381
    echo.
    
    echo 📱 Abriendo terminales con logs...
    
    REM Abrir terminal con logs del frontend
    start "Frontend Logs - HandicApp" cmd /k "echo 📱 Logs del Frontend (Next.js) && echo Presiona Ctrl+C para salir && echo. && docker-compose %COMPOSE_FILES% logs -f front-handicapp"
    
    REM Abrir terminal con logs del backend
    start "Backend Logs - HandicApp" cmd /k "echo 🔧 Logs del Backend (Node.js API) && echo Presiona Ctrl+C para salir && echo. && docker-compose %COMPOSE_FILES% logs -f api"
    
    echo ✅ Terminales abiertas con logs del frontend y backend
    
    REM Esperar a que la API esté lista e inicializar roles
    echo.
    echo ⏳ Esperando a que la API esté lista...
    timeout /t 10 /nobreak >nul
    
    echo 🔧 Inicializando roles en la base de datos...
    docker-compose %COMPOSE_FILES% exec -T postgres psql -U postgres -d handicapp_db -c "INSERT INTO roles (clave, nombre, creado_el) VALUES ('user', 'Usuario', NOW()), ('admin', 'Administrador', NOW()), ('moderator', 'Moderador', NOW()) ON CONFLICT (clave) DO NOTHING;" 2>nul || echo ⚠️  Los roles ya existen o hubo un error al inicializarlos
    
    echo ✅ Roles inicializados correctamente
    
) else (
    echo ❌ Error: Algunos contenedores no se iniciaron correctamente.
    echo 📊 Estado actual:
    docker-compose %COMPOSE_FILES% ps
    echo.
    echo 🔍 Para ver los logs de error:
    echo    docker-compose logs
    pause
    exit /b 1
)

echo.
echo 🎉 ¡Aplicación iniciada correctamente!
echo    Para detener la aplicación: docker-compose %COMPOSE_FILES% down
echo    Para ver todos los logs: docker-compose %COMPOSE_FILES% logs -f
echo.
pause
