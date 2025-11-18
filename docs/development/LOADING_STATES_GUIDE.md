# 📚 Guía de Loading States - Sistema Unificado

## 🎯 Objetivo

Esta guía documenta el **sistema unificado de loading states** implementado en HandicApp para garantizar consistencia visual y mejores prácticas en toda la aplicación.

## 📦 Componente Principal

**Ubicación:** `src/components/ui/loading-spinner.tsx`

### Componentes Disponibles

#### 1. `LoadingSpinner` (Base)
Componente base con todas las opciones configurables.

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner 
  size="lg"                    // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant="primary"            // 'primary' | 'secondary' | 'white' | 'brand' | 'success' | 'warning' | 'danger'
  label="Cargando..."
  description="Descripción opcional"
  withBlur={true}             // Efecto decorativo de blur
  fullScreen={false}          // Centrar en toda la pantalla
/>
```

#### 2. `LoadingSpinnerFullPage`
Para páginas completas (detalle, formularios, etc.)

```tsx
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

<LoadingSpinnerFullPage 
  label="Cargando datos..." 
  description="Por favor espera"
  variant="success"
/>
```

**Casos de uso:**
- Páginas de detalle (`/caballos/[id]`, `/establecimientos/[id]`)
- Formularios de edición
- Páginas con mucha información

#### 3. `LoadingSpinnerInline`
Para elementos inline (botones, badges, etc.)

```tsx
import { LoadingSpinnerInline } from '@/components/ui/loading-spinner';

<button>
  <LoadingSpinnerInline variant="white" />
  Cargando...
</button>
```

**Casos de uso:**
- Botones con estado loading
- Badges dinámicos
- Links con loading state

#### 4. `LoadingSpinnerCard`
Para contenido dentro de cards, tabs, modales

```tsx
import { LoadingSpinnerCard } from '@/components/ui/loading-spinner';

<Card>
  <LoadingSpinnerCard label="Cargando lista..." variant="primary" />
</Card>
```

**Casos de uso:**
- Cards con contenido dinámico
- Tabs con lazy loading
- Modales con fetch de datos

#### 5. `LoadingSpinnerOverlay`
Overlay transparente sobre contenido existente

```tsx
import { LoadingSpinnerOverlay } from '@/components/ui/loading-spinner';

<div className="relative">
  <YourContent />
  {isLoading && <LoadingSpinnerOverlay label="Guardando..." />}
</div>
```

**Casos de uso:**
- Actualizaciones en vivo
- Guardado automático
- Refresco de contenido

#### 6. `LoadingSpinnerMinimal`
Versión simple sin efectos

```tsx
import { LoadingSpinnerMinimal } from '@/components/ui/loading-spinner';

<LoadingSpinnerMinimal size="sm" />
```

**Casos de uso:**
- Loading discreto
- Espacios reducidos
- UI minimalista

---

## 🎨 Variantes de Color

Usa la variante según el **rol** o **contexto**:

| Variante | Color | Uso Recomendado |
|----------|-------|-----------------|
| `primary` | Slate-900 | General, admin |
| `secondary` | Slate-400 | Secundario |
| `white` | Blanco | Sobre fondos oscuros |
| `brand` | Dorado (#af936f) | Branding especial |
| `success` | Emerald | Propietario, éxito |
| `warning` | Amber | Advertencias |
| `danger` | Rojo | Errores, eliminación |

---

## 📋 Ejemplos por Página

### Página de Lista (Caballos, Establecimientos)

```tsx
'use client';

import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import { useStats } from '@/lib/hooks/useStats';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';

export default function MisCaballosPage() {
  const { stats, loading: statsLoading } = useStats();
  const { data, isLoading: dataLoading } = useCaballos();
  
  // ✅ CORRECTO: Un solo loading unificado
  if (statsLoading || dataLoading) {
    return (
      <LoadingSpinnerFullPage 
        label="Cargando caballos..." 
        description="Preparando tu haras"
        variant="success"
      />
    );
  }
  
  return <YourContent />;
}
```

### Página de Detalle

```tsx
'use client';

import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function CaballoDetallePage() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <LoadingSpinnerFullPage 
        label="Cargando información del caballo..." 
      />
    );
  }
  
  return <YourContent />;
}
```

### Card/Modal con Loading

```tsx
import { LoadingSpinnerCard } from '@/components/ui/loading-spinner';

function MyCard() {
  const { data, isLoading } = useQuery();
  
  return (
    <Card>
      {isLoading ? (
        <LoadingSpinnerCard label="Cargando..." />
      ) : (
        <CardContent>{data}</CardContent>
      )}
    </Card>
  );
}
```

### Botón con Loading

```tsx
import { LoadingSpinnerInline } from '@/components/ui/loading-spinner';

<button disabled={isLoading}>
  {isLoading ? (
    <>
      <LoadingSpinnerInline variant="white" />
      <span className="ml-2">Guardando...</span>
    </>
  ) : (
    'Guardar'
  )}
</button>
```

---

## ❌ Anti-patrones (NO HACER)

### ❌ Múltiples spinners en una página

```tsx
// ❌ MAL: Dos loaders diferentes
if (statsLoading) return <div className="animate-spin..."></div>;
if (dataLoading) return <div className="loading..."></div>;
```

```tsx
// ✅ BIEN: Un loader unificado
if (statsLoading || dataLoading) {
  return <LoadingSpinnerFullPage label="Cargando..." />;
}
```

### ❌ Spinners inline sin componente

```tsx
// ❌ MAL: HTML directo
<div className="w-4 h-4 border-2 border-blue-600 animate-spin"></div>
```

```tsx
// ✅ BIEN: Componente reutilizable
<LoadingSpinnerInline variant="primary" />
```

### ❌ Estilos inconsistentes

```tsx
// ❌ MAL: Diferentes tamaños y colores
<div className="h-12 w-12 border-b-2 border-blue-600"></div>
<div className="h-10 w-10 border-4 border-green-500"></div>
```

```tsx
// ✅ BIEN: Variantes consistentes
<LoadingSpinner size="lg" variant="success" />
<LoadingSpinner size="md" variant="primary" />
```

---

## 🔄 Migración desde Spinners Antiguos

### Buscar y reemplazar

```bash
# Encontrar todos los spinners antiguos
grep -r "animate-spin" src/

# Patrones comunes a reemplazar:
# 1. <div className="animate-spin rounded-full h-12 w-12 border-b-2">
# 2. <Loader2 className="w-8 h-8 animate-spin" />
# 3. Custom spinners con border-t-transparent
```

### Tabla de equivalencias

| Antes | Después |
|-------|---------|
| `<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>` | `<LoadingSpinner size="lg" variant="primary" />` |
| `<Loader2 className="w-8 h-8 animate-spin text-blue-600" />` | `<LoadingSpinner size="md" variant="primary" />` |
| `return <div>Loading...</div>` en página | `return <LoadingSpinnerFullPage label="Loading..." />` |

---

## ✅ Checklist de Implementación

Al agregar loading a una nueva página/componente:

- [ ] Importar el componente correcto según el contexto
- [ ] Usar la variante de color apropiada (rol/contexto)
- [ ] Agregar label descriptivo y útil
- [ ] Unificar múltiples loading states si existen
- [ ] Verificar responsive (mobile/desktop)
- [ ] Testear con conexión lenta (throttling)

---

## 🚀 Próximos Pasos

1. **Migrar spinners restantes:** Actualizar todas las páginas que aún usan spinners custom
2. **Agregar tests:** Unit tests para los componentes de loading
3. **Skeleton loaders:** Implementar skeletons para mejor UX
4. **Progressive loading:** Lazy load para secciones pesadas

---

## 📞 Soporte

Si tienes dudas sobre qué componente usar o cómo implementarlo:
- Revisa los ejemplos en esta guía
- Consulta el código fuente: `src/components/ui/loading-spinner.tsx`
- Revisa páginas ya migradas: `propietario/caballos/page.tsx`

---

**Versión:** 2.0.0  
**Última actualización:** 2025-11-17  
**Autor:** HandicApp Team
