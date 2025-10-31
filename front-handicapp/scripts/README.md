# 📜 Scripts - Handicapp Frontend

Directorio de scripts de utilidad y herramientas de desarrollo.

## 📂 Estructura

```
scripts/
├── README.md                    # Este archivo
└── validation/                  # Scripts de validación de calidad
    ├── README.md               # Documentación completa de validaciones
    ├── validate-app.ts         # Validación de estructura y código
    ├── validate-security.ts    # Validación de seguridad
    ├── validate-functionality.ts  # Validación de funcionalidad
    └── validate-performance.ts    # Validación de rendimiento
```

## 🚀 Comandos Disponibles

### Validaciones de Calidad

```bash
# Validar estructura y código
pnpm run validate

# Validar seguridad
pnpm run validate:security

# Validar funcionalidad
pnpm run validate:functionality

# Validar rendimiento
pnpm run validate:performance

# Ejecutar todas las validaciones
pnpm run validate:all
```

## 📖 Documentación

Para más información sobre el sistema de validación, consulta:
- [`validation/README.md`](./validation/README.md) - Guía completa de validaciones
- [`../docs/VALIDATION_SUMMARY.md`](../docs/VALIDATION_SUMMARY.md) - Resumen ejecutivo de resultados

## 🔧 Desarrollo

### Agregar Nueva Validación

1. Crea un nuevo archivo en `validation/`
2. Sigue el patrón de los scripts existentes
3. Agrega el comando en `package.json`
4. Actualiza la documentación

### Estructura de Script de Validación

```typescript
import * as fs from 'fs';
import * as path from 'path';

// 1. Definir tipos de resultados
interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
  details?: string[];
}

// 2. Implementar funciones de validación
async function validateSomething() {
  // Lógica de validación
  addResult('Category', 'Test Name', 'PASS', 'Everything OK');
}

// 3. Generar reporte
function generateReport() {
  // Crear reporte JSON
  // Mostrar resultados en consola
  // Retornar exit code (0 = success, 1 = failure)
}

// 4. Ejecutar
runValidation();
```

## 📊 Reportes

Los scripts generan reportes JSON en la raíz del proyecto:
- `validation-report.json`
- `security-report.json`
- `functionality-report.json`
- `performance-report.json`

**Nota:** Estos archivos están en `.gitignore` y no se commitean.

## 🎯 Estado Actual

Última validación completa:
```
✅ Estructura:     25 PASS, 2 WARN
✅ Seguridad:      5 PASS, 3 WARN
✅ Funcionalidad:  5 PASS, 3 WARN
✅ Rendimiento:    5 PASS, 3 WARN

TOTAL: 40 PASS | 0 FAIL | 11 WARN
```

**Status**: ✅ Aplicación lista para producción

---

Para más detalles, consulta [`validation/README.md`](./validation/README.md)
