export interface QRCode {
  id: number;
  caballo_id: number;
  token: string;
  estado: 'active' | 'revoked' | 'expired';
  expira_el: string | null;
  creado_el: string;
  download_url?: string;
  scan_url?: string;
}

export interface QRValidation {
  valid: boolean;
  message?: string;
  qr_code?: {
    id: number;
    estado: string;
    expira_el: string | null;
  };
  caballo?: {
    id: number;
    nombre: string;
    microchip: string;
    raza: string;
    sexo: string;
    fecha_nacimiento: string;
  };
}

class QRCodeServiceClass {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * Obtener o crear QR code para un caballo
   */
  async getOrCreateQR(caballoId: number, forceNew: boolean = false): Promise<QRCode> {
    const url = `${this.baseUrl}/caballos/${caballoId}/qr${forceNew ? '?force=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener QR code' }));
      throw new Error(errorData.message || 'Error al obtener QR code');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Validar un QR code
   */
  async validateQR(token: string): Promise<QRValidation> {
    const response = await fetch(`${this.baseUrl}/qr/validate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Error al validar QR code');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Obtener información del caballo por QR token
   */
  async getCaballoByQR(token: string): Promise<{
    id: number;
    nombre: string;
    microchip: string;
    raza: string;
    sexo: string;
    fecha_nacimiento: string;
    foto_url?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/qr/${token}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'QR code inválido' }));
      throw new Error(errorData.message || 'QR code inválido');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Obtener URL de descarga del QR code
   */
  getDownloadUrl(token: string): string {
    return `${this.baseUrl}/qr/${token}/download`;
  }

  /**
   * Revocar un QR code
   */
  async revokeQR(qrId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/qr/${qrId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Error al revocar QR code');
    }
  }

  /**
   * Obtener todos los QR codes de un caballo
   */
  async getQRCodesByCaballo(caballoId: number): Promise<QRCode[]> {
    const response = await fetch(`${this.baseUrl}/caballos/${caballoId}/qr/todos`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Error al obtener QR codes');
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * Generar QR code como data URL para mostrar en canvas
   * Requiere la librería qrcode.react en el frontend
   */
  generateQRValue(token: string): string {
    const frontendUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${frontendUrl}/scan/${token}`;
  }

  /**
   * Descargar QR code como imagen PNG
   */
  async downloadQR(token: string, nombreCaballo: string): Promise<void> {
    try {
      const url = this.getDownloadUrl(token);
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al descargar QR code');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-${nombreCaballo || token}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR:', error);
      throw error;
    }
  }

  /**
   * Copiar enlace de escaneo al portapapeles
   */
  async copyQRLink(token: string): Promise<void> {
    const link = this.generateQRValue(token);
    try {
      await navigator.clipboard.writeText(link);
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Error copiando al portapapeles:', err);
        throw new Error('No se pudo copiar el enlace');
      }
      document.body.removeChild(textArea);
    }
  }

  /**
   * Obtener color del estado del QR
   */
  getStatusColor(estado: string): string {
    switch (estado) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtener nombre legible del estado
   */
  getStatusName(estado: string): string {
    const nombres: Record<string, string> = {
      active: 'Activo',
      revoked: 'Revocado',
      expired: 'Expirado',
    };
    return nombres[estado] || estado;
  }
}

export const QRCodeService = new QRCodeServiceClass();
