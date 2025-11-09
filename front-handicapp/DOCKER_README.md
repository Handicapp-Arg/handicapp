# Docker - Handicapp Frontend

Este directorio contiene la configuración de Docker optimizada para el frontend de Handicapp (Next.js).

## 📋 Requisitos Previos

- Docker Desktop instalado y en ejecución
- Node.js 20 o superior (para desarrollo local)
- pnpm 9.12.3 o superior

## 🏗️ Arquitectura del Dockerfile

El Dockerfile utiliza un build multi-stage para optimizar el tamaño de la imagen:

1. **Base**: Configuración base con Node.js 20 Alpine y pnpm
2. **Deps**: Instalación de dependencias
3. **Builder**: Construcción de la aplicación Next.js
4. **Runner**: Imagen final minimalista para producción

## 🚀 Construcción Local

### Construir la imagen

```bash
cd front-handicapp
docker build -t handicapp-frontend:latest .
```

### Ejecutar el contenedor

```bash
docker run -p 3000:3000 handicapp-frontend:latest
```

La aplicación estará disponible en `http://localhost:3000`

## 🌐 Variables de Entorno

Para configurar las variables de entorno en producción, puedes pasarlas al ejecutar el contenedor:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://tu-api.com/api/v1 \
  -e NEXT_PUBLIC_API_URL=https://tu-api.com \
  handicapp-frontend:latest
```

### Variables disponibles:

- `NEXT_PUBLIC_API_BASE_URL`: URL base de la API
- `NEXT_PUBLIC_API_URL`: URL de la API
- `NEXT_PUBLIC_API_BASE`: URL base del backend
- `NEXT_PUBLIC_REQUEST_TIMEOUT_MS`: Timeout de requests (default: 30000)
- `NEXT_PUBLIC_REQUEST_MAX_RETRIES`: Reintentos máximos (default: 1)

## 📦 Deployment en Dockploy

### Configuración en Dockploy:

1. **Source**: Conectar el repositorio de GitHub
2. **Branch**: `dev` o `main` según corresponda
3. **Build Context**: `./front-handicapp`
4. **Dockerfile Path**: `./front-handicapp/Dockerfile`
5. **Port**: `3000`

### Variables de entorno en Dockploy:

```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://tu-api.com/api/v1
NEXT_PUBLIC_API_URL=https://tu-api.com
NEXT_PUBLIC_API_BASE=https://tu-api.com
```

## 🔍 Verificación del Build

### Ver logs del contenedor:

```bash
docker logs <container-id>
```

### Verificar el tamaño de la imagen:

```bash
docker images handicapp-frontend
```

### Inspeccionar el contenedor:

```bash
docker exec -it <container-id> sh
```

## 🐛 Troubleshooting

### Error: Docker no está corriendo

```bash
# Windows: Iniciar Docker Desktop desde el menú de inicio
# Verificar que Docker está corriendo:
docker ps
```

### Error: Build falla por dependencias

```bash
# Limpiar caché de Docker
docker builder prune -a

# Reconstruir sin caché
docker build --no-cache -t handicapp-frontend:latest .
```

### Error: Puerto 3000 ya en uso

```bash
# Usar otro puerto
docker run -p 3001:3000 handicapp-frontend:latest
```

## 📝 Notas Importantes

- El Dockerfile está optimizado para **producción**
- Utiliza modo `standalone` de Next.js para reducir el tamaño de la imagen
- La imagen final es Alpine-based, muy ligera (~150MB)
- El contenedor corre con un usuario no-root (`nextjs`) por seguridad
- El build excluye archivos innecesarios gracias al `.dockerignore`

## 🔄 Actualización

Cuando hagas cambios en el código:

1. Haz commit y push a GitHub
2. Dockploy detectará automáticamente los cambios (si está configurado con webhooks)
3. O puedes hacer deploy manual desde el panel de Dockploy

## ✅ Checklist Pre-Deploy

- [ ] Docker Desktop está corriendo
- [ ] El build local funciona sin errores
- [ ] Las variables de entorno están configuradas
- [ ] El código está en la rama correcta (dev/main)
- [ ] Se hizo commit y push a GitHub
- [ ] Dockploy está configurado con el repositorio correcto
- [ ] El puerto 3000 está expuesto en Dockploy

## 📚 Recursos

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockploy Documentation](https://dockploy.com/docs)
