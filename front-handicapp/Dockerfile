# Usar la imagen oficial de Node.js como base
FROM node:20-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias (incluyendo devDependencies para desarrollo)
# Use --no-frozen-lockfile to handle lockfile inconsistencies gracefully
RUN pnpm install --no-frozen-lockfile

# Copiar el código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer el puerto
EXPOSE 3000

# Variables de entorno
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar la aplicación en modo desarrollo
CMD ["pnpm", "dev"]
