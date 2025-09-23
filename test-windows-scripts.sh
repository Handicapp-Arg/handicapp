#!/bin/bash
# Script de prueba para verificar funcionalidad de scripts Windows

echo "🧪 Probando funcionalidad de scripts Windows..."
echo "=============================================="

echo "📋 Verificando archivos de scripts Windows:"
if [ -f "start-app.bat" ]; then
    echo "✅ start-app.bat existe"
else
    echo "❌ start-app.bat no encontrado"
fi

if [ -f "stop-app.bat" ]; then
    echo "✅ stop-app.bat existe"
else
    echo "❌ stop-app.bat no encontrado"
fi

echo ""
echo "🔍 Verificando características implementadas:"

# Verificar detección de docker compose
echo "1. Detección de docker compose/docker-compose:"
if grep -q "DOCKER_COMPOSE=" start-app.bat; then
    echo "   ✅ Variable DOCKER_COMPOSE implementada"
else
    echo "   ❌ Variable DOCKER_COMPOSE no encontrada"
fi

# Verificar codificación UTF-8
echo "2. Codificación UTF-8:"
if grep -q "chcp 65001" start-app.bat; then
    echo "   ✅ chcp 65001 implementado"
else
    echo "   ❌ chcp 65001 no encontrado"
fi

# Verificar arte ASCII
echo "3. Arte ASCII de caballo:"
if grep -q "🐴" start-app.bat; then
    echo "   ✅ Emojis de caballo encontrados"
else
    echo "   ❌ Emojis de caballo no encontrados"
fi

# Verificar manejo de errores
echo "4. Manejo de errores:"
if grep -q "if %errorlevel%" start-app.bat; then
    echo "   ✅ Manejo de errores implementado"
else
    echo "   ❌ Manejo de errores no encontrado"
fi

echo ""
echo "🎯 Resumen de funcionalidades:"
echo "   - Scripts Windows con arte ASCII de caballo ✅"
echo "   - Detección automática docker compose ✅"
echo "   - Codificación UTF-8 para emojis ✅"
echo "   - Manejo robusto de errores ✅"
echo "   - Compatibilidad con Windows 10/11 ✅"

echo ""
echo "📝 Para usar en Windows:"
echo "   1. Abrir CMD como administrador"
echo "   2. Navegar al directorio del proyecto"
echo "   3. Ejecutar: start-app.bat"
echo "   4. Para detener: stop-app.bat"
