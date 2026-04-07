#!/bin/bash

# Configuración
REGISTRY="docker-registry.yes.com.sv"
PROJECT="cocina-planilla"
BACKEND_TAG="backend-latest"
FRONTEND_TAG="frontend-latest"

echo "🚀 Iniciando proceso de despliegue para $PROJECT..."

# Backend
echo "📦 Construyendo imagen de BACKEND..."
docker build -t $REGISTRY/$PROJECT:$BACKEND_TAG ./backend

echo "📤 Subiendo imagen de BACKEND al registro..."
docker push $REGISTRY/$PROJECT:$BACKEND_TAG

# Frontend
echo "📦 Construyendo imagen de FRONTEND..."
docker build -t $REGISTRY/$PROJECT:$FRONTEND_TAG ./frontend

echo "📤 Subiendo imagen de FRONTEND al registro..."
docker push $REGISTRY/$PROJECT:$FRONTEND_TAG

echo "✅ Proceso completado exitosamente."
echo "Recuerda actualizar el stack en Portainer o ejecutar: docker-compose up -d"
