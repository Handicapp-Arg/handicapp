'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  DocumentIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ApiClient from '@/lib/services/apiClient';

export interface FileUploadProps {
  /**
   * Tipo de archivo permitido
   */
  accept?: 'image' | 'document' | 'any';
  
  /**
   * Tamaño máximo en MB
   */
  maxSize?: number;
  
  /**
   * Permitir múltiples archivos
   */
  multiple?: boolean;
  
  /**
   * Callback cuando se suben archivos exitosamente
   */
  onUploadComplete?: (urls: string[]) => void;
  
  /**
   * Callback cuando hay un error
   */
  onError?: (error: string) => void;
  
  /**
   * Texto del botón
   */
  buttonText?: string;
  
  /**
   * Mostrar preview de imágenes
   */
  showPreview?: boolean;
  
  /**
   * URLs iniciales (para modo edición)
   */
  initialUrls?: string[];
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export default function FileUpload({
  accept = 'any',
  maxSize = 5,
  multiple = false,
  onUploadComplete,
  onError,
  buttonText,
  showPreview = true,
  initialUrls = [],
  className = '',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    initialUrls.map(url => ({
      url,
      name: url.split('/').pop() || 'archivo',
      size: 0,
      type: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document',
    }))
  );
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determinar accept string para input
  const getAcceptString = () => {
    switch (accept) {
      case 'image':
        return 'image/jpeg,image/png,image/gif,image/webp';
      case 'document':
        return '.pdf,.doc,.docx,.xls,.xlsx,.txt';
      default:
        return '*/*';
    }
  };

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo supera el límite de ${maxSize}MB`;
    }

    // Validar tipo
    if (accept === 'image' && !file.type.startsWith('image/')) {
      return 'Solo se permiten archivos de imagen';
    }

    if (accept === 'document') {
      const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        return 'Formato de documento no válido';
      }
    }

    return null;
  }, [accept, maxSize]);

  // Subir archivo
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = accept === 'image' ? '/uploads/image' : '/uploads/document';

    const response: { data?: { url?: string }; url?: string } = await ApiClient.makeRequest(endpoint, {
      method: 'POST',
      body: formData as unknown as BodyInit,
    });

    return response?.data?.url || response?.url || '';
  }, [accept]);

  // Manejar selección de archivos
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validar archivos
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        return;
      }
    }

    // Subir archivos
    try {
      setUploading(true);
      const uploadPromises = fileArray.map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);

      // Agregar a lista de archivos subidos
      const newFiles: UploadedFile[] = fileArray.map((file, index) => ({
        url: urls[index],
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      setUploadedFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
      onUploadComplete?.(urls);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo(s)';
      console.error('Error uploading files:', error);
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [multiple, onError, onUploadComplete, uploadFile, validateFile]);

  // Manejar drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remover archivo
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Notificar URLs actualizadas
    const remainingUrls = uploadedFiles.filter((_, i) => i !== index).map(f => f.url);
    onUploadComplete?.(remainingUrls);
  };

  // Renderizar preview
  const renderPreview = (file: UploadedFile, index: number) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.url);

    return (
      <div
        key={index}
        className="relative group rounded-md border border-gray-200 overflow-hidden bg-white hover:border-gray-400"
      >
        {isImage ? (
          <div className="relative w-full h-32">
            <Image
              src={file.url}
              alt={file.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ) : (
          <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-50">
            <DocumentIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-xs text-gray-600 truncate max-w-full px-2">{file.name}</p>
          </div>
        )}
        
        {/* Remove button */}
        <button
          onClick={() => removeFile(index)}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-600"
          title="Eliminar"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        {/* Success indicator */}
        <div className="absolute bottom-2 left-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md p-8 text-center ${
          dragActive
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={getAcceptString()}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-4">
          {accept === 'image' ? (
            <PhotoIcon className="h-16 w-16 text-gray-400" />
          ) : (
            <DocumentIcon className="h-16 w-16 text-gray-400" />
          )}

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {uploading ? 'Subiendo archivo(s)...' : 'Arrastra y suelta archivos aquí'}
            </p>
            <p className="text-sm text-gray-500">
              o haz click para seleccionar
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            {buttonText || (uploading ? 'Subiendo...' : 'Seleccionar archivo')}
          </button>

          <p className="text-xs text-gray-400 mt-2">
            {accept === 'image' && 'JPG, PNG, GIF, WEBP'}
            {accept === 'document' && 'PDF, DOC, DOCX, XLS, XLSX, TXT'}
            {accept === 'any' && 'Todos los formatos'}
            {' • '}
            Máximo {maxSize}MB
          </p>
        </div>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-gray-900 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file, index) => renderPreview(file, index))}
        </div>
      )}
    </div>
  );
}
