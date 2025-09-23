# Scripts de Inicio y Detención - HandicApp

Este directorio contiene scripts automatizados para iniciar y detener la aplicación HandicApp con Docker Compose.

## 📁 Archivos Disponibles

### Scripts de Inicio
- **`start-app.sh`** - Script para Linux/macOS
- **`start-app.bat`** - Script para Windows

### Scripts de Detención
- **`stop-app.sh`** - Script para Linux/macOS
- **`stop-app.bat`** - Script para Windows

## 🚀 Uso

### En Linux/macOS:
```bash
# Iniciar la aplicación
./start-app.sh

# Detener la aplicación
./stop-app.sh
```

### En Windows:
```cmd
# Iniciar la aplicación
start-app.bat

# Detener la aplicación
stop-app.bat
```

## ✨ Características de los Scripts

### Script de Inicio (`start-app`)
1. **Verificaciones previas:**
   - ✅ Verifica que Docker esté ejecutándose
   - ✅ Verifica que docker-compose esté instalado

2. **Ejecución:**
   - 🚀 Ejecuta `docker-compose up -d`
   - ⏱️ Espera 5 segundos para que los contenedores se inicien
   - 🔍 Verifica el estado de todos los contenedores

3. **Si todo sale bien:**
   - ✅ Muestra mensaje de éxito
   - 📊 Muestra el estado de los servicios
   - 🌐 Muestra las URLs disponibles
   - 📱 **Abre automáticamente 2 terminales:**
     - Una con logs del **Frontend** (Next.js)
     - Otra con logs del **Backend** (Node.js API)

4. **Compatibilidad de terminales:**
   - **Linux:** xterm, GNOME Terminal, Konsole
   - **Windows:** Command Prompt (cmd)

### Script de Detención (`stop-app`)
1. **Ejecuta:** `docker-compose down`
2. **Muestra:** Estado final de los contenedores
3. **Confirma:** Aplicación detenida correctamente

## 🌐 URLs de la Aplicación

Una vez iniciada, la aplicación estará disponible en:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3003
- **PostgreSQL:** localhost:5434
- **Redis:** localhost:6381

## 🔧 Comandos Manuales

Si prefieres ejecutar los comandos manualmente:

```bash
# Iniciar
docker-compose up -d

# Ver logs del frontend
docker-compose logs -f front-handicapp

# Ver logs del backend
docker-compose logs -f api

# Ver todos los logs
docker-compose logs -f

# Detener
docker-compose down

# Ver estado
docker-compose ps
```

## ⚠️ Requisitos Previos

1. **Docker** debe estar instalado y ejecutándose
2. **Docker Compose** debe estar instalado
3. **En Linux:** Los scripts deben tener permisos de ejecución (ya configurados)

## 🐛 Solución de Problemas

### Error: "Docker no está ejecutándose"
- **Linux:** Inicia Docker con `sudo systemctl start docker`
- **Windows:** Inicia Docker Desktop
- **macOS:** Inicia Docker Desktop

### Error: "docker-compose no está instalado"
- Instala Docker Compose siguiendo la [documentación oficial](https://docs.docker.com/compose/install/)

### Los contenedores no se inician
- Ejecuta `docker-compose logs` para ver los errores
- Verifica que los puertos 3000, 3003, 5434 y 6381 estén libres

### Las terminales no se abren automáticamente
- En Linux: Instala un terminal gráfico (xterm, gnome-terminal, o konsole)
- En Windows: Asegúrate de que cmd esté disponible

## 📝 Notas

- Los scripts incluyen emojis para mejor visualización
- Las terminales de logs se mantienen abiertas hasta que presiones Ctrl+C
- Los scripts son seguros y verifican el estado antes de proceder
- Compatible con diferentes distribuciones de Linux y versiones de Windows
