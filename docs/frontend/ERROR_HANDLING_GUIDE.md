# Guía de Manejo de Errores - HandicApp Frontend

## 📋 Índice

1. [Introducción](#introducción)
2. [Sistema de ErrorHandler](#sistema-de-errorhandler)
3. [Uso en Servicios](#uso-en-servicios)
4. [Uso en Componentes](#uso-en-componentes)
5. [Mensajes Personalizados](#mensajes-personalizados)
6. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Introducción

El sistema centralizado de manejo de errores proporciona:

- ✅ **Mensajes descriptivos** automáticos basados en contexto
- ✅ **Notificaciones visuales** consistentes en toda la app
- ✅ **Logging estructurado** para debugging
- ✅ **Traducción automática** de errores HTTP a mensajes comprensibles
- ✅ **Validación de formularios** con feedback claro

---

## Sistema de ErrorHandler

### Importación

```typescript
import {
  showError,
  showSuccess,
  showWarning,
  showInfo,
  parseError,
  getErrorMessage,
  withErrorHandling
} from '@/lib/utils/errorHandler';
```

### Funciones Principales

#### `showError(error, context?, action?)`

Muestra un mensaje de error descriptivo.

```typescript
// Básico
showError(error);

// Con contexto
showError(error, 'user', 'create_failed');

// El sistema automáticamente:
// 1. Extrae el mensaje del servidor
// 2. Busca mensaje contextual apropiado
// 3. Agrega detalles (campo, código de error)
// 4. Muestra toast con formato consistente
```

#### `showSuccess(context, action, customMessage?)`

Muestra un mensaje de éxito.

```typescript
// Mensaje predefinido
showSuccess('user', 'created');
// → "Usuario creado exitosamente"

// Mensaje personalizado
showSuccess('user', 'created', 'El usuario Juan Pérez fue creado correctamente');
```

#### `showWarning(message)` y `showInfo(message)`

Para mensajes informativos.

```typescript
showWarning('El stock está por debajo del mínimo');
showInfo('Los datos se guardaron automáticamente');
```

---

## Uso en Servicios

### Patrón Recomendado

```typescript
// ❌ ANTES - Sin manejo estructurado
async create(data: CreateDTO): Promise<Entity> {
  const response = await apiClient.post(this.baseUrl, data);
  return response.data;
}

// ✅ DESPUÉS - Con manejo de errores
async create(data: CreateDTO): Promise<Entity> {
  try {
    const response = await apiClient.post(this.baseUrl, data);
    showSuccess('entity', 'created');
    return response.data;
  } catch (error) {
    showError(error, 'entity', 'create_failed');
    throw error; // Re-lanzar para que el componente pueda manejarlo
  }
}
```

### Operaciones CRUD Completas

```typescript
class EntityService {
  async getAll(filters = {}): Promise<Entity[]> {
    try {
      const response = await apiClient.get(this.baseUrl, { params: filters });
      return response.data;
    } catch (error) {
      showError(error, 'entity', 'fetch_list');
      throw error;
    }
  }

  async getById(id: number): Promise<Entity> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      showError(error, 'entity', 'not_found');
      throw error;
    }
  }

  async create(data: CreateEntityDTO): Promise<Entity> {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      showSuccess('entity', 'created');
      return response.data;
    } catch (error) {
      showError(error, 'entity', 'create_failed');
      throw error;
    }
  }

  async update(id: number, data: UpdateEntityDTO): Promise<Entity> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      showSuccess('entity', 'updated');
      return response.data;
    } catch (error) {
      showError(error, 'entity', 'update_failed');
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
      showSuccess('entity', 'deleted');
    } catch (error) {
      showError(error, 'entity', 'delete_failed');
      throw error;
    }
  }
}
```

---

## Uso en Componentes

### Formularios de Creación

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validación básica
  if (!formData.nombre) {
    showWarning('El nombre es requerido');
    return;
  }

  try {
    setLoading(true);
    await entityService.create(formData);
    // ✅ showSuccess ya se llamó en el servicio
    onSuccess?.();
    onClose?.();
  } catch (error) {
    // ✅ showError ya se llamó en el servicio
    // Solo manejar lógica adicional si es necesario
  } finally {
    setLoading(false);
  }
};
```

### Carga de Datos

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await entityService.getAll();
      setEntities(data);
    } catch (error) {
      // ✅ showError ya se llamó en el servicio
      // Opcionalmente mostrar un estado de error en la UI
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Validación de Formularios

```typescript
const validateForm = (): boolean => {
  const errors: string[] = [];

  if (!formData.nombre) errors.push('El nombre es requerido');
  if (!formData.email) errors.push('El email es requerido');
  if (formData.edad && formData.edad < 0) errors.push('La edad debe ser positiva');

  if (errors.length > 0) {
    showError(errors.join('. '), 'validation', 'form_invalid');
    return false;
  }

  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  // ... continuar con el submit
};
```

---

## Mensajes Personalizados

### Contextos Disponibles

Los contextos predefinidos en `errorHandler.ts`:

```typescript
// auth - Autenticación
showError(error, 'auth', 'login_failed');
showError(error, 'auth', 'session_expired');

// user - Usuarios/Empleados
showError(error, 'user', 'create_failed');
showSuccess('user', 'updated');

// establecimiento - Establecimientos
showError(error, 'establecimiento', 'not_found');
showSuccess('establecimiento', 'created');

// caballo - Caballos
showError(error, 'caballo', 'update_failed');
showSuccess('caballo', 'deleted');

// evento - Eventos
showError(error, 'evento', 'invalid_date');
showSuccess('evento', 'created');

// tarea - Tareas
showError(error, 'tarea', 'assign_failed');
showSuccess('tarea', 'completed');

// inventario - Inventario
showError(error, 'inventario', 'insufficient_stock');
showSuccess('inventario', 'movement_created');

// file - Archivos
showError(error, 'file', 'upload_failed');
showSuccess('file', 'deleted');
```

### Agregar Nuevos Contextos

Editar `/lib/utils/errorHandler.ts`:

```typescript
const CONTEXT_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  // ... contextos existentes ...
  
  nuevo_modulo: {
    create_failed: 'No se pudo crear el recurso',
    update_failed: 'No se pudo actualizar el recurso',
    delete_failed: 'No se pudo eliminar el recurso',
    not_found: 'Recurso no encontrado',
    custom_error: 'Mensaje de error personalizado',
  },
};

const SUCCESS_MESSAGES: Record<string, Record<string, string>> = {
  // ... mensajes existentes ...
  
  nuevo_modulo: {
    created: 'Recurso creado exitosamente',
    updated: 'Recurso actualizado exitosamente',
    deleted: 'Recurso eliminado exitosamente',
  },
};
```

---

## Ejemplos Prácticos

### Ejemplo 1: Crear Usuario con Validación

```typescript
const CrearUsuarioForm = () => {
  const [formData, setFormData] = useState<CreateUserDTO>({
    nombre: '',
    email: '',
    rol_id: 0,
  });

  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      showWarning('El nombre es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      showWarning('El email es requerido');
      return false;
    }

    if (!formData.email.includes('@')) {
      showWarning('El email no es válido');
      return false;
    }

    if (!formData.rol_id) {
      showWarning('Debes seleccionar un rol');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await userService.create(formData);
      // showSuccess ya se llamó en el servicio
      console.log('Usuario creado:', result);
      router.push('/usuarios');
    } catch (error) {
      // showError ya se llamó en el servicio
      // Puedes agregar lógica adicional aquí si es necesario
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos del formulario */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Usuario'}
      </button>
    </form>
  );
};
```

### Ejemplo 2: Lista con Eliminación

```typescript
const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;

    try {
      await userService.delete(id);
      // showSuccess ya se llamó en el servicio
      // Actualizar la lista
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      // showError ya se llamó en el servicio
    }
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <span>{user.nombre}</span>
          <button onClick={() => handleDelete(user.id, user.nombre)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Ejemplo 3: Upload de Archivos

```typescript
const FileUpload = () => {
  const handleUpload = async (file: File) => {
    // Validaciones previas
    if (file.size > 10 * 1024 * 1024) {
      showError('El archivo es demasiado grande (máximo 10MB)', 'file', 'file_too_large');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showError('Formato de archivo no válido', 'file', 'invalid_format');
      return;
    }

    try {
      setUploading(true);
      showInfo('Subiendo archivo...');
      
      const result = await fileService.upload(file);
      // showSuccess ya se llamó en el servicio
      
      onUploadComplete?.(result);
    } catch (error) {
      // showError ya se llamó en el servicio
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
    />
  );
};
```

### Ejemplo 4: Operación con Confirmación

```typescript
const CompletarTarea = ({ tarea }: { tarea: Tarea }) => {
  const handleComplete = async () => {
    // Validación previa
    if (!tarea.asignado_a_usuario_id) {
      showWarning('La tarea debe estar asignada antes de completarse');
      return;
    }

    if (tarea.estado === 'completada') {
      showInfo('La tarea ya está completada');
      return;
    }

    try {
      await tareaService.complete(tarea.id);
      // showSuccess ya se llamó en el servicio
      onTareaCompletada?.();
    } catch (error) {
      // showError ya se llamó en el servicio
    }
  };

  return (
    <button onClick={handleComplete}>
      Completar Tarea
    </button>
  );
};
```

---

## 🎯 Checklist de Implementación

Al implementar una nueva funcionalidad:

- [ ] ¿El servicio tiene try-catch con `showError` y `showSuccess`?
- [ ] ¿Las validaciones de formulario muestran `showWarning`?
- [ ] ¿Los mensajes de error son descriptivos?
- [ ] ¿Se muestran mensajes de éxito al completar operaciones?
- [ ] ¿Los errores se re-lanzan después de `showError` para que el componente pueda reaccionar?
- [ ] ¿Se usa el contexto y action correctos en `showError`/`showSuccess`?

---

## 📚 Recursos Adicionales

- **Archivo principal**: `/lib/utils/errorHandler.ts`
- **Ejemplos de uso**: 
  - `/lib/services/establecimientoService.ts`
  - `/lib/gestionPersonalService.ts`
  - `/components/tareas/TareaAsignarModal.tsx`
  - `/components/adjuntos/AdjuntosList.tsx`

---

## 🐛 Debugging

### Ver logs en consola

Todos los errores y éxitos se loguean automáticamente:

```
✅ Éxito: { context: 'user', action: 'created', message: '...' }
❌ Error: { context: 'user', action: 'create_failed', parsedError: {...}, originalError: {...} }
⚠️ Advertencia: mensaje
```

### Estructura de errores parseados

```typescript
{
  message: string,      // Mensaje legible para el usuario
  status: number,       // Código HTTP (400, 404, 500, etc.)
  code: string,         // Código de error (opcional)
  field: string,        // Campo con error (opcional)
  details: object,      // Detalles adicionales del servidor
}
```
