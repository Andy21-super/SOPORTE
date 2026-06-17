FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
RUN npm ci
COPY backend backend
COPY frontend frontend
WORKDIR /app/backend
RUN npm run prisma:generate && npm run build
WORKDIR /app/frontend
RUN npm run build
WORKDIR /app/backend
ENV FRONTEND_DIST_DIR=/app/frontend/dist
ENV UPLOAD_DIR=/var/data/uploads
EXPOSE 4000
CMD ["sh", "-c", "mkdir -p /var/data/uploads && npm run sqlite:init && npm run prisma:seed && npm run start"]
