# Chat de Políticas - Frontend

Este proyecto es una aplicación de chat para consultas sobre políticas, desarrollada con React, TypeScript y Vite.

## Tecnologías Principales

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- AI SDK para integración de IA
- React Router para navegación
- Zustand para gestión de estado

## Requisitos Previos

- Node.js (versión recomendada: 18.x o superior)
- npm o yarn

## Instalación

```bash
# Instalar dependencias
npm install
# o
yarn install
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run lint` - Ejecuta el linter para encontrar y corregir problemas
- `npm run format` - Formatea el código usando Prettier
- `npm run preview` - Previsualiza la versión de producción localmente
- `npm run serve` - Sirve la aplicación compilada en el puerto 80

## Estructura del Proyecto

- `/src` - Código fuente de la aplicación
- `/public` - Archivos estáticos
- `/dist` - Archivos compilados (generados al ejecutar build)

## Configuración de Docker

El proyecto incluye un Dockerfile para crear una imagen de contenedor. Para construir y ejecutar:

```bash
# Construir la imagen
docker build -t chat-politicas-frontend .

# Ejecutar el contenedor
docker run -p 80:80 chat-politicas-frontend
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que configure Vite).

## Despliegue

Para desplegar la aplicación:

1. Ejecutar `npm run build` para generar los archivos de producción
2. Los archivos generados estarán en el directorio `/dist`
3. Estos archivos pueden ser servidos por cualquier servidor web estático

También puede utilizar el archivo `deploy-azure.yaml` para configurar un despliegue en Azure.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
    languageOptions: {
        // other options...
        parserOptions: {
            project: ['./tsconfig.node.json', './tsconfig.app.json'],
            tsconfigRootDir: import.meta.dirname
        }
    }
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
    // Set the react version
    settings: { react: { version: '18.3' } },
    plugins: {
        // Add the react plugin
        react
    },
    rules: {
        // other rules...
        // Enable its recommended rules
        ...react.configs.recommended.rules,
        ...react.configs['jsx-runtime'].rules
    }
});
```

