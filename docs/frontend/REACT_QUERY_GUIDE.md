# 🚀 React Query - Guía de Implementación

## 📦 Lo Implementado

### 1. Provider Configurado ✅
- `ReactQueryProvider` con configuración optimizada
- Cache de 5 minutos por defecto
- Retry automático
- DevTools en desarrollo

### 2. Hooks de Inventario ✅
- `useProductos()` - Lista con filtros
- `useProducto(id)` - Detalle
- `useCategorias()` - Categorías
- `useProveedores()` - Proveedores
- `useMovimientos()` - Movimientos
- `useAlertasStock()` - Alertas (auto-refetch cada 5 min)
- `useEstadisticas()` - KPIs
- `useCrearProducto()` - Crear
- `useActualizarProducto()` - Actualizar
- `useEliminarProducto()` - Eliminar
- `useCrearMovimiento()` - Nuevo movimiento

---

## 🎯 Ejemplo de Uso

### Antes (sin React Query):
```tsx
'use client';

import { useState, useEffect } from 'react';
import { inventarioService } from '@/lib/inventarioService';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    setLoading(true);
    try {
      const data = await inventarioService.getProductos();
      setProductos(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await inventarioService.crearProducto(data);
      await loadProductos(); // Reload manual
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {productos.map(p => <div key={p.id}>{p.nombre}</div>)}
    </div>
  );
}
```

### Después (con React Query) ✅:
```tsx
'use client';

import { useProductos, useCrearProducto } from '@/lib/hooks';

export default function ProductosPage() {
  // ✅ 1 línea en lugar de useState + useEffect
  const { data: productos, isLoading, error, refetch } = useProductos();
  
  // ✅ Mutations con invalidación automática
  const crearProducto = useCrearProducto();

  const handleCreate = (data) => {
    crearProducto.mutate(data); // ✅ Auto-refetch después de crear
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>🔄 Refrescar</button>
      {productos?.map(p => <div key={p.id}>{p.nombre}</div>)}
    </div>
  );
}
```

---

## 🎨 Ejemplos Completos

### 1. Lista con Filtros
```tsx
'use client';

import { useState } from 'react';
import { useProductos } from '@/lib/hooks';

export default function ProductosConFiltros() {
  const [filtros, setFiltros] = useState({ categoria_id: undefined });
  
  // ✅ Cache automático por filtros diferentes
  const { data: productos, isLoading } = useProductos(filtros);

  return (
    <div>
      <select onChange={(e) => setFiltros({ categoria_id: +e.target.value })}>
        <option value="">Todas</option>
        <option value="1">Alimentos</option>
        <option value="2">Medicamentos</option>
      </select>

      {isLoading && <p>Cargando...</p>}
      
      <ul>
        {productos?.map(p => (
          <li key={p.id}>{p.nombre} - Stock: {p.stock_actual}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. Detalle de Producto
```tsx
'use client';

import { useProducto } from '@/lib/hooks';

export default function ProductoDetalle({ id }: { id: number }) {
  // ✅ Cache individual por producto
  const { data: producto, isLoading } = useProducto(id);

  if (isLoading) return <div>Cargando...</div>;
  if (!producto) return <div>No encontrado</div>;

  return (
    <div>
      <h1>{producto.nombre}</h1>
      <p>Stock: {producto.stock_actual}</p>
      <p>Precio: ${producto.precio_unitario}</p>
    </div>
  );
}
```

### 3. Crear Producto
```tsx
'use client';

import { useState } from 'react';
import { useCrearProducto } from '@/lib/hooks';

export default function CrearProductoForm() {
  const [nombre, setNombre] = useState('');
  const crearProducto = useCrearProducto();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    crearProducto.mutate({
      nombre,
      codigo: 'AUTO',
      categoria_id: 1,
      unidad_medida: 'unidad',
      stock_actual: 0,
      stock_minimo: 10,
      stock_maximo: 100,
      precio_unitario: 0,
    }, {
      onSuccess: () => {
        alert('✅ Producto creado');
        setNombre('');
        // ✅ Cache se invalida automáticamente
      },
      onError: (error) => {
        alert('❌ Error: ' + error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del producto"
      />
      <button type="submit" disabled={crearProducto.isPending}>
        {crearProducto.isPending ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}
```

### 4. Editar Producto
```tsx
'use client';

import { useProducto, useActualizarProducto } from '@/lib/hooks';

export default function EditarProducto({ id }: { id: number }) {
  const { data: producto } = useProducto(id);
  const actualizarProducto = useActualizarProducto();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    actualizarProducto.mutate({
      id,
      data: {
        nombre: formData.get('nombre'),
        stock_minimo: +formData.get('stock_minimo'),
      },
    }, {
      onSuccess: () => {
        alert('✅ Actualizado');
        // ✅ Cache se actualiza automáticamente
      },
    });
  };

  if (!producto) return null;

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" defaultValue={producto.nombre} />
      <input name="stock_minimo" type="number" defaultValue={producto.stock_minimo} />
      <button type="submit">Guardar</button>
    </form>
  );
}
```

### 5. Eliminar Producto
```tsx
'use client';

import { useEliminarProducto } from '@/lib/hooks';

export default function EliminarButton({ id }: { id: number }) {
  const eliminarProducto = useEliminarProducto();

  const handleEliminar = () => {
    if (!confirm('¿Eliminar?')) return;
    
    eliminarProducto.mutate(id, {
      onSuccess: () => {
        alert('✅ Eliminado');
        // ✅ Cache se invalida automáticamente
      },
    });
  };

  return (
    <button onClick={handleEliminar} disabled={eliminarProducto.isPending}>
      {eliminarProducto.isPending ? 'Eliminando...' : '🗑️ Eliminar'}
    </button>
  );
}
```

### 6. Alertas con Auto-Refetch
```tsx
'use client';

import { useAlertasStock } from '@/lib/hooks';

export default function AlertasWidget() {
  // ✅ Auto-refetch cada 5 minutos
  const { data: alertas, dataUpdatedAt } = useAlertasStock();

  return (
    <div>
      <h3>Alertas de Stock</h3>
      <p className="text-xs">
        Última actualización: {new Date(dataUpdatedAt).toLocaleTimeString()}
      </p>
      
      {alertas?.map(alerta => (
        <div key={alerta.producto_id} className={`alert-${alerta.tipo}`}>
          {alerta.producto_nombre}: {alerta.stock_actual} unidades
          (Mínimo: {alerta.stock_minimo})
        </div>
      ))}
    </div>
  );
}
```

### 7. Dashboard con KPIs
```tsx
'use client';

import { useEstadisticas } from '@/lib/hooks';

export default function DashboardKPIs() {
  const { data: stats, isLoading } = useEstadisticas();

  if (isLoading) return <div>Cargando KPIs...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="kpi-card">
        <h3>Total Productos</h3>
        <p className="text-3xl">{stats?.total_productos}</p>
      </div>
      
      <div className="kpi-card">
        <h3>Valor Inventario</h3>
        <p className="text-3xl">${stats?.valor_inventario.toLocaleString()}</p>
      </div>
      
      <div className="kpi-card">
        <h3>Alertas Stock</h3>
        <p className="text-3xl text-red-600">{stats?.alertas_stock}</p>
      </div>
      
      <div className="kpi-card">
        <h3>Movimientos Mes</h3>
        <p className="text-3xl">{stats?.movimientos_mes}</p>
      </div>
    </div>
  );
}
```

### 8. Prefetch en Hover (Optimización)
```tsx
'use client';

import { useProductos, usePrefetchProducto } from '@/lib/hooks';

export default function ProductosList() {
  const { data: productos } = useProductos();
  const prefetchProducto = usePrefetchProducto();

  return (
    <ul>
      {productos?.map(p => (
        <li
          key={p.id}
          onMouseEnter={() => prefetchProducto(p.id)} // ✅ Precarga en hover
        >
          <a href={`/productos/${p.id}`}>{p.nombre}</a>
        </li>
      ))}
    </ul>
  );
}
```

---

## 🎯 Beneficios

### Antes:
- ❌ 20+ líneas por query
- ❌ Loading states manuales
- ❌ Error handling manual
- ❌ Refetch manual después de mutations
- ❌ No cache
- ❌ Requests duplicados

### Después (React Query):
- ✅ **1 línea** por query
- ✅ Loading/Error automático
- ✅ Cache inteligente (5 min)
- ✅ Refetch automático después de mutations
- ✅ Deduplicación de requests
- ✅ Refetch on window focus
- ✅ Retry automático
- ✅ DevTools para debugging

---

## 📊 Cache Management

### Invalidación Automática

Cuando creas/actualizas/eliminas un producto, React Query invalida automáticamente:
- Lista de productos
- Producto individual
- Estadísticas
- Productos por categoría

```typescript
// Esto sucede automáticamente
useCrearProducto() → invalida productos, estadisticas
useActualizarProducto() → invalida producto, productos, estadisticas
useEliminarProducto() → invalida producto, productos, estadisticas, categorias
```

### Stale Time

| Query | Stale Time | Por qué |
|-------|------------|---------|
| Productos | 2 min | Cambian frecuentemente |
| Producto individual | 5 min | Detalle cambia menos |
| Categorías | 10 min | Rara vez cambian |
| Proveedores | 10 min | Rara vez cambian |
| Movimientos | 1 min | Se actualizan muy seguido |
| Alertas | 2 min + auto-refetch | Críticas |
| Estadísticas | 5 min | Agregadas |

---

## 🔧 DevTools

En desarrollo, verás un botón flotante en la esquina inferior derecha.

**Features:**
- 📊 Ver todas las queries activas
- ⏱️ Ver stale/fresh status
- 🔄 Refetch manual
- 🗑️ Clear cache
- 📈 Ver fetch count

---

## ✅ Próximos Pasos

1. **Migrar más páginas** a React Query
   - Personal
   - Reportes
   - Caballos
   - Tareas

2. **Optimistic Updates** (para mejor UX)
```tsx
useActualizarProducto({
  onMutate: async (newData) => {
    // Actualizar UI inmediatamente (optimistic)
    queryClient.setQueryData(['producto', id], newData);
  },
});
```

3. **Infinite Scroll** (para listas largas)
```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['productos'],
  queryFn: ({ pageParam = 1 }) => getProductos(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

---

**Status:** ✅ Implementado y funcional  
**Siguiente:** Aplicar a más páginas del dashboard
