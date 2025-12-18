# 🔄 Sistema de Relación Tareas-Eventos

## 📋 Descripción General

Este documento describe el sistema de auto-generación de eventos cuando se completan tareas vinculadas a caballos.

## 🎯 Objetivo

Mantener un historial completo y automático de todas las actividades realizadas sobre cada caballo, permitiendo que:
- **Establecimientos/Capataces/Empleados**: Gestionen el trabajo diario mediante tareas
- **Propietarios**: Vean el historial completo de actividades de su caballo sin ver el trabajo operativo interno

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTABLECIMIENTO                          │
│                                                             │
│  1. Crea TAREA: "Dar medicamento a Thunder"                │
│     - tipo: salud                                           │
│     - caballo_id: 123                                       │
│     - asignado_a: empleado_id_456                          │
│     - prioridad: alta                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      EMPLEADO                               │
│                                                             │
│  2. Completa la tarea en el Kanban                          │
│     - estado: open → done                                   │
│     - Agrega observaciones                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              🤖 AUTO-GENERACIÓN (Backend)                   │
│                                                             │
│  3. TareaEventoMapper verifica:                             │
│     ✓ ¿Tiene caballo_id? → Sí                              │
│     ✓ ¿Debe generar evento? → Sí (tipo: salud)            │
│                                                             │
│  4. Crea EVENTO automáticamente:                            │
│     - tipo_evento_id: "Cuidado de Salud"                   │
│     - fecha_evento: NOW()                                   │
│     - titulo: "Dar medicamento a Thunder"                   │
│     - descripcion: "✅ Tarea completada: ..."              │
│     - estado: completado                                    │
│     - es_publico: true ← VISIBLE PARA PROPIETARIO          │
│     - originado_de_tarea_id: tarea.id                      │
│                                                             │
│  5. Vincula tarea con evento:                               │
│     - tarea.evento_generado_id = evento.id                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROPIETARIO                              │
│                                                             │
│  6. Ve el evento en el historial de "Thunder"               │
│     - NO ve la tarea operativa                              │
│     - Solo ve: "Cuidado de Salud - Completado"             │
│     - Con descripción de lo realizado                       │
└─────────────────────────────────────────────────────────────┘
```

## 💾 Modelo de Datos

### Tabla: `tareas`

```sql
CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  establecimiento_id INTEGER NOT NULL,
  caballo_id INTEGER,                    -- Opcional (null si es del establecimiento)
  tipo VARCHAR(50) NOT NULL,             -- alimentacion, limpieza, salud, etc.
  titulo VARCHAR(120) NOT NULL,
  notas TEXT,
  asignado_a_usuario_id INTEGER,
  creado_por_usuario_id INTEGER NOT NULL,
  estado VARCHAR(20) NOT NULL,           -- open, in_progress, done, cancelled
  fecha_vencimiento TIMESTAMP,
  prioridad VARCHAR(20) DEFAULT 'media', -- 🆕 baja, media, alta, critica
  evento_generado_id INTEGER,            -- 🆕 FK a eventos.id
  creado_el TIMESTAMP DEFAULT NOW(),
  actualizado_el TIMESTAMP
);
```

### Tabla: `eventos`

```sql
CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  caballo_id INTEGER NOT NULL,           -- Siempre requerido
  tipo_evento_id INTEGER NOT NULL,
  fecha_evento TIMESTAMP NOT NULL,
  titulo VARCHAR(120),
  descripcion TEXT,
  establecimiento_id INTEGER,
  creado_por_usuario_id INTEGER NOT NULL,
  rol_autor VARCHAR(40),
  estado VARCHAR(20) DEFAULT 'programado', -- programado, completado, cancelado
  prioridad VARCHAR(20) DEFAULT 'media',
  es_publico BOOLEAN DEFAULT false,
  requiere_validacion BOOLEAN DEFAULT false,
  originado_de_tarea_id INTEGER,         -- 🆕 FK a tareas.id
  creado_el TIMESTAMP DEFAULT NOW(),
  actualizado_el TIMESTAMP
);
```

## 🔧 Componentes

### 1. TareaEventoMapper (`tareaEventoMapper.ts`)

**Responsabilidad**: Mapear tipos de tareas a tipos de eventos

**Métodos principales**:
- `obtenerTipoEventoId(tipoTarea)`: Obtiene el ID del tipo de evento correspondiente
- `debeGenerarEvento(tipoTarea, caballoId)`: Valida si debe generar evento automático
- `generarDescripcionEvento(tarea)`: Crea descripción formateada para el evento
- `mapearPrioridad(prioridadTarea)`: Convierte prioridad de tarea a prioridad de evento

**Mapeo de Tipos**:
```typescript
alimentacion      → Tipo Evento: "Alimentación"
limpieza_box      → Tipo Evento: "Limpieza de Box"
aseo_caballo      → Tipo Evento: "Aseo del Caballo"
ejercicio         → Tipo Evento: "Ejercicio"
salud             → Tipo Evento: "Cuidado de Salud"
entrenamiento     → Tipo Evento: "Entrenamiento"

// Estas NO generan eventos automáticos:
mantenimiento     ✗ (tarea del establecimiento)
reparacion        ✗ (tarea del establecimiento)
limpieza_general  ✗ (tarea del establecimiento)
compras           ✗ (tarea del establecimiento)
otro              ✗ (genérica)
```

### 2. TareaService.completarTarea() Actualizado

**Flujo**:
1. Validar permisos del usuario
2. Actualizar estado de la tarea a `done`
3. **SI** la tarea tiene `caballo_id`:
   - Verificar si debe generar evento
   - Obtener tipo de evento correspondiente
   - Crear evento automáticamente
   - Vincular tarea ↔ evento
   - (Futuro) Enviar notificación al propietario
4. Retornar tarea actualizada

**Manejo de Errores**:
- Si falla la creación del evento, NO falla la completación de la tarea
- Se registra el error en logs
- La tarea queda completada exitosamente

## 📊 Reglas de Negocio

### ¿Cuándo se genera un evento automáticamente?

✅ **SÍ se genera** si:
- La tarea tiene `caballo_id` (está vinculada a un caballo)
- El tipo de tarea es: alimentacion, limpieza_box, aseo_caballo, ejercicio, salud, entrenamiento
- El estado cambia a `done`

❌ **NO se genera** si:
- La tarea NO tiene `caballo_id` (es del establecimiento)
- El tipo es: mantenimiento, reparacion, limpieza_general, compras, otro
- El estado cambia a `cancelled`

### Propiedades del Evento Generado

| Campo | Valor | Origen |
|-------|-------|--------|
| `caballo_id` | ID del caballo | `tarea.caballo_id` |
| `tipo_evento_id` | Mapeo automático | `TareaEventoMapper` |
| `fecha_evento` | Fecha actual | `new Date()` |
| `titulo` | Título de la tarea | `tarea.titulo` |
| `descripcion` | Descripción formateada | Auto-generada |
| `estado` | `'completado'` | Fijo |
| `prioridad` | Mapeada | `tarea.prioridad` |
| `es_publico` | `true` | ✅ Visible para propietario |
| `requiere_validacion` | `false` | Ya completada |
| `estado_validacion` | `'approved'` | Auto-aprobada |
| `originado_de_tarea_id` | ID de la tarea | `tarea.id` |

## 🚀 Instalación y Migración

### Paso 1: Ejecutar Migración SQL

```bash
# Opción 1: Usando el script Node.js
cd back-handicapp
node scripts/run-tarea-evento-migration.js

# Opción 2: Directamente con psql
psql -U postgres -d handicapp_db -f scripts/migrations/add-tarea-evento-relation.sql
```

### Paso 2: Reiniciar el Backend

```bash
cd back-handicapp
npm run dev
```

### Paso 3: Verificar en la Base de Datos

```sql
-- Verificar nuevas columnas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('tareas', 'eventos') 
AND column_name IN ('evento_generado_id', 'originado_de_tarea_id', 'prioridad');

-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('tareas', 'eventos')
AND indexname LIKE '%evento%' OR indexname LIKE '%tarea%';
```

## 🧪 Testing

### Caso de Prueba 1: Tarea del Caballo

```javascript
// 1. Crear tarea vinculada a caballo
const tarea = await tareaService.createTarea({
  establecimiento_id: 1,
  caballo_id: 123,  // ✅ Tiene caballo
  tipo: 'salud',    // ✅ Tipo que genera evento
  titulo: 'Dar vitaminas',
  prioridad: 'alta',
  asignado_a_usuario_id: 456
}, 1);

// 2. Completar tarea
const result = await tareaService.completarTarea(
  tarea.id,
  'Vitaminas administradas correctamente',
  456
);

// 3. Verificar evento generado
const tareaActualizada = await Tarea.findByPk(tarea.id);
assert(tareaActualizada.evento_generado_id !== null); // ✅ Evento creado

const evento = await Evento.findByPk(tareaActualizada.evento_generado_id);
assert(evento.originado_de_tarea_id === tarea.id);     // ✅ Vinculado
assert(evento.es_publico === true);                     // ✅ Visible para propietario
assert(evento.estado === 'completado');                 // ✅ Estado correcto
```

### Caso de Prueba 2: Tarea del Establecimiento

```javascript
// 1. Crear tarea SIN caballo
const tarea = await tareaService.createTarea({
  establecimiento_id: 1,
  caballo_id: null,      // ❌ NO tiene caballo
  tipo: 'reparacion',    // ❌ Tipo que NO genera evento
  titulo: 'Reparar cerca',
  prioridad: 'media'
}, 1);

// 2. Completar tarea
const result = await tareaService.completarTarea(tarea.id, 'Cerca reparada', 1);

// 3. Verificar que NO se generó evento
const tareaActualizada = await Tarea.findByPk(tarea.id);
assert(tareaActualizada.evento_generado_id === null); // ✅ No se creó evento
```

## 📱 Impacto en el Frontend

### Para Establecimiento/Capataz/Empleado

**Páginas afectadas**:
- `/establecimiento/tareas` → Ver tareas operativas (Kanban)
- `/establecimiento/calendario` → Ver eventos programados

**NO se requieren cambios** en el frontend. El backend maneja todo automáticamente.

### Para Propietario

**Páginas afectadas**:
- `/propietario/caballos/[id]` → Tab "Historial"

**Cambios requeridos**:
- Agregar filtro para ver eventos originados de tareas
- Mostrar icono especial para eventos auto-generados
- Permitir navegar a la tarea original (opcional)

## 🔐 Seguridad y Permisos

### Control de Acceso

| Rol | Puede completar tarea | Ve eventos generados |
|-----|----------------------|----------------------|
| **Admin** | ✅ Todas | ✅ Todos |
| **Establecimiento** | ✅ De su establecimiento | ✅ De su establecimiento |
| **Capataz** | ✅ Asignadas a él o creadas por él | ✅ De caballos en su establecimiento |
| **Empleado** | ✅ Solo asignadas a él | ❌ No (solo ve sus tareas) |
| **Propietario** | ❌ No | ✅ Solo de sus caballos |

## 📈 Métricas y Logs

El sistema registra:
- ✅ Cada evento generado automáticamente
- ⚠️ Fallos en la generación de eventos (sin afectar la tarea)
- 📊 Mapeos de tipos de tareas → eventos
- 🔍 Tareas completadas sin evento (normales)

**Ejemplo de log**:
```
🔄 Generando evento automático para tarea completada ID: 123
✅ Tipo de evento encontrado: Cuidado de Salud (ID: 45)
✅ Evento automático creado: ID 789 para tarea 123
```

## 🚧 Trabajo Futuro

- [ ] Sistema de notificaciones al propietario cuando se genera un evento
- [ ] Dashboard de estadísticas de tareas completadas
- [ ] Exportación de historial completo del caballo (tareas + eventos)
- [ ] Integración con sistema de reportes
- [ ] Webhook para notificar sistemas externos

## 🤝 Soporte

Para dudas o problemas:
- Revisar logs del backend: `back-handicapp/logs/`
- Verificar conexión a base de datos
- Confirmar que la migración se ejecutó correctamente
- Revisar tipos de eventos disponibles en la base de datos

---

**Última actualización**: 2025-12-17
**Versión**: 1.0.0
**Autor**: HandicApp Team
