import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generarReporteCaballosPDF,
  generarReporteHistorialMedicoPDF,
  generarReporteEventosPDF,
  exportarCaballosExcel,
  exportarEventosExcel,
  exportarDatosCompletosExcel,
} from './reporteService';
import { type Caballo } from './caballoService';
import { type Evento } from './eventoService';

// Mock de jsPDF
vi.mock('jspdf', () => {
  const mockDoc = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    setTextColor: vi.fn(),
    save: vi.fn(),
    internal: {
      getNumberOfPages: vi.fn(() => 1),
    },
  };
  return {
    default: vi.fn(() => mockDoc),
  };
});

// Mock de jspdf-autotable
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

// Mock de xlsx
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe('reporteService', () => {
  const mockCaballos: Caballo[] = [
    {
      id: 1,
      nombre: 'Thunder',
      sexo: 'macho',
      fecha_nacimiento: '2020-01-15',
      pelaje: 'alazán',
      raza: 'Pura Sangre',
      disciplina: 'turf',
      microchip: 'MC123456',
      foto_url: null,
      estado_global: 'activo',
      padre_id: null,
      madre_id: null,
      rp: null,
      sba: null,
      adn: null,
      pasaporte: null,
      numero_fei: null,
      ueln: null,
      altura: 165,
      peso: 480,
      creado_el: '2024-01-01T00:00:00Z',
      actualizado_el: null,
    },
    {
      id: 2,
      nombre: 'Lightning',
      sexo: 'hembra',
      fecha_nacimiento: '2021-03-20',
      pelaje: 'tordillo',
      raza: 'Árabe',
      disciplina: 'equitacion',
      microchip: 'MC789012',
      foto_url: null,
      estado_global: 'activo',
      padre_id: null,
      madre_id: null,
      rp: null,
      sba: null,
      adn: null,
      pasaporte: null,
      numero_fei: null,
      ueln: null,
      altura: 155,
      peso: 420,
      creado_el: '2024-02-01T00:00:00Z',
      actualizado_el: null,
    },
  ];

  const mockEventos: Evento[] = [
    {
      id: 1,
      tipo_evento_id: 1,
      caballo_id: 1,
      titulo: 'Vacunación Anual',
      descripcion: 'Vacunación completa',
      fecha_evento: '2024-10-01T10:00:00Z',
      ubicacion: 'Veterinaria Central',
      estado: 'completado',
      prioridad: 'alta',
      validado: true,
      creado_por_usuario_id: 1,
      creado_el: '2024-09-20T00:00:00Z',
      actualizado_el: '2024-10-01T11:00:00Z',
      caballo: {
        id: 1,
        nombre: 'Thunder',
      },
      tipo_evento: {
        id: 1,
        nombre: 'Vacunación',
        categoria: 'salud',
      },
    },
    {
      id: 2,
      tipo_evento_id: 2,
      caballo_id: 2,
      titulo: 'Entrenamiento',
      descripcion: 'Entrenamiento de salto',
      fecha_evento: '2024-10-15T08:00:00Z',
      ubicacion: 'Campo de Polo',
      estado: 'pendiente',
      prioridad: 'media',
      validado: false,
      creado_por_usuario_id: 1,
      creado_el: '2024-10-10T00:00:00Z',
      actualizado_el: '2024-10-10T00:00:00Z',
      caballo: {
        id: 2,
        nombre: 'Lightning',
      },
      tipo_evento: {
        id: 2,
        nombre: 'Entrenamiento',
        categoria: 'actividad',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generarReporteCaballosPDF', () => {
    it('debe generar PDF de caballos sin errores', async () => {
      await expect(generarReporteCaballosPDF(mockCaballos)).resolves.not.toThrow();
    });

    it('debe aceptar opciones personalizadas', async () => {
      await expect(
        generarReporteCaballosPDF(mockCaballos, {
          titulo: 'Reporte Personalizado',
          subtitulo: 'Test',
          orientacion: 'landscape',
        })
      ).resolves.not.toThrow();
    });

    it('debe manejar lista vacía de caballos', async () => {
      await expect(generarReporteCaballosPDF([])).resolves.not.toThrow();
    });
  });

  describe('generarReporteHistorialMedicoPDF', () => {
    it('debe generar PDF de historial médico', async () => {
      await expect(
        generarReporteHistorialMedicoPDF(mockCaballos[0], mockEventos)
      ).resolves.not.toThrow();
    });

    it('debe manejar caballo sin eventos', async () => {
      await expect(
        generarReporteHistorialMedicoPDF(mockCaballos[0], [])
      ).resolves.not.toThrow();
    });
  });

  describe('generarReporteEventosPDF', () => {
    it('debe generar PDF de eventos', async () => {
      await expect(generarReporteEventosPDF(mockEventos)).resolves.not.toThrow();
    });

    it('debe aceptar orientación landscape', async () => {
      await expect(
        generarReporteEventosPDF(mockEventos, {
          orientacion: 'landscape',
        })
      ).resolves.not.toThrow();
    });

    it('debe manejar lista vacía de eventos', async () => {
      await expect(generarReporteEventosPDF([])).resolves.not.toThrow();
    });
  });

  describe('exportarCaballosExcel', () => {
    it('debe exportar caballos a Excel sin errores', () => {
      expect(() => exportarCaballosExcel(mockCaballos)).not.toThrow();
    });

    it('debe manejar lista vacía', () => {
      expect(() => exportarCaballosExcel([])).not.toThrow();
    });
  });

  describe('exportarEventosExcel', () => {
    it('debe exportar eventos a Excel sin errores', () => {
      expect(() => exportarEventosExcel(mockEventos)).not.toThrow();
    });

    it('debe manejar lista vacía', () => {
      expect(() => exportarEventosExcel([])).not.toThrow();
    });
  });

  describe('exportarDatosCompletosExcel', () => {
    it('debe exportar datos completos sin errores', () => {
      expect(() =>
        exportarDatosCompletosExcel({
          caballos: mockCaballos,
          eventos: mockEventos,
        })
      ).not.toThrow();
    });

    it('debe manejar solo caballos', () => {
      expect(() =>
        exportarDatosCompletosExcel({
          caballos: mockCaballos,
        })
      ).not.toThrow();
    });

    it('debe manejar solo eventos', () => {
      expect(() =>
        exportarDatosCompletosExcel({
          eventos: mockEventos,
        })
      ).not.toThrow();
    });

    it('debe manejar datos vacíos', () => {
      expect(() => exportarDatosCompletosExcel({})).not.toThrow();
    });
  });
});
