# 🧪 Testing del Sistema de Notificaciones

## 📋 Guía de Pruebas Completa

Esta guía te ayudará a probar todas las funcionalidades del sistema de notificaciones implementado.

---

## 🚀 Preparación

### 1. Ejecutar Migración de Base de Datos

```powershell
cd back-handicapp
npx ts-node scripts/add-notificacion-foreign-keys.ts
```

**Resultado esperado:**
```
🚀 Iniciando migración de notificaciones...
✅ Conexión a base de datos establecida
✅ Columna evento_id agregada
✅ Columna tarea_id agregada
✅ Índice ix_notif_evento creado
✅ Índice ix_notif_tarea creado
🎉 Migración completada exitosamente!
```

### 2. Iniciar el Servidor Backend

```powershell
cd back-handicapp
pnpm run dev
```

### 3. Asegurarse de tener un token de autenticación

Inicia sesión en la aplicación o usa Postman/Thunder Client para obtener un token JWT.

---

## 🔐 Preparar Autenticación en Postman/Thunder Client

Todas las peticiones requieren autenticación. Debes:

1. **Hacer login**
   ```
   POST http://localhost:3000/api/v1/auth/login
   Content-Type: application/json

   {
     "email": "tu@email.com",
     "password": "tuPassword"
   }
   ```

2. **El token se guardará en una cookie HTTPOnly automáticamente**

---

## 📝 Tests por Funcionalidad

### Test 1: Trigger Automático - Tarea Asignada

**Objetivo**: Verificar que se crea una notificación cuando asignas una tarea a otro usuario.

#### Paso 1: Crear una tarea asignada a otro usuario

```http
POST http://localhost:3000/api/v1/tareas
Content-Type: application/json

{
  "titulo": "Vacunación caballo X",
  "descripcion": "Aplicar vacuna antirrábica",
  "asignado_a_usuario_id": 2,
  "prioridad": "alta",
  "fecha_limite": "2025-02-01"
}
```

**Resultado esperado:**
- ✅ Status 201
- ✅ Tarea creada exitosamente
- ✅ Log en consola: "🔔 Trigger: Notificación de tarea asignada enviada"

#### Paso 2: Verificar que se creó la notificación

Loguearse como el usuario con ID 2 y hacer:

```http
GET http://localhost:3000/api/v1/notificaciones
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "id": 1,
        "tipo": "tarea.asignada",
        "titulo": "Nueva tarea asignada",
        "mensaje": "Se te ha asignado la tarea: Vacunación caballo X",
        "estado": "unread",
        "importante": true,
        "tarea_id": 1,
        "url": "/tareas/1",
        "createdAt": "2025-01-15T..."
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### Test 2: Trigger Automático - Tarea Completada

**Objetivo**: Verificar que se notifica al creador cuando se completa una tarea.

#### Paso 1: Completar la tarea (como usuario asignado)

```http
PATCH http://localhost:3000/api/v1/tareas/1/completar
```

**Resultado esperado:**
- ✅ Status 200
- ✅ Tarea marcada como completada
- ✅ Log: "🔔 Trigger: Notificación de tarea completada enviada"

#### Paso 2: Verificar notificación (como usuario creador)

Loguearse como el creador de la tarea:

```http
GET http://localhost:3000/api/v1/notificaciones
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "tipo": "tarea.completada",
        "titulo": "Tarea completada",
        "mensaje": "La tarea \"Vacunación caballo X\" ha sido completada",
        "estado": "unread",
        "tarea_id": 1,
        "url": "/tareas/1"
      }
    ]
  }
}
```

---

### Test 3: Trigger Automático - Evento Creado

**Objetivo**: Verificar que se notifica cuando se crea un evento.

#### Paso 1: Crear un evento

```http
POST http://localhost:3000/api/v1/eventos
Content-Type: application/json

{
  "titulo": "Vacunación antirrábica",
  "descripcion": "Aplicación de vacuna",
  "tipo_evento_id": 1,
  "caballo_id": 1,
  "veterinario_usuario_id": 3,
  "prioridad": "alta",
  "fecha_evento": "2025-02-15T10:00:00Z"
}
```

**Resultado esperado:**
- ✅ Status 201
- ✅ Evento creado
- ✅ Log: "🔔 Trigger: Notificación de evento creado enviada"

---

### Test 4: Listar Notificaciones con Filtros

#### Test 4.1: Listar todas

```http
GET http://localhost:3000/api/v1/notificaciones
```

#### Test 4.2: Filtrar por tipo

```http
GET http://localhost:3000/api/v1/notificaciones?tipo=tarea
```

#### Test 4.3: Filtrar solo no leídas

```http
GET http://localhost:3000/api/v1/notificaciones?leida=false
```

#### Test 4.4: Con paginación

```http
GET http://localhost:3000/api/v1/notificaciones?page=1&limit=10
```

#### Test 4.5: Filtrar por rango de fechas

```http
GET http://localhost:3000/api/v1/notificaciones?fecha_desde=2025-01-01&fecha_hasta=2025-01-31
```

**Resultado esperado:**
- ✅ Status 200
- ✅ Notificaciones filtradas correctamente
- ✅ Paginación funcionando

---

### Test 5: Obtener una Notificación Específica

```http
GET http://localhost:3000/api/v1/notificaciones/1
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "tarea.asignada",
    "titulo": "Nueva tarea asignada",
    "mensaje": "Se te ha asignado la tarea: Vacunación caballo X",
    "estado": "unread",
    "importante": true,
    "tarea_id": 1,
    "usuario": {
      "id": 2,
      "nombre": "Juan",
      "email": "juan@example.com"
    },
    "tarea": {
      "id": 1,
      "titulo": "Vacunación caballo X"
    }
  }
}
```

---

### Test 6: Marcar como Leída

#### Test 6.1: Marcar una como leída

```http
PATCH http://localhost:3000/api/v1/notificaciones/1/leer
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída",
  "data": {
    "id": 1,
    "estado": "read"
  }
}
```

#### Test 6.2: Marcar múltiples como leídas

```http
PATCH http://localhost:3000/api/v1/notificaciones/leer-multiples
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "3 notificaciones marcadas como leídas",
  "data": 3
}
```

#### Test 6.3: Marcar todas como leídas

```http
PATCH http://localhost:3000/api/v1/notificaciones/leer-todas
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "data": 5
}
```

---

### Test 7: Obtener Estadísticas

```http
GET http://localhost:3000/api/v1/notificaciones/stats
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "no_leidas": 8,
    "leidas": 7,
    "importantes": 5,
    "por_tipo": {
      "tarea": 10,
      "evento": 4,
      "sistema": 1
    }
  }
}
```

---

### Test 8: Obtener Contador de No Leídas

```http
GET http://localhost:3000/api/v1/notificaciones/contador
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": 8
}
```

---

### Test 9: Eliminar Notificaciones

#### Test 9.1: Eliminar una notificación

```http
DELETE http://localhost:3000/api/v1/notificaciones/1
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente",
  "data": null
}
```

#### Test 9.2: Eliminar múltiples notificaciones

```http
DELETE http://localhost:3000/api/v1/notificaciones/eliminar-multiples
Content-Type: application/json

{
  "ids": [2, 3, 4]
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "3 notificaciones eliminadas exitosamente",
  "data": 3
}
```

#### Test 9.3: Eliminar todas las leídas

```http
DELETE http://localhost:3000/api/v1/notificaciones/eliminar-leidas
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "7 notificaciones eliminadas",
  "data": 7
}
```

---

## 🔐 Tests de Seguridad

### Test S1: Intentar acceder sin autenticación

```http
GET http://localhost:3000/api/v1/notificaciones
# SIN cookie de autenticación
```

**Resultado esperado:**
- ✅ Status 401
- ✅ Mensaje: "No autorizado"

---

### Test S2: Intentar acceder a notificación de otro usuario

#### Paso 1: Obtener ID de notificación de otro usuario

Como usuario A:
```http
GET http://localhost:3000/api/v1/notificaciones
# Anotar un ID
```

#### Paso 2: Intentar acceder como usuario B

```http
GET http://localhost:3000/api/v1/notificaciones/1
# Logueado como usuario B
```

**Resultado esperado:**
- ✅ Status 403
- ✅ Mensaje: "No autorizado"

---

## 🐛 Tests de Validación

### Test V1: ID inválido

```http
GET http://localhost:3000/api/v1/notificaciones/abc
```

**Resultado esperado:**
- ✅ Status 400
- ✅ Mensaje: "ID inválido"

---

### Test V2: Array vacío en marcar múltiples

```http
PATCH http://localhost:3000/api/v1/notificaciones/leer-multiples
Content-Type: application/json

{
  "ids": []
}
```

**Resultado esperado:**
- ✅ Status 400
- ✅ Mensaje: "El array de IDs no puede estar vacío"

---

### Test V3: IDs no válidos en array

```http
PATCH http://localhost:3000/api/v1/notificaciones/leer-multiples
Content-Type: application/json

{
  "ids": ["abc", "def"]
}
```

**Resultado esperado:**
- ✅ Status 400
- ✅ Mensaje: "IDs inválidos en el array"

---

## 📊 Checklist de Testing

### ✅ Funcionalidad Básica

- [ ] Listar notificaciones
- [ ] Obtener notificación por ID
- [ ] Filtrar por tipo
- [ ] Filtrar por estado (leída/no leída)
- [ ] Paginación funciona
- [ ] Filtros de fecha funcionan

### ✅ Operaciones de Lectura

- [ ] Marcar una como leída
- [ ] Marcar múltiples como leídas
- [ ] Marcar todas como leídas

### ✅ Operaciones de Eliminación

- [ ] Eliminar una notificación
- [ ] Eliminar múltiples
- [ ] Eliminar todas las leídas

### ✅ Estadísticas

- [ ] Obtener estadísticas completas
- [ ] Obtener contador de no leídas

### ✅ Triggers Automáticos

- [ ] Se crea notificación al asignar tarea
- [ ] Se crea notificación al completar tarea
- [ ] Se crea notificación al crear evento
- [ ] Se crea notificación al actualizar evento

### ✅ Seguridad

- [ ] Requiere autenticación
- [ ] No se puede acceder a notificaciones de otros usuarios
- [ ] Validación de IDs funciona
- [ ] Validación de arrays funciona

### ✅ Performance

- [ ] Paginación evita cargas masivas
- [ ] Triggers no bloquean operaciones principales
- [ ] Consultas son rápidas (< 500ms)

---

## 🔍 Logs a Verificar

Durante el testing, verificar que aparezcan estos logs en la consola del backend:

### Al crear tarea asignada:
```
[INFO] Tarea creada: 1
[INFO] 🔔 Trigger: Notificación de tarea asignada enviada
```

### Al completar tarea:
```
[INFO] Tarea completada: 1
[INFO] 🔔 Trigger: Notificación de tarea completada enviada
```

### Al crear evento:
```
[INFO] Evento creado: 1
[INFO] 🔔 Trigger: Notificación de evento creado enviada
```

### Al acceder a notificaciones:
```
[INFO] Audit: Usuario 2 accedió a GET /api/v1/notificaciones
```

---

## 📱 Testing desde el Frontend

Una vez que el backend esté funcionando, probar desde la UI del frontend:

1. **Campana de notificaciones** (icono en navbar)
   - Debe mostrar contador de no leídas
   - Al hacer click, debe abrir panel de notificaciones

2. **Panel de notificaciones**
   - Debe listar notificaciones recientes
   - Badge rojo en no leídas
   - Marcar como leída al hacer click
   - Botón "Marcar todas como leídas"

3. **Página de notificaciones** (`/notificaciones`)
   - Lista completa con paginación
   - Filtros funcionando
   - Estadísticas visibles
   - Acciones de eliminación

---

## 🎯 Resultado Esperado Final

Después de todos los tests, deberías poder:

✅ Crear tareas/eventos y ver notificaciones generarse automáticamente  
✅ Recibir notificaciones sin recargar (cuando agregues WebSockets)  
✅ Marcar notificaciones como leídas  
✅ Ver estadísticas de tus notificaciones  
✅ Eliminar notificaciones antiguas  
✅ Filtrar y buscar notificaciones  
✅ Ver notificaciones relacionadas (tarea, evento)  

---

## 🆘 Troubleshooting

### Error: "No autorizado"
**Solución**: Verificar que estás logueado y la cookie se está enviando

### Error: "Notificación no encontrada"
**Solución**: Verificar que el ID existe y pertenece al usuario autenticado

### No se crean notificaciones automáticas
**Solución**: 
1. Verificar que la migración se ejecutó correctamente
2. Revisar logs del backend
3. Verificar que estás asignando tarea a un usuario diferente al creador

### Error de base de datos
**Solución**: 
1. Ejecutar `npx ts-node scripts/add-notificacion-foreign-keys.ts`
2. Reiniciar el servidor

---

**Versión**: 1.0.0  
**Última actualización**: 2025-01-15
