#!/bin/bash

# Script para limpiar archivos innecesarios después del build
echo "🧹 Limpiando archivos innecesarios..."

# Eliminar archivos de referencia de cliente que causan errores
find .next/server -name "*_client-reference-manifest.js" -delete 2>/dev/null || true

# Eliminar archivos de caché innecesarios
rm -rf .next/cache/webpack 2>/dev/null || true

echo "✅ Limpieza completada"
