/**
 * React Query Hooks para Inventario
 * 
 * Hooks optimizados con cache automático para mejor UX
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '../inventarioService';
import type {
  CrearProductoDTO,
  ActualizarProductoDTO,
  CrearMovimientoDTO,
  FiltrosProductos,
  FiltrosMovimientos,
} from '../inventarioService';

// ============================================
// QUERY KEYS - Centralizadas
// ============================================

export const inventarioKeys = {
  all: ['inventario'] as const,
  productos: () => [...inventarioKeys.all, 'productos'] as const,
  producto: (id: number) => [...inventarioKeys.productos(), id] as const,
  productosFiltrados: (filtros?: FiltrosProductos) =>
    [...inventarioKeys.productos(), 'filtrados', filtros] as const,
  categorias: () => [...inventarioKeys.all, 'categorias'] as const,
  proveedores: () => [...inventarioKeys.all, 'proveedores'] as const,
  movimientos: () => [...inventarioKeys.all, 'movimientos'] as const,
  movimientosFiltrados: (filtros?: FiltrosMovimientos) =>
    [...inventarioKeys.movimientos(), 'filtrados', filtros] as const,
  alertas: () => [...inventarioKeys.all, 'alertas'] as const,
  estadisticas: () => [...inventarioKeys.all, 'estadisticas'] as const,
  productosPorCategoria: () =>
    [...inventarioKeys.all, 'productos-por-categoria'] as const,
  movimientosPorTipo: () => [...inventarioKeys.all, 'movimientos-por-tipo'] as const,
};

// ============================================
// QUERIES - Lectura de datos
// ============================================

/**
 * Hook para obtener lista de productos con filtros
 */
export function useProductos(filtros?: FiltrosProductos) {
  return useQuery({
    queryKey: inventarioKeys.productosFiltrados(filtros),
    queryFn: () => inventarioService.getProductos(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener un producto específico
 */
export function useProducto(id: number) {
  return useQuery({
    queryKey: inventarioKeys.producto(id),
    queryFn: () => inventarioService.getProducto(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener categorías
 */
export function useCategorias() {
  return useQuery({
    queryKey: inventarioKeys.categorias(),
    queryFn: () => inventarioService.getCategorias(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener proveedores
 */
export function useProveedores() {
  return useQuery({
    queryKey: inventarioKeys.proveedores(),
    queryFn: () => inventarioService.getProveedores(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener movimientos con filtros
 */
export function useMovimientos(filtros?: FiltrosMovimientos) {
  return useQuery({
    queryKey: inventarioKeys.movimientosFiltrados(filtros),
    queryFn: () => inventarioService.getMovimientos(filtros),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener alertas de stock
 */
export function useAlertasStock() {
  return useQuery({
    queryKey: inventarioKeys.alertas(),
    queryFn: () => inventarioService.getAlertasStock(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  });
}

/**
 * Hook para obtener estadísticas generales
 */
export function useEstadisticas() {
  return useQuery({
    queryKey: inventarioKeys.estadisticas(),
    queryFn: () => inventarioService.getEstadisticas(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener productos por categoría
 */
export function useProductosPorCategoria() {
  return useQuery({
    queryKey: inventarioKeys.productosPorCategoria(),
    queryFn: () => inventarioService.getProductosPorCategoria(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener movimientos por tipo
 */
export function useMovimientosPorTipo() {
  return useQuery({
    queryKey: inventarioKeys.movimientosPorTipo(),
    queryFn: () => inventarioService.getMovimientosPorTipo(),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// MUTATIONS - Escritura de datos
// ============================================

/**
 * Hook para crear un nuevo producto
 */
export function useCrearProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearProductoDTO) => inventarioService.crearProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productosPorCategoria() });
    },
  });
}

/**
 * Hook para actualizar un producto
 */
export function useActualizarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarProductoDTO }) =>
      inventarioService.actualizarProducto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.producto(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useEliminarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inventarioService.eliminarProducto(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.producto(id) });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productosPorCategoria() });
    },
  });
}

/**
 * Hook para crear un movimiento
 */
export function useCrearMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearMovimientoDTO) => inventarioService.crearMovimiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movimientos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.alertas() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movimientosPorTipo() });
    },
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook para prefetch de un producto (optimización)
 */
export function usePrefetchProducto() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: inventarioKeys.producto(id),
      queryFn: () => inventarioService.getProducto(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar manualmente el cache
 */
export function useInvalidateInventario() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
  };
}
