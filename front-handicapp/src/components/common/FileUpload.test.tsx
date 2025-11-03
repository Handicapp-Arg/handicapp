import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from './FileUpload';
import ApiClient from '@/lib/services/apiClient';

// Mock de ApiClient
vi.mock('@/lib/services/apiClient', () => ({
  default: {
    makeRequest: vi.fn(),
  },
}));

// Mock de next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('FileUpload', () => {
  const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  const mockPdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
  const mockLargeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
    type: 'image/jpeg',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (ApiClient.makeRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { url: 'https://example.com/uploaded-file.jpg' },
    });
  });

  describe('Rendering', () => {
    it('debe renderizar el componente correctamente', () => {
      render(<FileUpload />);
      expect(screen.getByText(/Arrastra y suelta archivos aquí/i)).toBeInTheDocument();
      expect(screen.getByText(/Seleccionar archivo/i)).toBeInTheDocument();
    });

    it('debe mostrar el botón personalizado cuando se proporciona buttonText', () => {
      render(<FileUpload buttonText="Subir Imagen" />);
      expect(screen.getByText('Subir Imagen')).toBeInTheDocument();
    });

    it('debe mostrar el límite de tamaño correcto', () => {
      render(<FileUpload maxSize={10} />);
      expect(screen.getByText(/Máximo 10MB/i)).toBeInTheDocument();
    });

    it('debe mostrar tipos permitidos para imágenes', () => {
      render(<FileUpload accept="image" />);
      expect(screen.getByText(/JPG, PNG, GIF, WEBP/i)).toBeInTheDocument();
    });

    it('debe mostrar tipos permitidos para documentos', () => {
      render(<FileUpload accept="document" />);
      expect(screen.getByText(/PDF, DOC, DOCX, XLS, XLSX, TXT/i)).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('debe subir un archivo de imagen correctamente', async () => {
      const onUploadComplete = vi.fn();
      render(<FileUpload accept="image" onUploadComplete={onUploadComplete} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockFile);

      await waitFor(() => {
        expect(ApiClient.makeRequest).toHaveBeenCalledWith(
          '/uploads/image',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalledWith([
          'https://example.com/uploaded-file.jpg',
        ]);
      });
    });

    it('debe subir múltiples archivos cuando multiple=true', async () => {
      const onUploadComplete = vi.fn();
      (ApiClient.makeRequest as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ data: { url: 'https://example.com/file1.jpg' } })
        .mockResolvedValueOnce({ data: { url: 'https://example.com/file2.jpg' } });

      render(<FileUpload multiple onUploadComplete={onUploadComplete} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });

      await userEvent.upload(input, [file1, file2]);

      await waitFor(() => {
        expect(ApiClient.makeRequest).toHaveBeenCalledTimes(2);
        expect(onUploadComplete).toHaveBeenCalledWith([
          'https://example.com/file1.jpg',
          'https://example.com/file2.jpg',
        ]);
      });
    });

    it('debe subir documentos al endpoint correcto', async () => {
      render(<FileUpload accept="document" />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockPdfFile);

      await waitFor(() => {
        expect(ApiClient.makeRequest).toHaveBeenCalledWith(
          '/uploads/document',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });

  describe('Validaciones', () => {
    it('debe rechazar archivos que superen el tamaño máximo', async () => {
      const onError = vi.fn();
      render(<FileUpload maxSize={5} onError={onError} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockLargeFile);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('supera el límite'));
        expect(ApiClient.makeRequest).not.toHaveBeenCalled();
      });
    });

    it('debe rechazar archivos de tipo incorrecto para imágenes', async () => {
      const onError = vi.fn();
      render(<FileUpload accept="image" onError={onError} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockPdfFile);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Solo se permiten archivos de imagen');
        expect(ApiClient.makeRequest).not.toHaveBeenCalled();
      });
    });

    it('debe rechazar documentos con extensiones inválidas', async () => {
      const onError = vi.fn();
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });

      render(<FileUpload accept="document" onError={onError} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, invalidFile);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Formato de documento no válido');
        expect(ApiClient.makeRequest).not.toHaveBeenCalled();
      });
    });
  });

  describe('Preview', () => {
    it('debe mostrar preview de archivos subidos cuando showPreview=true', async () => {
      render(<FileUpload showPreview onUploadComplete={vi.fn()} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockFile);

      await waitFor(() => {
        expect(screen.getByAltText('test.jpg')).toBeInTheDocument();
      });
    });

    it('debe permitir eliminar archivos del preview', async () => {
      const onUploadComplete = vi.fn();
      render(<FileUpload showPreview onUploadComplete={onUploadComplete} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockFile);

      await waitFor(() => {
        expect(screen.getByAltText('test.jpg')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Eliminar');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByAltText('test.jpg')).not.toBeInTheDocument();
        expect(onUploadComplete).toHaveBeenCalledWith([]);
      });
    });

    it('debe mostrar URLs iniciales en el preview', () => {
      const initialUrls = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
      render(<FileUpload initialUrls={initialUrls} showPreview />);

      expect(screen.getByAltText('image1.jpg')).toBeInTheDocument();
      expect(screen.getByAltText('image2.jpg')).toBeInTheDocument();
    });
  });

  describe('Estados de Loading', () => {
    it('debe mostrar estado de loading durante la subida', async () => {
      (ApiClient.makeRequest as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: { url: 'test.jpg' } }), 100))
      );

      render(<FileUpload />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockFile);

      expect(screen.getByText('Subiendo archivo(s)...')).toBeInTheDocument();
      expect(screen.getByText('Subiendo...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Subiendo archivo(s)...')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Error Handling', () => {
    it('debe manejar errores de upload', async () => {
      const onError = vi.fn();
      (ApiClient.makeRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Error de red')
      );

      render(<FileUpload onError={onError} />);

      const input = screen.getByRole('button', { name: /Seleccionar archivo/i })
        .closest('div')
        ?.querySelector('input[type="file"]') as HTMLInputElement;

      await userEvent.upload(input, mockFile);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('Error'));
      });
    });
  });
});
