/**
 * Servicio de Reportes
 * Genera reportes en PDF y Excel para el sistema
 * NOTA: Las funciones cargan jsPDF y XLSX dinámicamente para mantener el bundle pequeño
 */

import { type Caballo } from './caballoService';
import { type Evento } from './eventoService';

// Helper para cargar jsPDF dinámicamente
async function loadJSPDF() {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  return { jsPDF, autoTable };
}

// Helper para cargar XLSX dinámicamente
async function loadXLSX() {
  return await import('xlsx');
}

// Configuración de colores de marca
const BRAND_COLORS = {
  primary: '#0f172a',
  gold: '#af936f',
  gray: '#6b7280',
  white: '#ffffff',
};

/**
 * Opciones para generación de reportes
 */
export interface ReporteOptions {
  titulo?: string;
  subtitulo?: string;
  autor?: string;
  fecha?: Date;
  incluirLogo?: boolean;
  orientacion?: 'portrait' | 'landscape';
}

/**
 * Genera un reporte PDF de caballos
 */
export async function generarReporteCaballosPDF(
  caballos: Caballo[],
  options: ReporteOptions = {}
): Promise<void> {
  const {
    titulo = 'Reporte de Caballos',
    subtitulo = 'Lista completa de caballos',
    autor = 'HandicApp',
    fecha = new Date(),
    orientacion = 'portrait',
  } = options;

  // Lazy load jsPDF
  const { jsPDF, autoTable } = await loadJSPDF();

  // Crear documento PDF
  const doc = new jsPDF({
    orientation: orientacion,
    unit: 'mm',
    format: 'a4',
  });

  // Header con branding
  doc.setFillColor(BRAND_COLORS.primary);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

  // Título
  doc.setTextColor(BRAND_COLORS.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 15, 20);

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitulo, 15, 30);

  // Info del reporte
  doc.setFontSize(9);
  doc.text(`Generado: ${fecha.toLocaleDateString('es-AR')}`, 15, 36);
  doc.text(`Por: ${autor}`, doc.internal.pageSize.getWidth() - 60, 36);

  // Reset color
  doc.setTextColor(0, 0, 0);

  // Estadísticas resumidas
  const yStart = 50;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen:', 15, yStart);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total de caballos: ${caballos.length}`, 15, yStart + 7);
  const activos = caballos.filter((c) => c.estado_global === 'activo').length;
  doc.text(`Caballos activos: ${activos}`, 15, yStart + 14);

  // Tabla de caballos
  const tableData = caballos.map((caballo) => [
    caballo.nombre || '-',
    caballo.raza || '-',
    caballo.sexo || '-',
    caballo.fecha_nacimiento
      ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR')
      : '-',
    caballo.estado_global || '-',
  ]);

  autoTable(doc, {
    startY: yStart + 25,
    head: [['Nombre', 'Raza', 'Sexo', 'Fecha Nac.', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: BRAND_COLORS.primary,
      textColor: BRAND_COLORS.white,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: '#f9fafb',
    },
    margin: { left: 15, right: 15 },
  });

  // Footer en todas las páginas
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(BRAND_COLORS.gray);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'HandicApp - Sistema de Gestión Equina',
      15,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Descargar
  doc.save(`reporte-caballos-${fecha.toISOString().split('T')[0]}.pdf`);
}

/**
 * Genera un reporte PDF de historial médico
 */
export async function generarReporteHistorialMedicoPDF(
  caballo: Caballo,
  eventos: Evento[],
  options: ReporteOptions = {}
): Promise<void> {
  const {
    titulo = 'Historial Médico',
    fecha = new Date(),
  } = options;

  // Lazy load jsPDF
  const { jsPDF, autoTable } = await loadJSPDF();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(BRAND_COLORS.primary);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 50, 'F');

  doc.setTextColor(BRAND_COLORS.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 15, 20);

  doc.setFontSize(14);
  doc.text(`${caballo.nombre}`, 15, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Raza: ${caballo.raza || '-'} | Sexo: ${caballo.sexo || '-'}`, 15, 40);
  doc.text(`Generado: ${fecha.toLocaleDateString('es-AR')}`, 15, 46);

  doc.setTextColor(0, 0, 0);

  // Eventos médicos
  const eventosMedicos = eventos.filter(
    (e) =>
      e.tipo_evento?.categoria === 'medico' ||
      e.tipo_evento?.categoria === 'veterinaria'
  );

  let yPos = 60;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Eventos Médicos Registrados: ${eventosMedicos.length}`, 15, yPos);

  yPos += 10;

  if (eventosMedicos.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No hay eventos médicos registrados', 15, yPos);
  } else {
    // Tabla de eventos
    const tableData = eventosMedicos.map((evento) => [
      new Date(evento.fecha_evento).toLocaleDateString('es-AR'),
      evento.tipo_evento?.nombre || evento.titulo || '-',
      evento.descripcion?.substring(0, 50) || '-',
      evento.estado || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Tipo', 'Descripción', 'Estado']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: BRAND_COLORS.primary,
        textColor: BRAND_COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        2: { cellWidth: 60 },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(BRAND_COLORS.gray);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(
    `historial-medico-${caballo.nombre}-${fecha.toISOString().split('T')[0]}.pdf`
  );
}

/**
 * Genera un reporte PDF de eventos
 */
export async function generarReporteEventosPDF(
  eventos: Evento[],
  options: ReporteOptions = {}
): Promise<void> {
  const {
    titulo = 'Reporte de Eventos',
    subtitulo = 'Calendario de eventos',
    fecha = new Date(),
    orientacion = 'landscape',
  } = options;

  // Lazy load jsPDF
  const { jsPDF, autoTable } = await loadJSPDF();

  const doc = new jsPDF({
    orientation: orientacion,
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(BRAND_COLORS.primary);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F');

  doc.setTextColor(BRAND_COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 15, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitulo, 15, 26);
  doc.text(`Generado: ${fecha.toLocaleDateString('es-AR')}`, 15, 31);

  doc.setTextColor(0, 0, 0);

  // Estadísticas
  const yStart = 45;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de eventos: ${eventos.length}`, 15, yStart);

  // Tabla de eventos
  const tableData = eventos.map((evento) => [
    new Date(evento.fecha_evento).toLocaleDateString('es-AR'),
    evento.titulo || evento.tipo_evento?.nombre || '-',
    evento.tipo_evento?.categoria || '-',
    evento.caballo?.nombre || '-',
    evento.ubicacion || '-',
    evento.estado || '-',
  ]);

  autoTable(doc, {
    startY: yStart + 8,
    head: [['Fecha', 'Evento', 'Categoría', 'Caballo', 'Ubicación', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: BRAND_COLORS.primary,
      textColor: BRAND_COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    margin: { left: 15, right: 15 },
  });

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(BRAND_COLORS.gray);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`reporte-eventos-${fecha.toISOString().split('T')[0]}.pdf`);
}

/**
 * Exporta caballos a Excel
 */
export async function exportarCaballosExcel(caballos: Caballo[]): Promise<void> {
  const XLSX = await loadXLSX();
  
  // Preparar datos
  const data = caballos.map((caballo) => ({
    Nombre: caballo.nombre || '',
    Raza: caballo.raza || '',
    Sexo: caballo.sexo || '',
    'Fecha Nacimiento': caballo.fecha_nacimiento
      ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR')
      : '',
    Pelaje: caballo.pelaje || '',
    Estado: caballo.estado_global || '',
    Microchip: caballo.microchip || '',
    'Padre': caballo.padre?.nombre || '',
    'Madre': caballo.madre?.nombre || '',
    'Creado': new Date(caballo.creado_el).toLocaleDateString('es-AR'),
  }));

  // Crear workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar anchos de columna
  const colWidths = [
    { wch: 20 }, // Nombre
    { wch: 15 }, // Raza
    { wch: 10 }, // Sexo
    { wch: 15 }, // Fecha Nac
    { wch: 12 }, // Color
    { wch: 12 }, // Estado
    { wch: 15 }, // Microchip
    { wch: 20 }, // Padre
    { wch: 20 }, // Madre
    { wch: 12 }, // Creado
  ];
  ws['!cols'] = colWidths;

  // Agregar hoja
  XLSX.utils.book_append_sheet(wb, ws, 'Caballos');

  // Descargar
  XLSX.writeFile(wb, `caballos-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Exporta eventos a Excel
 */
export async function exportarEventosExcel(eventos: Evento[]): Promise<void> {
  const XLSX = await loadXLSX();
  
  const data = eventos.map((evento) => ({
    Fecha: new Date(evento.fecha_evento).toLocaleDateString('es-AR'),
    Hora: new Date(evento.fecha_evento).toLocaleTimeString('es-AR'),
    Titulo: evento.titulo || evento.tipo_evento?.nombre || '',
    Categoria: evento.tipo_evento?.categoria || '',
    Caballo: evento.caballo?.nombre || '',
    Ubicacion: evento.ubicacion || '',
    Estado: evento.estado || '',
    Prioridad: evento.prioridad || '',
    Descripcion: evento.descripcion || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  const colWidths = [
    { wch: 12 },
    { wch: 10 },
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 40 },
    { wch: 30 },
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
  XLSX.writeFile(wb, `eventos-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Exporta múltiples datos a Excel (múltiples hojas)
 */
export async function exportarDatosCompletosExcel(data: {
  caballos?: Caballo[];
  eventos?: Evento[];
}): Promise<void> {
  const XLSX = await loadXLSX();
  
  const wb = XLSX.utils.book_new();

  // Hoja de caballos
  if (data.caballos && data.caballos.length > 0) {
    const caballosData = data.caballos.map((caballo) => ({
      Nombre: caballo.nombre || '',
      Raza: caballo.raza || '',
      Sexo: caballo.sexo || '',
      'Fecha Nacimiento': caballo.fecha_nacimiento
        ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR')
        : '',
      Pelaje: caballo.pelaje || '',
      Estado: caballo.estado_global || '',
    }));

    const wsCaballos = XLSX.utils.json_to_sheet(caballosData);
    XLSX.utils.book_append_sheet(wb, wsCaballos, 'Caballos');
  }

  // Hoja de eventos
  if (data.eventos && data.eventos.length > 0) {
    const eventosData = data.eventos.map((evento) => ({
      Fecha: new Date(evento.fecha_evento).toLocaleDateString('es-AR'),
      Titulo: evento.titulo || evento.tipo_evento?.nombre || '',
      Categoria: evento.tipo_evento?.categoria || '',
      Caballo: evento.caballo?.nombre || '',
      Estado: evento.estado || '',
    }));

    const wsEventos = XLSX.utils.json_to_sheet(eventosData);
    XLSX.utils.book_append_sheet(wb, wsEventos, 'Eventos');
  }

  XLSX.writeFile(
    wb,
    `reporte-completo-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

/**
 * Exporta inventario a Excel
 */
export async function exportarInventarioExcel(productos: any[]): Promise<void> {
  const XLSX = await loadXLSX();
  
  const data = productos.map((producto) => ({
    Código: producto.codigo || '',
    Nombre: producto.nombre || '',
    Categoría: producto.categoria_nombre || '',
    'Stock Actual': producto.stock_actual || 0,
    'Stock Mínimo': producto.stock_minimo || 0,
    'Stock Máximo': producto.stock_maximo || 0,
    'Unidad': producto.unidad_medida || '',
    'Precio Unit.': producto.precio_unitario || 0,
    Ubicación: producto.ubicacion || '',
    Proveedor: producto.proveedor_nombre || '',
    Estado: producto.estado || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  // Auto-ajustar ancho de columnas
  const colWidths = [
    { wch: 12 }, // Código
    { wch: 30 }, // Nombre
    { wch: 20 }, // Categoría
    { wch: 12 }, // Stock Actual
    { wch: 12 }, // Stock Mínimo
    { wch: 12 }, // Stock Máximo
    { wch: 10 }, // Unidad
    { wch: 12 }, // Precio
    { wch: 20 }, // Ubicación
    { wch: 25 }, // Proveedor
    { wch: 12 }, // Estado
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(
    wb,
    `inventario-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

/**
 * Genera reporte de inventario en PDF
 */
export async function generarReporteInventarioPDF(
  productos: any[],
  options: ReporteOptions = {}
): Promise<void> {
  const { jsPDF, autoTable } = await loadJSPDF();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(options.titulo || 'Reporte de Inventario', pageWidth / 2, yPos, {
    align: 'center',
  });

  yPos += 10;

  // Subtítulo
  if (options.subtitulo) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(options.subtitulo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-AR')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  yPos += 15;

  // Resumen
  const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
  const stockNormal = productos.filter(p => p.stock_actual > p.stock_minimo && p.stock_actual < p.stock_maximo).length;
  const stockAlto = productos.filter(p => p.stock_actual >= p.stock_maximo).length;

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total de Productos: ${productos.length}`, 20, yPos);
  yPos += 7;
  doc.setTextColor(239, 68, 68); // red-500
  doc.text(`Stock Bajo: ${stockBajo}`, 20, yPos);
  yPos += 7;
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(`Stock Normal: ${stockNormal}`, 20, yPos);
  yPos += 7;
  doc.setTextColor(34, 197, 94); // green-500
  doc.text(`Stock Alto: ${stockAlto}`, 20, yPos);

  yPos += 10;

  // Tabla
  const tableData = productos.map((producto) => [
    producto.codigo || '',
    producto.nombre || '',
    producto.categoria_nombre || '',
    producto.stock_actual?.toString() || '0',
    producto.stock_minimo?.toString() || '0',
    producto.unidad_medida || '',
    producto.estado || '',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Nombre', 'Categoría', 'Stock', 'Mín', 'Unidad', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
    },
  });

  doc.save(`inventario-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Genera reporte consolidado en PDF
 */
export async function generarReporteConsolidadoPDF(
  data: {
    caballos: any[];
    productos: any[];
    stats: any;
  },
  options: ReporteOptions = {}
): Promise<void> {
  const { jsPDF, autoTable } = await loadJSPDF();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22); // orange-500
  doc.text(options.titulo || 'Reporte Consolidado', pageWidth / 2, yPos, {
    align: 'center',
  });

  yPos += 10;

  // Subtítulo
  if (options.subtitulo) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(options.subtitulo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-AR')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  yPos += 15;

  // === RESUMEN GENERAL ===
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('📊 Resumen General', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  doc.text(`Total Caballos: ${data.stats.caballos?.total || 0}`, 20, yPos);
  doc.text(`Total Productos: ${data.productos.length}`, 110, yPos);
  yPos += 6;
  
  doc.text(`Caballos Activos: ${data.stats.caballos?.activos || 0}`, 20, yPos);
  doc.text(`Stock Bajo: ${data.productos.filter((p: any) => p.stock_actual <= p.stock_minimo).length}`, 110, yPos);
  yPos += 6;
  
  doc.text(`Eventos Totales: ${data.stats.eventos?.total || 0}`, 20, yPos);
  doc.text(`Tareas Totales: ${data.stats.tareas?.total || 0}`, 110, yPos);
  yPos += 10;

  // === SECCIÓN CABALLOS ===
  if (data.caballos.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('🐎 Caballos', 20, yPos);
    yPos += 5;

    const caballosData = data.caballos.slice(0, 10).map((caballo: any) => [
      caballo.nombre || '',
      caballo.raza || '',
      caballo.sexo || '',
      caballo.estado_global || '',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Nombre', 'Raza', 'Sexo', 'Estado']],
      body: caballosData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // === SECCIÓN INVENTARIO ===
  if (data.productos.length > 0) {
    // Nueva página si no hay espacio
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(168, 85, 247);
    doc.text('📦 Inventario', 20, yPos);
    yPos += 5;

    const inventarioData = data.productos.slice(0, 10).map((producto: any) => [
      producto.nombre || '',
      producto.categoria_nombre || '',
      producto.stock_actual?.toString() || '0',
      producto.unidad_medida || '',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Producto', 'Categoría', 'Stock', 'Unidad']],
      body: inventarioData,
      theme: 'grid',
      headStyles: {
        fillColor: [168, 85, 247],
        textColor: 255,
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`reporte-consolidado-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Exporta datos de personal a Excel
 */
export async function exportarPersonalExcel(usuarios: any[]): Promise<void> {
  const XLSX = await loadXLSX();
  
  const data = usuarios.map((usuario) => ({
    Nombre: usuario.nombre || '',
    Apellido: usuario.apellido || '',
    Email: usuario.email || '',
    Rol: usuario.rol?.nombre || '',
    Estado: usuario.activo ? 'Activo' : 'Inactivo',
    'Fecha Alta': usuario.creado_el ? new Date(usuario.creado_el).toLocaleDateString('es-AR') : '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Personal');

  // Auto-ajustar ancho de columnas
  const colWidths = [
    { wch: 20 }, // Nombre
    { wch: 20 }, // Apellido
    { wch: 30 }, // Email
    { wch: 15 }, // Rol
    { wch: 10 }, // Estado
    { wch: 12 }, // Fecha
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(
    wb,
    `personal-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

/**
 * Genera reporte de personal en PDF
 */
export async function generarReportePersonalPDF(
  usuarios: any[],
  options: ReporteOptions = {}
): Promise<void> {
  const { jsPDF, autoTable } = await loadJSPDF();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(options.titulo || 'Reporte de Personal', pageWidth / 2, yPos, {
    align: 'center',
  });

  yPos += 10;

  // Subtítulo
  if (options.subtitulo) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(options.subtitulo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-AR')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  yPos += 15;

  // Resumen
  const activos = usuarios.filter(u => u.activo).length;
  const inactivos = usuarios.length - activos;

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total de Empleados: ${usuarios.length}`, 20, yPos);
  yPos += 7;
  doc.setTextColor(34, 197, 94); // green-500
  doc.text(`Activos: ${activos}`, 20, yPos);
  yPos += 7;
  doc.setTextColor(239, 68, 68); // red-500
  doc.text(`Inactivos: ${inactivos}`, 20, yPos);

  yPos += 10;

  // Tabla
  const tableData = usuarios.map((usuario) => [
    `${usuario.nombre || ''} ${usuario.apellido || ''}`,
    usuario.email || '',
    usuario.rol?.nombre || '',
    usuario.activo ? 'Activo' : 'Inactivo',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Nombre', 'Email', 'Rol', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
    },
  });

  doc.save(`personal-${new Date().toISOString().split('T')[0]}.pdf`);
}
