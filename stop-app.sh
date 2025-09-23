#!/bin/bash

# Script para detener la aplicación HandicApp en Linux
# Autor: Script generado automáticamente

echo "🛑 Deteniendo HandicApp..."
echo "================================"

# Verificar si docker-compose está disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose no está instalado."
    exit 1
fi

COMPOSE_FILES="-f docker-compose.yml -f docker-compose.override.yml"

# Detener los contenedores
echo "📦 Deteniendo contenedores (con override de desarrollo)..."
docker-compose $COMPOSE_FILES down -v --remove-orphans

# Verificar el estado
echo ""
echo "🔍 Estado final:"
docker-compose $COMPOSE_FILES ps

echo ""
echo "✅ ¡Aplicación detenida correctamente!"
echo "   Para iniciar nuevamente: ./start-app.sh"
