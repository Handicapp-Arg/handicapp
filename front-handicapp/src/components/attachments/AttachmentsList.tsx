'use client';
import React, { useState, useEffect } from 'react';
import { AdjuntoService, type Adjunto } from '@/lib/services/attachmentService';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  FolderIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { showError, showSuccess, showInfo } from '@/lib/utils/errorHandler';

interface AdjuntosListProps {
  caballoId?: number;
  eventoId?: number;
  showActions?: boolean;
}
/* comentario */
export default function AdjuntosList({ caballoId, eventoId, showActions = false }: AdjuntosListProps) {
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    cargarAdjuntos();
  }, [caballoId, eventoId]);

  const cargarAdjuntos = async () => {
    setLoading(true);
    try {
      let data: Adjunto[] = [];
      if (caballoId) {
        data = await AdjuntoService.getAdjuntosByCaballo(caballoId);
      } else if (eventoId) {
        data = await AdjuntoService.getAdjuntosByEvento(eventoId);
      }
      setAdjuntos(data);
    } catch (error: any) {
      showError(error, 'file', 'fetch_list');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = (adjuntoId: number, nombre: string) => {
    const url = AdjuntoService.getDownloadUrl(adjuntoId);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    showInfo('Descargando documento...');
  };

  const handleEliminar = async (adjuntoId: number) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      await AdjuntoService.deleteAdjunto(adjuntoId);
      showSuccess('file', 'deleted');
      cargarAdjuntos();
    } catch (error: any) {
      showError(error, 'file', 'delete_failed');
    }
  };

  const getIcono = (tipoMime: string) => {
    if (tipoMime.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8" />;
    }
    if (tipoMime.includes('pdf')) {
      return <DocumentTextIcon className="w-8 h-8" />;
    }
    if (tipoMime.includes('video')) {
      return <VideoCameraIcon className="w-8 h-8" />;
    }
    return <DocumentIcon className="w-8 h-8" />;
  };

  const adjuntosFiltrados = filtroCategoria === 'todos'
    ? adjuntos
    : adjuntos.filter((adj) => adj.categoria === filtroCategoria);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 mx-auto relative">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-gray-800 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-white rounded-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-md">
                <FolderIcon className="w-6 h-6 text-gray-700" />
              </div>
              Documentos Adjuntos
              <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-semibold">
                {adjuntosFiltrados.length}
              </span>
            </h3>
          </div>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2">
            {['todos', 'propietario', 'operativo', 'salud', 'otro'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filtroCategoria === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow'
                }`}
              >
                {cat === 'todos' ? 'Todos' : AdjuntoService.getCategoryName(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de adjuntos */}
      {adjuntosFiltrados.length === 0 ? (
        <div className="bg-white rounded-md border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <FolderIcon className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No hay documentos
            </h3>
            <p className="text-gray-600">
              {filtroCategoria === 'todos'
                ? 'Aún no se han subido documentos'
                : `No hay documentos en la categoría "${AdjuntoService.getCategoryName(filtroCategoria)}"`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adjuntosFiltrados.map((adjunto) => (
            <div
              key={adjunto.id}
              className="group relative bg-white rounded-md border border-gray-200 hover:bg-gray-50 overflow-hidden"
            >
              {/* Preview de imagen o icono */}
              <div className="relative h-48 bg-gray-50 flex items-center justify-center">
                {adjunto.tipo_mime.startsWith('image/') ? (
                  <div className="relative w-full h-full">
                    <img
                      src={AdjuntoService.getDownloadUrl(adjunto.id)}
                      alt={adjunto.nombre_archivo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                      {getIcono(adjunto.tipo_mime)}
                    </div>
                    {/* Botón de preview */}
                    <button
                      onClick={() => setPreviewImage(AdjuntoService.getDownloadUrl(adjunto.id))}
                      className="absolute top-2 right-2 p-2 bg-white rounded-md border border-gray-200 opacity-0 group-hover:opacity-100"
                    >
                      <EyeIcon className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <div className="text-amber-700">
                    {getIcono(adjunto.tipo_mime)}
                  </div>
                )}

                {/* Badge de categoría */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${AdjuntoService.getCategoryColor(adjunto.categoria)}`}>
                    {AdjuntoService.getCategoryName(adjunto.categoria)}
                  </span>
                </div>
              </div>

              {/* Información del archivo */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900  truncate" title={adjunto.nombre_archivo}>
                    {adjunto.nombre_archivo}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {AdjuntoService.formatFileSize(adjunto.tamanio_bytes)}
                  </p>
                </div>

                {adjunto.subido_por && (
                  <p className="text-xs text-gray-500">
                    Subido por: {adjunto.subido_por.nombre} {adjunto.subido_por.apellido}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(adjunto.creado_el).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleDescargar(adjunto.id, adjunto.nombre_archivo)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md text-sm font-medium"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Descargar
                  </button>

                  {showActions && (
                    <button
                      onClick={() => handleEliminar(adjunto.id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-md"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de preview de imagen */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-screen object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
