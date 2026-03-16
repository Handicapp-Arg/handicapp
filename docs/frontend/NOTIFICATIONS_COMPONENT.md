# Arquitectura de Notificaciones

## 📂 Estructura

```
src/
├── app/(dashboard)/
│   ├── notificaciones/page.tsx          ← Ruta compartida (RECOMENDADA)
│   ├── admin/notificaciones/page.tsx    ← Legacy, redirigir a /notificaciones
│   ├── propietario/notificaciones/      ← Legacy, redirigir a /notificaciones
│   └── ...
└── components/
    └── notificaciones/
        └── NotificacionesPage.tsx       ← Componente principal (React Query)
```

## ✅ Buenas Prácticas Implementadas

### 1. **Single Source of Truth**
- **Un solo componente**: `NotificacionesPage.tsx`
- **Una sola ruta**: `/notificaciones` (funciona para todos los roles)
- **Sin guards innecesarios**: El DashboardLayout ya protege la ruta

### 2. **Código Reutilizable**
```tsx
// ✅ BIEN - Componente compartido
export function NotificacionesPage() {
  // Lógica común para todos los roles
}

// ❌ MAL - Duplicar por cada rol
export function AdminNotificacionesPage() { ... }
export function PropietarioNotificacionesPage() { ... }
```

### 3. **Data Fetching Moderno**
- Usa **React Query** para cache y sincronización
- Polling automático cada 10 segundos
- Invalidación de cache optimista

## 🚀 Usar Notificaciones

### Agregar a un nuevo rol:
**No necesitas hacer nada**, ya funciona en `/notificaciones`

### Rutas:
- `/admin/notificaciones` ✅
- `/propietario/notificaciones` ✅  
- `/veterinario/notificaciones` ✅
- Todas usan el mismo componente

## 🧹 Cleanup Pendiente (Opcional)

1. **Eliminar rutas duplicadas** por rol (mantener solo `/notificaciones`)
2. **Remover** `NotificacionesContent.tsx` si no se usa
3. **Consolidar** guards innecesarios

## 📝 Notas Técnicas

- **Backend**: Filtra notificaciones por usuario automáticamente
- **Frontend**: No necesita verificar permisos
- **Escalable**: Agregar nuevo rol = 0 cambios en notificaciones
