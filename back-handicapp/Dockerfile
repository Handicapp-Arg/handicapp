# Use Node.js LTS version
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for development)
# Use --no-frozen-lockfile to handle lockfile inconsistencies gracefully
RUN pnpm install --no-frozen-lockfile

# Copy TypeScript config for path mapping
COPY tsconfig.json ./

# Copy source code
COPY . .

# For development, we'll use ts-node-dev instead of building
# RUN pnpm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application in development mode
CMD ["pnpm", "run", "dev"]
