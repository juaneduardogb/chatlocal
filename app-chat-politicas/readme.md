# Chat de Políticas

Aplicación de chat para consultas sobre políticas, con un frontend en React/TypeScript y un backend en Python/FastAPI.

## Estructura del Proyecto

-   `/frontend` - Aplicación cliente desarrollada con React, TypeScript y Vite
-   `/backend` - API y servicios desarrollados con Python y FastAPI

## Requisitos Previos

### Para el Frontend

-   Node.js (versión recomendada: 18.x o superior)
-   npm o yarn

### Para el Backend

-   Python 3.9 o superior
-   pip (gestor de paquetes de Python)
-   Entorno virtual de Python (recomendado)

## Configuración del Entorno

### Backend

1. Crear un entorno virtual de Python:

    ```bash
    python -m venv backend-env
    ```

2. Activar el entorno virtual:

    - En Windows: `backend-env\Scripts\activate`
    - En Unix o MacOS: `source backend-env/bin/activate`

3. Actualizar pip:

    ```bash
    python -m pip install --upgrade pip
    ```

4. Instalar dependencias:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

### Frontend

1. Instalar dependencias:
    ```bash
    cd frontend
    npm install
    ```

## Ejecución en Desarrollo

### Backend

```bash
cd backend
# Ejecutar el servidor FastAPI
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

## Despliegue con Docker

### Backend

```bash
cd backend
docker build -f Dockerfile -t backend-chat .
docker run -p 8000:8000 backend-chat
```

### Frontend

```bash
cd frontend
docker build -t frontend-chat .
docker run -p 80:80 frontend-chat
```

## Configuración de Despliegue

El proyecto incluye archivos de configuración para despliegue en diferentes entornos:

-   `deploy.dev.yaml` - Configuración para entorno de desarrollo
-   `deploy.stage.yaml` - Configuración para entorno de staging
-   `main.yaml` - Configuración principal
-   `test.yaml` - Configuración para pruebas

## Documentación Adicional

Para más detalles sobre cada componente, consulte los README específicos:

-   [README del Frontend](./frontend/README.md)
-   [README del Backend](./backend/README.md)
