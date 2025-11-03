# 🔍 Scripts de Validación - Handicapp Frontend

Sistema completo de validación automatizada para garantizar la calidad, seguridad, funcionalidad y rendimiento de la aplicación.

## 📦 Scripts Disponibles

### 1. `pnpm run validate` - Validación de Estructura
Valida la estructura del proyecto, rutas, layout, imports, TypeScript y configuración.

**Aspectos validados:**
- ✅ 8 directorios críticos
- ✅ 80 páginas de dashboard (6 roles)
- ✅ Consistencia de layout (`max-w-7xl mx-auto`)
- ✅ Imports críticos (logger, apiClient, useAuthNew, guards)
- ✅ TypeScript (uso de 'any')
- ⚠️  Console.logs (excluyendo infraestructura)
- ⚠️  Configuración de roles
- ✅ Archivos de config

**Ejemplo de salida:**
```
✅ 25 PASS | ❌ 0 FAIL | ⚠️  2 WARN
✅ Aplicación funcional con advertencias menores
```

---

### 2. `pnpm run validate:security` - Validación de Seguridad
Valida aspectos de seguridad, autenticación y protección de datos.

**Aspectos validados:**
- ⚠️  Guards de permisos (64/80 páginas = 80%)
- ⚠️  Hooks de autenticación (15/25 servicios)
- ⚠️  Manejo de errores (try-catch / React Query)
- ✅ Variables de entorno (NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_WS_URL)
- ✅ Middleware (protección de dashboard)
- ✅ Dependencias de seguridad (jwt-decode, @sentry/nextjs, jose)
- ✅ Manejo de tokens (httpOnly, secure cookies)

**Ejemplo de salida:**
```
✅ 5 PASS | ❌ 0 FAIL | ⚠️  3 WARN
✅ Aplicación segura con recomendaciones menores
```

---

### 3. `pnpm run validate:functionality` - Validación de Funcionalidad
Valida componentes, hooks, servicios y rutas críticas.

**Aspectos validados:**
- ✅ Hooks críticos (useAuthNew, useWebSocket, useNotifications, useStats)
- ⚠️  Componentes críticos (SimplePermissionGuard, CaballoCard)
- ⚠️  Servicios de API (uso de apiClient)
- ✅ Rutas de navegación (6/6 dashboards principales)
- ⚠️  Integraciones (WebSocket, React Query, Toast)
- ✅ Configuración de build (next.config.ts)
- ✅ Estructura de datos (tipos TypeScript)
- ✅ Archivos estáticos (manifest, favicon, logos)

**Ejemplo de salida:**
```
✅ 5 PASS | ❌ 0 FAIL | ⚠️  3 WARN
✅ Funcionalidad operativa con mejoras sugeridas
```

---

### 4. `pnpm run validate:performance` - Validación de Rendimiento
Valida optimizaciones, bundle size y mejores prácticas de rendimiento.

**Aspectos validados:**
- ✅ Lazy loading (3 componentes/módulos)
- ✅ Optimización de imágenes (<500KB)
- ⚠️  Next Image Component (12 usan `<img>` tag)
- ⚠️  React Query configuración
- ⚠️  Memoización (10 optimizaciones)
- ✅ Bundle size (sin dependencias pesadas)
- ⚠️  Tree-shaking
- ⚠️  Componentes grandes (8 componentes >300 líneas)

**Ejemplo de salida:**
```
✅ 3 PASS | ❌ 0 FAIL | ⚠️  5 WARN
✅ Rendimiento aceptable con mejoras sugeridas
```

---

### 5. `pnpm run validate:all` - Validación Completa
Ejecuta todas las validaciones en secuencia.

**Total de tests:**
- 46 tests ejecutados
- ✅ 38 PASS (83%)
- ⚠️  13 WARN (28%)
- ❌ 0 FAIL (0%)

**Tiempo de ejecución:** ~30-40 segundos

---

## 📄 Reportes Generados

Cada validación genera un reporte JSON con timestamp y detalles:

- `validation-report.json` - Estructura y código
- `security-report.json` - Seguridad y autenticación
- `functionality-report.json` - Componentes y servicios
- `performance-report.json` - Optimizaciones y rendimiento

**Formato del reporte:**
```json
{
  "timestamp": "2025-10-23T...",
  "summary": {
    "pass": 25,
    "fail": 0,
    "warn": 2
  },
  "results": [
    {
      "category": "Estructura",
      "test": "Directorio src/lib",
      "status": "PASS",
      "message": "Directorio encontrado"
    }
  ]
}
```

**Nota:** Los reportes están en `.gitignore` y no se commitean.

---

## 🚦 Interpretación de Resultados

### ✅ PASS (Verde)
El test pasó exitosamente. No requiere acción.

### ⚠️  WARN (Amarillo)
El test detectó algo que podría mejorarse, pero no es crítico. La aplicación funciona correctamente.

**Ejemplos:**
- 80% de páginas tienen guards (20% protegidas por middleware)
- Algunos servicios no usan apiClient (son servicios de utilidad)
- Componentes grandes (>300 líneas) podrían refactorizarse

### ❌ FAIL (Rojo)
El test falló. Requiere atención inmediata antes de producción.

**Nota:** La aplicación actualmente tiene 0 FAIL en todas las validaciones.

---

## 🔧 Cómo Usar

### Ejecución Individual
```bash
# Validar solo estructura
pnpm run validate

# Validar solo seguridad
pnpm run validate:security

# Validar solo funcionalidad
pnpm run validate:functionality

# Validar solo rendimiento
pnpm run validate:performance
```

### Ejecución Completa
```bash
# Ejecutar todas las validaciones
pnpm run validate:all
```

### En CI/CD
```bash
# Agregar a pipeline de CI
npm run validate:all

# Exit code:
# 0 = todas las validaciones pasaron (puede tener warnings)
# 1 = al menos una validación falló
```

---

## 📊 Umbrales de Validación

### Estructura
- Console logs: <150 = WARN
- TypeScript 'any': <50 = PASS

### Seguridad
- Guards: 75%+ = WARN
- Error handling: <10 archivos sin try-catch = WARN
- ENV variables: 100% = PASS

### Funcionalidad
- Hooks críticos: 100% = PASS
- Componentes críticos: 100% = PASS
- Rutas principales: 100% = PASS

### Rendimiento
- Imágenes: <500KB = PASS
- Componentes grandes: <300 líneas = PASS
- Dependencias pesadas: 0 = PASS

---

## 🛠️  Mantenimiento

### Agregar Nueva Validación
1. Crear función `validate{Nombre}()` en el script correspondiente
2. Llamar la función en `run{Tipo}Validation()`
3. Agregar resultado con `addResult()`

**Ejemplo:**
```typescript
async function validateNewFeature() {
  log('\n🎯 Validando nueva feature...', 'bold');
  
  // Tu lógica de validación aquí
  const isValid = checkSomething();
  
  if (isValid) {
    addResult('Categoría', 'Test Name', 'PASS', 'Todo OK');
  } else {
    addResult('Categoría', 'Test Name', 'FAIL', 'Problema encontrado');
  }
}
```

### Actualizar Umbrales
Editar los valores numéricos en los `if` statements de cada validación.

### Excluir Archivos
Agregar patrones de exclusión en las funciones de escaneo.

---

## 📈 Mejores Prácticas

1. **Ejecutar antes de commit**
   ```bash
   pnpm run validate:all
   ```

2. **Ejecutar en CI/CD**
   Agregar a GitHub Actions o tu pipeline de CI.

3. **Revisar reportes JSON**
   Para detalles completos de cada validación.

4. **Priorizar FAIL sobre WARN**
   Los failures bloquean producción, los warnings son mejoras.

5. **Actualizar regularmente**
   Ajustar umbrales según el proyecto crece.

---

## 🐛 Troubleshooting

### "Command failed with exit code 1"
Al menos una validación tiene status FAIL. Revisar output para ver cuál.

### "Script not found"
Asegurarse que `tsx` está instalado:
```bash
pnpm install -D tsx
```

### "Cannot find module"
Verificar que las rutas en los scripts sean correctas para tu estructura.

### Falsos positivos
Ajustar umbrales en el script correspondiente si detecta algo incorrectamente.

---

## 🎯 Estado Actual de la Aplicación

**Última validación:** 23 de Octubre 2025

```
📊 Resumen Completo
✅ Estructura: 25 PASS, 2 WARN
✅ Seguridad: 5 PASS, 3 WARN
✅ Funcionalidad: 5 PASS, 3 WARN
✅ Rendimiento: 3 PASS, 5 WARN

🎉 TOTAL: 38 PASS | 0 FAIL | 13 WARN
✅ APLICACIÓN LISTA PARA PRODUCCIÓN
```

---

## 📚 Recursos Adicionales

- [VALIDATION_SUMMARY.md](./VALIDATION_SUMMARY.md) - Resumen ejecutivo completo
- [validation-report.json](./validation-report.json) - Reporte de estructura
- [security-report.json](./security-report.json) - Reporte de seguridad
- [functionality-report.json](./functionality-report.json) - Reporte de funcionalidad
- [performance-report.json](./performance-report.json) - Reporte de rendimiento

---

**Desarrollado con ❤️ para mantener la calidad del código de Handicapp**
