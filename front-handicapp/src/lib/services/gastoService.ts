import ApiClient from './apiClient';

export interface Gasto {
  id: number;
  usuario_id: number;
  caballo_id?: number;
  monto: number;
  descripcion?: string;
  fecha: Date;
  categoria?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface GastosStats {
  mesActual: number;
  mesAnterior: number;
  diferencia: number;
  tipo: 'aumento' | 'disminucion';
}

export const gastoService = {
  async getAll(params?: { 
    fecha_desde?: string; 
    fecha_hasta?: string;
    caballo_id?: number;
  }): Promise<Gasto[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.fecha_desde) {
      queryParams.append('fecha_desde', params.fecha_desde);
    }
    if (params?.fecha_hasta) {
      queryParams.append('fecha_hasta', params.fecha_hasta);
    }
    if (params?.caballo_id) {
      queryParams.append('caballo_id', params.caballo_id.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/gastos?${queryString}` : '/gastos';
    
    const response = await (ApiClient as unknown as { request: (endpoint: string) => Promise<{ data?: Gasto[] }> }).request(endpoint);
    return (response.data || []) as Gasto[];
  },

  async getStats(): Promise<GastosStats> {
    const ahora = new Date();
    
    // Mes actual
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMesActual = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    
    // Mes anterior
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);
    
    try {
      const [gastosActuales, gastosAnteriores] = await Promise.all([
        this.getAll({ 
          fecha_desde: inicioMesActual.toISOString(), 
          fecha_hasta: finMesActual.toISOString() 
        }),
        this.getAll({ 
          fecha_desde: inicioMesAnterior.toISOString(), 
          fecha_hasta: finMesAnterior.toISOString() 
        })
      ]);
      
      const mesActual = gastosActuales.reduce((sum, g) => sum + Number(g.monto), 0);
      const mesAnterior = gastosAnteriores.reduce((sum, g) => sum + Number(g.monto), 0);
      
      const diferencia = mesAnterior > 0 
        ? ((mesActual - mesAnterior) / mesAnterior) * 100 
        : 0;
      
      return {
        mesActual,
        mesAnterior,
        diferencia: Math.abs(diferencia),
        tipo: diferencia >= 0 ? 'aumento' : 'disminucion'
      };
    } catch (error) {
      console.error('Error getting gastos stats:', error);
      return {
        mesActual: 0,
        mesAnterior: 0,
        diferencia: 0,
        tipo: 'aumento'
      };
    }
  }
};
