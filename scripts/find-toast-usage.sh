#!/bin/bash

# Script para encontrar usos de toast que necesitan migración a errorHandler

echo "🔍 Buscando usos de react-hot-toast en el frontend..."
echo ""

echo "📁 Archivos que importan react-hot-toast:"
grep -r "from 'react-hot-toast'" front-handicapp/src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

echo "📋 Lista de archivos:"
grep -r "from 'react-hot-toast'" front-handicapp/src/ --include="*.tsx" --include="*.ts" -l
echo ""

echo "🎯 Usos de toast.error:"
grep -r "toast\.error" front-handicapp/src/ --include="*.tsx" --include="*.ts" -n
echo ""

echo "✅ Usos de toast.success:"
grep -r "toast\.success" front-handicapp/src/ --include="*.tsx" --include="*.ts" -n
echo ""

echo "⚠️  Usos de toast (warning/info):"
grep -r "toast\(" front-handicapp/src/ --include="*.tsx" --include="*.ts" -n | grep -v "toast\." | grep -v "useToaster"
echo ""

echo "📊 Resumen:"
echo "Total de archivos con toast: $(grep -r "toast\." front-handicapp/src/ --include="*.tsx" --include="*.ts" -l | wc -l)"
echo ""

echo "✅ Archivos ya migrados (con errorHandler):"
grep -r "showError\|showSuccess" front-handicapp/src/ --include="*.tsx" --include="*.ts" -l
echo ""

echo "📝 Para migrar un archivo:"
echo "1. Cambiar import:"
echo "   from 'react-hot-toast' → from '@/lib/utils/errorHandler'"
echo "2. Cambiar función:"
echo "   toast.error(msg) → showError(error, 'context', 'action')"
echo "   toast.success(msg) → showSuccess('context', 'action')"
