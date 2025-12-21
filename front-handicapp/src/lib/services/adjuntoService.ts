import { ApiClient } from './apiClient';

export interface Adjunto {
  id: number;
  caballo_id: number | null;
  evento_id: number | null;
  subido_por_usuario_id: number;
  rol_autor: string | null;
  categoria: 'propietario' | 'operativo' | 'salud' | 'otro';
  nombre_archivo: string;
  tipo_mime: string;
  tamanio_bytes: string | null;
  ruta_almacenamiento: string;
  creado_el: string;
  eliminado_el: string | null;
  subido_por?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface AdjuntoStats {
  propietario: number;
  operativo: number;
  salud: number;
  otro: number;
}

class AdjuntoServiceClass {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

  /**
   * Obtener todos los adjuntos de un caballo
   */
  async getAdjuntosByCaballo(caballoId: number): Promise<Adjunto[]> {
    const response: any = await fetch(`${this.baseUrl}/caballos/${caballoId}/adjuntos`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener adjuntos');
    const result = await response.json();
    return result.data || [];
  }

  /**
   * Obtener todos los adjuntos de un evento
   */
  async getAdjuntosByEvento(eventoId: number): Promise<Adjunto[]> {
    const response = await fetch(`${this.baseUrl}/eventos/${eventoId}/adjuntos`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener adjuntos');
    const result = await response.json();
    return result.data || [];
  }

  /**
   * Obtener estadísticas de adjuntos por categoría
   */
  async getEstadisticasByCaballo(caballoId: number): Promise<AdjuntoStats> {
    const response = await fetch(`${this.baseUrl}/caballos/${caballoId}/adjuntos/estadisticas`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener estadísticas');
    const result = await response.json();
    return result.data || { propietario: 0, operativo: 0, salud: 0, otro: 0 };
  }

  /**
   * Subir un nuevo adjunto
   * @param file - Archivo a subir
   * @param data - Datos del adjunto (caballo_id o evento_id, categoria)
   */
  async uploadAdjunto(
    file: File,
    data: {
      caballo_id?: number;
      evento_id?: number;
      categoria: 'propietario' | 'operativo' | 'salud' | 'otro';
    }
  ): Promise<{
    id: number;
    url: string;
    filename: string;
    categoria: string;
    tipo_mime: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (data.caballo_id) {
      formData.append('caballo_id', data.caballo_id.toString());
    }
    if (data.evento_id) {
      formData.append('evento_id', data.evento_id.toString());
    }
    formData.append('categoria', data.categoria);

    const response = await fetch('/api/v1/adjuntos/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al subir adjunto' }));
      throw new Error(errorData.message || 'Error al subir adjunto');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Obtener URL de descarga de un adjunto
   */
  getDownloadUrl(adjuntoId: number): string {
    return `${this.baseUrl}/adjuntos/${adjuntoId}/download`;
  }

  /**
   * Eliminar un adjunto (soft delete)
   */
  async deleteAdjunto(adjuntoId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/adjuntos/${adjuntoId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al eliminar adjunto');
  }

  /**
   * Obtener información de un adjunto específico
   */
  async getAdjuntoById(adjuntoId: number): Promise<Adjunto> {
    const response = await fetch(`${this.baseUrl}/adjuntos/${adjuntoId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener adjunto');
    const result = await response.json();
    if (!result.data) {
      throw new Error('Adjunto no encontrado');
    }
    return result.data;
  }

  /**
   * Formatear tamaño de archivo para mostrar
   */
  formatFileSize(bytes: string | number | null): string {
    if (!bytes) return '0 B';
    
    const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (numBytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Obtener icono según tipo de archivo
   */
  getFileIcon(tipoMime: string): string {
    if (tipoMime.startsWith('image/')) return '🖼️';
    if (tipoMime.includes('pdf')) return '📄';
    if (tipoMime.includes('word') || tipoMime.includes('document')) return '📝';
    if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) return '📊';
    if (tipoMime.includes('video')) return '🎥';
    return '📎';
  }

  /**
   * Obtener color según categoría
   */
  getCategoryColor(categoria: string): string {
    switch (categoria) {
      case 'propietario':
        return 'bg-blue-100 text-blue-800';
      case 'operativo':
        return 'bg-green-100 text-green-800';
      case 'salud':
        return 'bg-red-100 text-red-800';
      case 'otro':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtener nombre legible de categoría
   */
  getCategoryName(categoria: string): string {
    const nombres: Record<string, string> = {
      propietario: 'Propietario',
      operativo: 'Operativo',
      salud: 'Salud',
      otro: 'Otro',
    };
    return nombres[categoria] || categoria;
  }
}

export const AdjuntoService = new AdjuntoServiceClass();
