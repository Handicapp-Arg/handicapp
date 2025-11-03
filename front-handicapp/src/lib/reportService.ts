/**
 * Servicio de Generación de Reportes
 * Sistema profesional para exportar datos a PDF y Excel
 */

import { Caballo } from './services/caballoService';
import type jsPDF from 'jspdf';

// Tipos para jsPDF con autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: {
    startY?: number;
    head?: unknown[][];
    body?: unknown[][];
    theme?: string;
    headStyles?: Record<string, unknown>;
    alternateRowStyles?: Record<string, unknown>;
    margin?: Record<string, number>;
  }) => void;
  lastAutoTable: {
    finalY: number;
  };
}

// Tipos para configuración de reportes
export interface ReportConfig {
  title: string;
  subtitle?: string;
  author: string;
  date: string;
  filters?: Record<string, string>;
}

export interface CaballoReportData {
  caballo: Caballo;
  eventos?: Array<{
    id?: number;
    titulo?: string;
    fecha?: string;
    tipo?: string;
    estado?: string;
    [key: string]: unknown;
  }>;
  estadisticas?: {
    totalEventos: number;
    eventosPendientes: number;
    eventosCompletados: number;
    ultimaActualizacion: string;
  };
}

/**
 * Genera un reporte PDF de un caballo usando jsPDF
 */
export const generarPDFCaballo = async (data: CaballoReportData, config: ReportConfig): Promise<Blob> => {
  // Importación dinámica para reducir bundle size
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header - Logo y título
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(175, 147, 111); // #af936f
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(config.title, margin, 33);

  yPosition = 50;

  // Información del reporte
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Generado por: ${config.author}`, margin, yPosition);
  doc.text(`Fecha: ${config.date}`, pageWidth - margin - 40, yPosition);
  yPosition += 15;

  // Línea separadora
  doc.setDrawColor(175, 147, 111);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Información del Caballo
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Información del Caballo', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const caballoInfo = [
    ['Nombre', data.caballo.nombre],
    ['Sexo', data.caballo.sexo === 'macho' ? 'Macho' : data.caballo.sexo === 'hembra' ? 'Hembra' : 'N/A'],
    ['Fecha de Nacimiento', data.caballo.fecha_nacimiento || 'N/A'],
    ['Raza', data.caballo.raza || 'N/A'],
    ['Pelaje', data.caballo.pelaje || 'N/A'],
    ['Disciplina', data.caballo.disciplina || 'N/A'],
    ['Microchip', data.caballo.microchip || 'N/A'],
  ];

  // Agregar datos extendidos si existen
  if (data.caballo.altura) {
    caballoInfo.push(['Altura', `${data.caballo.altura} cm`]);
  }
  if (data.caballo.peso) {
    caballoInfo.push(['Peso', `${data.caballo.peso} kg`]);
  }
  if (data.caballo.rp) {
    caballoInfo.push(['R.P.', data.caballo.rp]);
  }
  if (data.caballo.sba) {
    caballoInfo.push(['S.B.A.', data.caballo.sba]);
  }
  if (data.caballo.adn) {
    caballoInfo.push(['ADN', data.caballo.adn]);
  }
  if (data.caballo.pasaporte) {
    caballoInfo.push(['Pasaporte', data.caballo.pasaporte]);
  }
  if (data.caballo.numero_fei) {
    caballoInfo.push(['N° FEI', data.caballo.numero_fei]);
  }
  if (data.caballo.ueln) {
    caballoInfo.push(['UELN', data.caballo.ueln]);
  }

  doc.autoTable({
    startY: yPosition,
    head: [['Campo', 'Valor']],
    body: caballoInfo,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Estadísticas (si existen)
  if (data.estadisticas) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Estadísticas', margin, yPosition);
    yPosition += 8;

    const estadisticas = [
      ['Total de Eventos', data.estadisticas.totalEventos.toString()],
      ['Eventos Pendientes', data.estadisticas.eventosPendientes.toString()],
      ['Eventos Completados', data.estadisticas.eventosCompletados.toString()],
      ['Última Actualización', data.estadisticas.ultimaActualizacion],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: estadisticas,
      theme: 'grid',
      headStyles: {
        fillColor: [175, 147, 111],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: margin, right: margin },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Eventos (si existen)
  if (data.eventos && data.eventos.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Eventos', margin, yPosition);
    yPosition += 8;

    const eventosData = data.eventos.map(evento => [
      evento.titulo || '',
      evento.fecha || '',
      evento.tipo || '',
      evento.estado || '',
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Título', 'Fecha', 'Tipo', 'Estado']],
      body: eventosData,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: margin, right: margin },
    });
  }

  // Footer en todas las páginas
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generado por Handicapp © 2025',
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  return doc.output('blob');
};

/**
 * Genera un reporte Excel usando SheetJS
 */
export const generarExcelCaballo = async (data: CaballoReportData, config: ReportConfig): Promise<Blob> => {
  // Importación dinámica
  const XLSX = await import('xlsx');

  const workbook = XLSX.utils.book_new();

  // Hoja 1: Información del Caballo
  const caballoData = [
    ['REPORTE DE CABALLO - HANDICAPP'],
    [''],
    ['Generado por:', config.author],
    ['Fecha:', config.date],
    [''],
    ['INFORMACIÓN BÁSICA'],
    ['Nombre', data.caballo.nombre],
    ['Sexo', data.caballo.sexo === 'macho' ? 'Macho' : data.caballo.sexo === 'hembra' ? 'Hembra' : 'N/A'],
    ['Fecha de Nacimiento', data.caballo.fecha_nacimiento || 'N/A'],
    ['Raza', data.caballo.raza || 'N/A'],
    ['Pelaje', data.caballo.pelaje || 'N/A'],
    ['Disciplina', data.caballo.disciplina || 'N/A'],
    ['Microchip', data.caballo.microchip || 'N/A'],
  ];

  // Agregar datos físicos
  if (data.caballo.altura || data.caballo.peso) {
    caballoData.push([''], ['DATOS FÍSICOS']);
    if (data.caballo.altura) caballoData.push(['Altura (cm)', data.caballo.altura.toString()]);
    if (data.caballo.peso) caballoData.push(['Peso (kg)', data.caballo.peso.toString()]);
  }

  // Agregar documentación oficial
  if (data.caballo.rp || data.caballo.sba || data.caballo.adn || data.caballo.pasaporte || data.caballo.numero_fei || data.caballo.ueln) {
    caballoData.push([''], ['DOCUMENTACIÓN OFICIAL']);
    if (data.caballo.rp) caballoData.push(['R.P.', data.caballo.rp]);
    if (data.caballo.sba) caballoData.push(['S.B.A.', data.caballo.sba]);
    if (data.caballo.adn) caballoData.push(['ADN', data.caballo.adn]);
    if (data.caballo.pasaporte) caballoData.push(['Pasaporte', data.caballo.pasaporte]);
    if (data.caballo.numero_fei) caballoData.push(['N° FEI', data.caballo.numero_fei]);
    if (data.caballo.ueln) caballoData.push(['UELN', data.caballo.ueln]);
  }

  // Agregar estadísticas
  if (data.estadisticas) {
    caballoData.push(
      [''],
      ['ESTADÍSTICAS'],
      ['Total de Eventos', data.estadisticas.totalEventos.toString()],
      ['Eventos Pendientes', data.estadisticas.eventosPendientes.toString()],
      ['Eventos Completados', data.estadisticas.eventosCompletados.toString()],
      ['Última Actualización', data.estadisticas.ultimaActualizacion]
    );
  }

  const ws1 = XLSX.utils.aoa_to_sheet(caballoData);

  // Estilos básicos
  ws1['!cols'] = [{ wch: 25 }, { wch: 40 }];

  XLSX.utils.book_append_sheet(workbook, ws1, 'Información');

  // Hoja 2: Eventos (si existen)
  if (data.eventos && data.eventos.length > 0) {
    const eventosData = [
      ['HISTORIAL DE EVENTOS'],
      [''],
      ['Título', 'Fecha', 'Tipo', 'Estado'],
    ];

    data.eventos.forEach(evento => {
      eventosData.push([
        evento.titulo || '',
        evento.fecha || '',
        evento.tipo || '',
        evento.estado || '',
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(eventosData);
    ws2['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, ws2, 'Eventos');
  }

  // Generar archivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Descarga un blob como archivo
 */
export const descargarArchivo = (blob: Blob, nombreArchivo: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Formatea una fecha para reportes
 */
export const formatearFechaReporte = (fecha: Date): string => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
};

// ==================== NUEVOS REPORTES ====================

/**
 * Datos para reporte de tratamientos
 */
export interface TratamientoReportData {
  tratamientos: Array<{
    id: number;
    titulo: string;
    caballo_nombre: string;
    descripcion: string;
    medicamentos?: string;
    dosis?: string;
    frecuencia?: string;
    fecha_inicio: string;
    fecha_fin?: string;
    estado: string;
    duracion_dias?: number;
  }>;
  estadisticas?: {
    total: number;
    activos: number;
    completados: number;
    suspendidos: number;
  };
}

/**
 * Genera un reporte PDF de tratamientos médicos
 */
export const generarPDFTratamientos = async (
  data: TratamientoReportData,
  config: ReportConfig
): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(175, 147, 111);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(config.title, margin, 33);

  yPosition = 50;

  // Info del reporte
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Generado por: ${config.author}`, margin, yPosition);
  doc.text(`Fecha: ${config.date}`, pageWidth - margin - 40, yPosition);
  yPosition += 15;

  // Línea separadora
  doc.setDrawColor(175, 147, 111);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Estadísticas
  if (data.estadisticas) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Tratamientos', margin, yPosition);
    yPosition += 8;

    const estadisticas = [
      ['Total', data.estadisticas.total.toString()],
      ['Activos', data.estadisticas.activos.toString()],
      ['Completados', data.estadisticas.completados.toString()],
      ['Suspendidos', data.estadisticas.suspendidos.toString()],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrica', 'Cantidad']],
      body: estadisticas,
      theme: 'grid',
      headStyles: {
        fillColor: [175, 147, 111],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: margin, right: margin },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Tabla de tratamientos
  if (data.tratamientos.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Tratamientos', margin, yPosition);
    yPosition += 8;

    const tratamientosData = data.tratamientos.map(t => [
      t.titulo,
      t.caballo_nombre,
      t.medicamentos || '-',
      t.dosis || '-',
      t.fecha_inicio,
      t.estado,
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Tratamiento', 'Paciente', 'Medicamento', 'Dosis', 'Inicio', 'Estado']],
      body: tratamientosData,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      margin: { left: margin, right: margin },
    });
  }

  // Footer
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Generado por Handicapp © 2025', pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc.output('blob');
};

/**
 * Genera un reporte Excel de tratamientos
 */
export const generarExcelTratamientos = async (
  data: TratamientoReportData,
  config: ReportConfig
): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Estadísticas
  const resumenData = [
    ['REPORTE DE TRATAMIENTOS - HANDICAPP'],
    [''],
    ['Generado por:', config.author],
    ['Fecha:', config.date],
    [''],
  ];

  if (data.estadisticas) {
    resumenData.push(
      ['RESUMEN'],
      ['Total de Tratamientos', data.estadisticas.total.toString()],
      ['Activos', data.estadisticas.activos.toString()],
      ['Completados', data.estadisticas.completados.toString()],
      ['Suspendidos', data.estadisticas.suspendidos.toString()],
      ['']
    );
  }

  const ws1 = XLSX.utils.aoa_to_sheet(resumenData);
  ws1['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, ws1, 'Resumen');

  // Hoja 2: Tratamientos detallados
  if (data.tratamientos.length > 0) {
    const tratamientosData = [
      ['LISTA DE TRATAMIENTOS'],
      [''],
      ['ID', 'Título', 'Paciente', 'Medicamentos', 'Dosis', 'Frecuencia', 'Inicio', 'Fin', 'Estado', 'Duración (días)'],
    ];

    data.tratamientos.forEach(t => {
      tratamientosData.push([
        t.id.toString(),
        t.titulo,
        t.caballo_nombre,
        t.medicamentos || '-',
        t.dosis || '-',
        t.frecuencia || '-',
        t.fecha_inicio,
        t.fecha_fin || '-',
        t.estado,
        t.duracion_dias?.toString() || '-',
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(tratamientosData);
    ws2['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws2, 'Tratamientos');
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Datos para reporte de eventos médicos
 */
export interface EventoMedicoReportData {
  eventos: Array<{
    id: number;
    titulo: string;
    caballo_nombre: string;
    tipo_consulta?: string;
    diagnostico?: string;
    tratamiento?: string;
    medicamentos?: string;
    fecha_evento: string;
    gravedad?: string;
    validado: boolean;
  }>;
  estadisticas?: {
    total: number;
    pendientes: number;
    validados: number;
    criticos: number;
  };
}

/**
 * Genera un reporte PDF de eventos médicos
 */
export const generarPDFEventosMedicos = async (
  data: EventoMedicoReportData,
  config: ReportConfig
): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(175, 147, 111);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(config.title, margin, 33);

  yPosition = 50;

  // Info del reporte
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Generado por: ${config.author}`, margin, yPosition);
  doc.text(`Fecha: ${config.date}`, pageWidth - margin - 40, yPosition);
  yPosition += 15;

  doc.setDrawColor(175, 147, 111);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Estadísticas
  if (data.estadisticas) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Eventos', margin, yPosition);
    yPosition += 8;

    const estadisticas = [
      ['Total de Eventos', data.estadisticas.total.toString()],
      ['Pendientes de Validación', data.estadisticas.pendientes.toString()],
      ['Validados', data.estadisticas.validados.toString()],
      ['Casos Críticos', data.estadisticas.criticos.toString()],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrica', 'Cantidad']],
      body: estadisticas,
      theme: 'grid',
      headStyles: {
        fillColor: [175, 147, 111],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: margin, right: margin },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Tabla de eventos
  if (data.eventos.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Eventos Médicos', margin, yPosition);
    yPosition += 8;

    const eventosData = data.eventos.map(e => [
      e.titulo,
      e.caballo_nombre,
      e.tipo_consulta || '-',
      e.diagnostico || '-',
      e.fecha_evento,
      e.gravedad || '-',
      e.validado ? 'Sí' : 'No',
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Evento', 'Paciente', 'Tipo', 'Diagnóstico', 'Fecha', 'Gravedad', 'Validado']],
      body: eventosData,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      margin: { left: margin, right: margin },
    });
  }

  // Footer
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Generado por Handicapp © 2025', pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc.output('blob');
};

/**
 * Genera un reporte Excel de eventos médicos
 */
export const generarExcelEventosMedicos = async (
  data: EventoMedicoReportData,
  config: ReportConfig
): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Estadísticas
  const resumenData = [
    ['REPORTE DE EVENTOS MÉDICOS - HANDICAPP'],
    [''],
    ['Generado por:', config.author],
    ['Fecha:', config.date],
    [''],
  ];

  if (data.estadisticas) {
    resumenData.push(
      ['RESUMEN'],
      ['Total de Eventos', data.estadisticas.total.toString()],
      ['Pendientes de Validación', data.estadisticas.pendientes.toString()],
      ['Validados', data.estadisticas.validados.toString()],
      ['Casos Críticos', data.estadisticas.criticos.toString()],
      ['']
    );
  }

  const ws1 = XLSX.utils.aoa_to_sheet(resumenData);
  ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, ws1, 'Resumen');

  // Hoja 2: Eventos detallados
  if (data.eventos.length > 0) {
    const eventosData = [
      ['LISTA DE EVENTOS MÉDICOS'],
      [''],
      ['ID', 'Título', 'Paciente', 'Tipo Consulta', 'Diagnóstico', 'Tratamiento', 'Medicamentos', 'Fecha', 'Gravedad', 'Validado'],
    ];

    data.eventos.forEach(e => {
      eventosData.push([
        e.id.toString(),
        e.titulo,
        e.caballo_nombre,
        e.tipo_consulta || '-',
        e.diagnostico || '-',
        e.tratamiento || '-',
        e.medicamentos || '-',
        e.fecha_evento,
        e.gravedad || '-',
        e.validado ? 'Sí' : 'No',
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(eventosData);
    ws2['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 15 },
      { wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws2, 'Eventos Médicos');
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Datos para reporte consolidado veterinario
 */
export interface ReporteConsolidadoData {
  caballos: {
    total: number;
    activos: number;
    porDisciplina: Array<{ disciplina: string; cantidad: number }>;
  };
  tratamientos: {
    total: number;
    activos: number;
    completados: number;
    suspendidos: number;
  };
  eventos: {
    total: number;
    pendientes: number;
    validados: number;
    criticos: number;
  };
  periodo: {
    desde: string;
    hasta: string;
  };
}

/**
 * Genera un reporte consolidado PDF del área veterinaria
 */
export const generarPDFReporteConsolidado = async (
  data: ReporteConsolidadoData,
  config: ReportConfig
): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(175, 147, 111);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('REPORTE CONSOLIDADO VETERINARIO', margin, 33);

  yPosition = 50;

  // Info del reporte
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Generado por: ${config.author}`, margin, yPosition);
  doc.text(`Fecha: ${config.date}`, pageWidth - margin - 40, yPosition);
  yPosition += 7;
  doc.text(`Período: ${data.periodo.desde} - ${data.periodo.hasta}`, margin, yPosition);
  yPosition += 13;

  doc.setDrawColor(175, 147, 111);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Sección Caballos
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Caballos', margin, yPosition);
  yPosition += 8;

  const caballosData = [
    ['Total de Caballos', data.caballos.total.toString()],
    ['Caballos Activos', data.caballos.activos.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: caballosData,
    theme: 'grid',
    headStyles: {
      fillColor: [175, 147, 111],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Sección Tratamientos
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Tratamientos Médicos', margin, yPosition);
  yPosition += 8;

  const tratamientosData = [
    ['Total de Tratamientos', data.tratamientos.total.toString()],
    ['Tratamientos Activos', data.tratamientos.activos.toString()],
    ['Completados', data.tratamientos.completados.toString()],
    ['Suspendidos', data.tratamientos.suspendidos.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: tratamientosData,
    theme: 'grid',
    headStyles: {
      fillColor: [175, 147, 111],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Sección Eventos
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Eventos Médicos', margin, yPosition);
  yPosition += 8;

  const eventosData = [
    ['Total de Eventos', data.eventos.total.toString()],
    ['Pendientes de Validación', data.eventos.pendientes.toString()],
    ['Validados', data.eventos.validados.toString()],
    ['Casos Críticos', data.eventos.criticos.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: eventosData,
    theme: 'grid',
    headStyles: {
      fillColor: [175, 147, 111],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Generado por Handicapp © 2025', pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc.output('blob');
};

// ==================== REPORTES DE ESTABLECIMIENTO ====================

export interface ReporteInventarioData {
  productos: Array<{
    id: number;
    codigo: string;
    nombre: string;
    categoria_nombre: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_unitario: number;
    estado: string;
  }>;
  estadisticas: {
    total_productos: number;
    productos_activos: number;
    valor_inventario: number;
    alertas_stock: number;
    movimientos_mes: number;
  };
  categoriaStats: Array<{
    categoria_nombre: string;
    total_productos: number;
    valor_total: number;
    porcentaje: number;
  }>;
  movimientos: Array<{
    producto_nombre: string;
    producto_codigo: string;
    tipo: string;
    cantidad: number;
    fecha: string;
    usuario_nombre: string;
    motivo: string;
  }>;
}

export interface ReportePersonalData {
  empleados: Array<{
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol_nombre: string;
    departamento?: string;
    puesto?: string;
    estado: string;
    fecha_ingreso: string;
    salario?: number;
  }>;
  estadisticas: {
    total_empleados: number;
    empleados_activos: number;
    turnos_hoy: number;
    ausencias_pendientes: number;
    tasa_rotacion: number;
  };
  turnos: Array<{
    id: number;
    empleado_nombre: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    tipo: string;
    estado: string;
  }>;
  ausencias: Array<{
    id: number;
    empleado_nombre: string;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string;
    dias_total: number;
    aprobada?: boolean;
    motivo?: string;
  }>;
}

export interface ReporteOperacionesData {
  inventario: {
    total_productos: number;
    productos_activos: number;
    valor_inventario: number;
    alertas_stock: number;
    movimientos_mes: number;
  };
  personal: {
    total_empleados: number;
    empleados_activos: number;
    turnos_hoy: number;
    ausencias_pendientes: number;
    tasa_rotacion: number;
  };
  productosStockBajo: Array<{
    nombre: string;
    codigo: string;
    stock_actual: number;
    stock_minimo: number;
  }>;
  empleadosActivos: Array<{
    nombre: string;
    apellido: string;
    rol_nombre: string;
  }>;
  fecha: string;
}

export const generarPDFInventario = async (data: ReporteInventarioData, config: ReportConfig): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(175, 147, 111);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(config.title, margin, 33);

  yPosition = 55;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Inventario', margin, yPosition);
  yPosition += 10;

  const statsData = [
    ['Total de Productos', data.estadisticas.total_productos.toString()],
    ['Productos Activos', data.estadisticas.productos_activos.toString()],
    ['Valor Total', `$${data.estadisticas.valor_inventario.toLocaleString('es-AR')}`],
    ['Alertas de Stock', data.estadisticas.alertas_stock.toString()],
    ['Movimientos del Mes', data.estadisticas.movimientos_mes.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [175, 147, 111] },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Listado de Productos', margin, yPosition);
  yPosition += 10;

  const productosData = data.productos.slice(0, 30).map(p => [
    p.codigo,
    p.nombre,
    p.categoria_nombre,
    p.stock_actual.toString(),
    p.estado,
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Código', 'Producto', 'Categoría', 'Stock', 'Estado']],
    body: productosData,
    theme: 'striped',
    headStyles: { fillColor: [175, 147, 111] },
    margin: { left: margin, right: margin },
  });

  return doc.output('blob');
};

export const generarExcelInventario = async (data: ReporteInventarioData /* config: ReportConfig */): Promise<Blob> => {
  const XLSX = await import('xlsx');

  const workbook = XLSX.utils.book_new();

  const resumenData = [
    ['Métrica', 'Valor'],
    ['Total de Productos', data.estadisticas.total_productos],
    ['Productos Activos', data.estadisticas.productos_activos],
    ['Valor Total', data.estadisticas.valor_inventario],
    ['Alertas de Stock', data.estadisticas.alertas_stock],
    ['Movimientos del Mes', data.estadisticas.movimientos_mes],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

  const productosData = data.productos.map(p => ({
    Código: p.codigo,
    Nombre: p.nombre,
    Categoría: p.categoria_nombre,
    'Stock Actual': p.stock_actual,
    'Stock Mínimo': p.stock_minimo,
    'Stock Máximo': p.stock_maximo,
    'Precio Unitario': p.precio_unitario,
    Estado: p.estado,
  }));
  const wsProductos = XLSX.utils.json_to_sheet(productosData);
  XLSX.utils.book_append_sheet(workbook, wsProductos, 'Productos');

  const movimientosData = data.movimientos.map(m => ({
    Producto: m.producto_nombre,
    Código: m.producto_codigo,
    Tipo: m.tipo,
    Cantidad: m.cantidad,
    Fecha: m.fecha,
    Usuario: m.usuario_nombre,
    Motivo: m.motivo,
  }));
  const wsMovimientos = XLSX.utils.json_to_sheet(movimientosData);
  XLSX.utils.book_append_sheet(workbook, wsMovimientos, 'Movimientos');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const generarPDFPersonal = async (data: ReportePersonalData, config: ReportConfig): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(175, 147, 111);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(config.title, margin, 33);

  yPosition = 55;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Personal', margin, yPosition);
  yPosition += 10;

  const statsData = [
    ['Total de Empleados', data.estadisticas.total_empleados.toString()],
    ['Empleados Activos', data.estadisticas.empleados_activos.toString()],
    ['Turnos Hoy', data.estadisticas.turnos_hoy.toString()],
    ['Ausencias Pendientes', data.estadisticas.ausencias_pendientes.toString()],
    ['Tasa de Rotación', `${data.estadisticas.tasa_rotacion}%`],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [175, 147, 111] },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Listado de Empleados', margin, yPosition);
  yPosition += 10;

  const empleadosData = data.empleados.map(e => [
    `${e.nombre} ${e.apellido}`,
    e.rol_nombre,
    e.departamento || '-',
    e.estado,
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Nombre', 'Rol', 'Departamento', 'Estado']],
    body: empleadosData,
    theme: 'striped',
    headStyles: { fillColor: [175, 147, 111] },
    margin: { left: margin, right: margin },
  });

  return doc.output('blob');
};

export const generarExcelPersonal = async (data: ReportePersonalData /* config: ReportConfig */): Promise<Blob> => {
  const XLSX = await import('xlsx');

  const workbook = XLSX.utils.book_new();

  const resumenData = [
    ['Métrica', 'Valor'],
    ['Total de Empleados', data.estadisticas.total_empleados],
    ['Empleados Activos', data.estadisticas.empleados_activos],
    ['Turnos Hoy', data.estadisticas.turnos_hoy],
    ['Ausencias Pendientes', data.estadisticas.ausencias_pendientes],
    ['Tasa de Rotación', `${data.estadisticas.tasa_rotacion}%`],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

  const empleadosData = data.empleados.map(e => ({
    Nombre: e.nombre,
    Apellido: e.apellido,
    Email: e.email,
    Teléfono: e.telefono || '-',
    Rol: e.rol_nombre,
    Departamento: e.departamento || '-',
    Puesto: e.puesto || '-',
    Estado: e.estado,
    'Fecha Ingreso': e.fecha_ingreso,
    Salario: e.salario || '-',
  }));
  const wsEmpleados = XLSX.utils.json_to_sheet(empleadosData);
  XLSX.utils.book_append_sheet(workbook, wsEmpleados, 'Empleados');

  const turnosData = data.turnos.map(t => ({
    Empleado: t.empleado_nombre,
    Fecha: t.fecha,
    'Hora Inicio': t.hora_inicio,
    'Hora Fin': t.hora_fin,
    Tipo: t.tipo,
    Estado: t.estado,
  }));
  const wsTurnos = XLSX.utils.json_to_sheet(turnosData);
  XLSX.utils.book_append_sheet(workbook, wsTurnos, 'Turnos');

  const ausenciasData = data.ausencias.map(a => ({
    Empleado: a.empleado_nombre,
    Tipo: a.tipo,
    'Fecha Inicio': a.fecha_inicio,
    'Fecha Fin': a.fecha_fin,
    'Días Total': a.dias_total,
    Aprobada: a.aprobada ? 'Sí' : 'No',
    Motivo: a.motivo || '-',
  }));
  const wsAusencias = XLSX.utils.json_to_sheet(ausenciasData);
  XLSX.utils.book_append_sheet(workbook, wsAusencias, 'Ausencias');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const generarPDFOperaciones = async (data: ReporteOperacionesData, config: ReportConfig): Promise<Blob> => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(175, 147, 111);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HANDICAPP', margin, 25);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(config.title, margin, 33);

  yPosition = 55;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estado del Inventario', margin, yPosition);
  yPosition += 10;

  const inventarioData = [
    ['Total de Productos', data.inventario.total_productos.toString()],
    ['Productos Activos', data.inventario.productos_activos.toString()],
    ['Valor Total', `$${data.inventario.valor_inventario.toLocaleString('es-AR')}`],
    ['Alertas de Stock', data.inventario.alertas_stock.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: inventarioData,
    theme: 'grid',
    headStyles: { fillColor: [175, 147, 111] },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estado del Personal', margin, yPosition);
  yPosition += 10;

  const personalData = [
    ['Total de Empleados', data.personal.total_empleados.toString()],
    ['Empleados Activos', data.personal.empleados_activos.toString()],
    ['Turnos Hoy', data.personal.turnos_hoy.toString()],
    ['Ausencias Pendientes', data.personal.ausencias_pendientes.toString()],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: personalData,
    theme: 'grid',
    headStyles: { fillColor: [175, 147, 111] },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  if (data.productosStockBajo.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Productos con Stock Bajo', margin, yPosition);
    yPosition += 10;

    const stockBajoData = data.productosStockBajo.map(p => [
      p.codigo,
      p.nombre,
      p.stock_actual.toString(),
      p.stock_minimo.toString(),
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Código', 'Producto', 'Stock Actual', 'Stock Mínimo']],
      body: stockBajoData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
    });
  }

  return doc.output('blob');
};

// ============================================================================
// REPORTES DE GASTOS (PROPIETARIO)
// ============================================================================

export interface ReporteGastosData {
  gastos: Array<{
    categoria: string;
    monto: number;
    cantidad_eventos: number;
    porcentaje: number;
  }>;
  totalGastos: number;
  promedioMensual: number;
  mesAnalisis: string;
  caballos: number;
}

/**
 * Generar reporte PDF de gastos
 */
export const generarPDFGastos = async (
  data: ReporteGastosData,
  config: { titulo: string; subtitulo?: string }
): Promise<Blob> => {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(config.titulo, margin, 25);
  if (config.subtitulo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(config.subtitulo, margin, 35);
  }

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Resumen
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Gastos', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Gastos: $${data.totalGastos.toLocaleString('es-AR')}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Promedio Mensual: $${data.promedioMensual.toLocaleString('es-AR')}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Período: ${data.mesAnalisis}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Caballos registrados: ${data.caballos}`, margin, yPosition);
  yPosition += 15;

  // Tabla de gastos
  doc.setFont('helvetica', 'bold');
  doc.text('Distribución de Gastos por Categoría', margin, yPosition);
  yPosition += 5;

  const gastosData = data.gastos.map(g => [
    g.categoria,
    `$${g.monto.toLocaleString('es-AR')}`,
    g.cantidad_eventos.toString(),
    `${g.porcentaje}%`,
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Categoría', 'Monto Total', 'Cant. Eventos', '% del Total']],
    body: gastosData,
    theme: 'grid',
    headStyles: { fillColor: [175, 147, 111], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  doc.setFontSize(10);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-AR')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};

/**
 * Generar reporte Excel de gastos
 */
export const generarExcelGastos = async (
  data: ReporteGastosData
  /* config: { titulo: string; subtitulo?: string } */
): Promise<Blob> => {
  const XLSX = await import('xlsx');

  // Hoja de Resumen
  const resumenData = [
    ['REPORTE DE GASTOS'],
    [''],
    ['Total de Gastos:', `$${data.totalGastos.toLocaleString('es-AR')}`],
    ['Promedio Mensual:', `$${data.promedioMensual.toLocaleString('es-AR')}`],
    ['Período:', data.mesAnalisis],
    ['Caballos:', data.caballos],
    [''],
    ['DISTRIBUCIÓN POR CATEGORÍA'],
    ['Categoría', 'Monto Total', 'Cantidad Eventos', '% del Total'],
    ...data.gastos.map(g => [
      g.categoria,
      g.monto,
      g.cantidad_eventos,
      g.porcentaje / 100,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(resumenData);
  
  // Formato de columnas
  ws['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
  ];

  // Crear workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gastos');

  // Generar archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

// ============================================================================
// REPORTES DE EVENTOS (PROPIETARIO)
// ============================================================================

export interface ReporteEventosData {
  eventos: Array<{
    titulo: string;
    fecha_evento: string;
    tipo: string;
    estado: string;
    caballo_nombre: string;
    ubicacion?: string;
  }>;
  estadisticas: {
    total: number;
    pendientes: number;
    completados: number;
    cancelados: number;
  };
  periodo: string;
}

/**
 * Generar reporte PDF de eventos
 */
export const generarPDFEventos = async (
  data: ReporteEventosData,
  config: { titulo: string; subtitulo?: string }
): Promise<Blob> => {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(config.titulo, margin, 25);
  if (config.subtitulo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(config.subtitulo, margin, 35);
  }

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Estadísticas
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Eventos', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de eventos: ${data.estadisticas.total}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Pendientes: ${data.estadisticas.pendientes}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Completados: ${data.estadisticas.completados}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Cancelados: ${data.estadisticas.cancelados}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Período: ${data.periodo}`, margin, yPosition);
  yPosition += 15;

  // Tabla de eventos
  doc.setFont('helvetica', 'bold');
  doc.text('Listado de Eventos', margin, yPosition);
  yPosition += 5;

  const eventosData = data.eventos.map(e => [
    new Date(e.fecha_evento).toLocaleDateString('es-AR'),
    e.titulo,
    e.tipo,
    e.caballo_nombre,
    e.estado,
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Fecha', 'Evento', 'Tipo', 'Caballo', 'Estado']],
    body: eventosData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  doc.setFontSize(10);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-AR')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};

/**
 * Generar reporte Excel de eventos
 */
export const generarExcelEventos = async (
  data: ReporteEventosData
  /* config: { titulo: string; subtitulo?: string } */
): Promise<Blob> => {
  const XLSX = await import('xlsx');

  // Hoja de Resumen
  const resumenData = [
    ['REPORTE DE EVENTOS'],
    [''],
    ['Total de eventos:', data.estadisticas.total],
    ['Pendientes:', data.estadisticas.pendientes],
    ['Completados:', data.estadisticas.completados],
    ['Cancelados:', data.estadisticas.cancelados],
    ['Período:', data.periodo],
    [''],
    ['LISTADO DE EVENTOS'],
    ['Fecha', 'Evento', 'Tipo', 'Caballo', 'Estado', 'Ubicación'],
    ...data.eventos.map(e => [
      new Date(e.fecha_evento).toLocaleDateString('es-AR'),
      e.titulo,
      e.tipo,
      e.caballo_nombre,
      e.estado,
      e.ubicacion || '',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(resumenData);
  
  // Formato de columnas
  ws['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 20 },
  ];

  // Crear workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Eventos');

  // Generar archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

/**
 * Objeto de servicio con métodos para generar reportes
 * @deprecated Usar importaciones nombradas directamente
 */
export const reportService = {
  // Métodos de caballos
  generateCaballosPDF: async () => false,
  generateCaballosExcel: async () => false,
  
  // Métodos de eventos
  generateEventosPDF: async () => false,
  generateEventosExcel: async () => false,
  
  // Métodos de tareas
  generateTareasPDF: async () => false,
  generateTareasExcel: async () => false,
  
  // Métodos de estadísticas
  generateEstadisticasPDF: async () => false,
  generateEstadisticasExcel: async () => false,
};
