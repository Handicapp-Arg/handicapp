#!/bin/bash

# 🚀 Script mejorado para iniciar HandicApp con Docker Compose
# Autor: Guillermo Fernández

echo "================================"
echo "🚀 Iniciando HandicApp (modo desarrollo)..."
echo "================================"

# Verificar Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está ejecutándose. Por favor, inicia Docker primero."
    exit 1
fi

# Verificar docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose no está instalado."
    exit 1
fi

# Usar docker-compose con override de desarrollo
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.override.yml"

# Reiniciar stack para evitar conflictos previos
echo "🧹 Limpiando stack previo (si existe)..."
docker-compose $COMPOSE_FILES down -v >/dev/null 2>&1 || true

# Levantar contenedores
echo "📦 Ejecutando docker-compose up -d con override de desarrollo..."
docker-compose $COMPOSE_FILES up -d

# Esperar y verificar estado
sleep 5
if docker-compose $COMPOSE_FILES ps | grep -q "Up"; then
    echo "✅ Docker Compose ejecutado exitosamente"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3003"
    echo "   PostgreSQL: localhost:5434"
    echo "   Redis: localhost:6381"
    echo ""

    # Función para abrir logs
    open_logs() {
        local service=$1
        local title=$2

        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal --title="$title" -- bash -c "docker-compose $COMPOSE_FILES logs -f $service; exec bash" &
        elif command -v xterm &> /dev/null; then
            xterm -T "$title" -e "docker-compose $COMPOSE_FILES logs -f $service" &
        else
            echo "⚠️  No se pudo abrir terminal gráfica para $title. Ver logs manualmente:"
            echo "   docker-compose $COMPOSE_FILES logs -f $service"
        fi
    }

    # Esperar a que la API esté lista
    echo "⏳ Esperando a que la API esté lista..."
    sleep 10
    
    # Inicializar roles en la base de datos
    echo "🔧 Inicializando roles en la base de datos..."
    docker-compose $COMPOSE_FILES exec -T postgres psql -U postgres -d handicapp_db -c "
    INSERT INTO roles (clave, nombre, creado_el) 
    VALUES 
      ('user', 'Usuario', NOW()),
      ('admin', 'Administrador', NOW()),
      ('moderator', 'Moderador', NOW())
    ON CONFLICT (clave) DO NOTHING;" 2>/dev/null || echo "⚠️  Los roles ya existen o hubo un error al inicializarlos"
    
    echo "✅ Roles inicializados correctamente"

    # Abrir logs de frontend y backend
    open_logs "front-handicapp" "Frontend Logs - HandicApp"
    open_logs "api" "Backend Logs - HandicApp"

    echo "✅ Terminales abiertas con logs del frontend y backend"
else
    echo "❌ Algunos contenedores no se iniciaron correctamente."
    docker-compose $COMPOSE_FILES ps
    echo "🔍 Para ver los logs de error: docker-compose $COMPOSE_FILES logs"
    exit 1
fi

echo ""
echo "🎉 ¡Aplicación iniciada correctamente!"
echo "   Para detener: docker-compose $COMPOSE_FILES down"
echo "   Para ver todos los logs: docker-compose $COMPOSE_FILES logs -f"
