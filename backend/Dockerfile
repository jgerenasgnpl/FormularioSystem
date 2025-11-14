FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto de archivos
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto (sobrescribir con docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Iniciar servidor
CMD ["node", "server.js"]
