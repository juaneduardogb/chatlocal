# Backend de Chat PwC Chile

Este proyecto implementa el backend para el sistema de Chat PwC Chile, siguiendo principios de Clean Architecture.

## Estructura del Proyecto

La estructura del proyecto sigue los principios de Clean Architecture, organizando el código por casos de uso y capas:

```
backend/
├── app/                         # Configuración general de la aplicación
│   ├── api/                     # Interfaces de entrada (controllers/routers)
│   │   ├── v1/                  # Versionado de API
│   │   │   ├── app_config/      # Endpoints de App-config
│   │   │   ├── chat/            # Endpoints de Chat
│   │   │   ├── documents/       # Endpoints de Documents
│   │   │   ├── utilities/       # Endpoints de Utilities
│   │   │   └── knowledge_base/  # Endpoints de Knowledge-base
│   │   └── dependencies.py      # Dependencias compartidas
│   └── main.py                  # Punto de entrada
│
├── core/                        # Núcleo de la aplicación
│   ├── config.py                # Configuraciones globales
│   └── database.py              # Configuración de base de datos
│
├── middlewares/                 # Middlewares de la aplicación
│
├── domain/                      # Reglas de negocio
│   ├── app_config/              # Entidades y reglas para App-config
│   │   ├── entities/            # Modelos de dominio
│   │   ├── exceptions.py        # Excepciones específicas
│   │   └── interfaces/          # Interfaces de repositorio
│   ├── chat/                    # Entidades y reglas para Chat
│   ├── documents/               # Entidades y reglas para Documents
│   ├── embeddings/              # Entidades y reglas para Embeddings
│   ├── utilities/               # Entidades y reglas para Utilities
│   └── knowledge_base/          # Entidades y reglas para Knowledge-base
│
├── usecases/                    # Casos de uso (lógica de aplicación)
│   ├── app_config/              # Casos de uso de App-config
│   ├── chat/                    # Casos de uso de Chat
│   ├── documents/               # Casos de uso de Documents
│   ├── utilities/               # Casos de uso de Utilities
│   └── knowledge_base/          # Casos de uso de Knowledge-base
│
├── infrastructure/              # Adaptadores externos
│   ├── database/                # Acceso a datos
│   │   ├── mongodb/             # Implementación MongoDB
│   │   └── repositories/        # Implementaciones de repositorios
│   │       ├── app_config/      # Repositorios para App-config
│   │       ├── chat/            # Repositorios para Chat
│   │       ├── documents/       # Repositorios para Documents
│   │       ├── utilities/       # Repositorios para Utilities
│   │       └── knowledge_base/  # Repositorios para Knowledge-base
│   └── services/                # Servicios externos
│       ├── genai/               # Servicios de IA generativa
│       ├── redis/               # Servicios de caché Redis
│       └── storage/             # Servicios de almacenamiento
│
├── service/                     # Servicios de la aplicación (arquitectura antigua)
│   └── genai_shared/            # Servicios compartidos de IA generativa
│
├── shared/                      # Componentes compartidos (arquitectura antigua)
│
├── utils/                       # Utilidades generales
```

## Principios de Clean Architecture

1. **Independencia de frameworks**: El dominio y los casos de uso no dependen de frameworks externos.
2. **Testabilidad**: La arquitectura facilita la prueba de cada componente de forma aislada.
3. **Independencia de UI**: La lógica de negocio no depende de la interfaz de usuario.
4. **Independencia de base de datos**: El dominio no conoce la implementación de la base de datos.
5. **Independencia de agentes externos**: El dominio no depende de servicios externos.

## Flujo de Implementación

Para implementar una nueva funcionalidad siguiendo esta arquitectura, debe seguir los siguientes pasos:

1. **Definir entidades en el dominio**:

    - Crear los modelos de dominio en `domain/<módulo>/entities/`
    - Establecer reglas de negocio asociadas a esas entidades

2. **Definir interfaces de repositorio**:

    - Crear interfaces que definan los contratos para el acceso a datos en `domain/<módulo>/interfaces/`

3. **Implementar casos de uso**:

    - Crear clases de caso de uso en `usecases/<módulo>/` que implementen la lógica de negocio
    - Los casos de uso deben depender de interfaces, no de implementaciones concretas

4. **Implementar repositorios**:

    - Crear implementaciones concretas de los repositorios en `infrastructure/database/repositories/<módulo>/`
    - Estas implementaciones deben cumplir con los contratos definidos en las interfaces

5. **Crear endpoints en la API**:
    - Implementar los controladores o routers en `app/api/v1/<módulo>/`
    - Los controladores deben usar casos de uso, no acceder directamente a los repositorios

## Casos de Uso

El sistema está organizado en torno a los siguientes casos de uso principales:

1. **App-config**: Gestión de configuración de la aplicación y autenticación.
2. **Chat**: Gestión de conversaciones con el modelo de lenguaje.
3. **Documents**: Gestión de documentos y archivos.
4. **Knowledge-base**: Gestión de bases de conocimiento.
5. **Embeddings**: Gestión de embeddings para búsqueda semántica.
6. **Utilities**: Servicios de utilidad como extracción de texto de documentos.

## Pautas para Desarrolladores

### Estructura de Carpetas

Todas las nuevas funcionalidades deben seguir la estructura de carpetas existente:

-   **Dominio**: Entidades, interfaces y reglas de negocio
-   **Casos de Uso**: Lógica de aplicación
-   **Infraestructura**: Implementaciones técnicas y adaptadores externos
-   **API**: Endpoints y controladores

### Estado Actual del Proyecto

El proyecto se encuentra en proceso de migración desde una arquitectura monolítica hacia una arquitectura limpia. Por lo tanto, coexisten dos estructuras:

1. **Estructura Nueva (Clean Architecture)**: Organizada por módulos de dominio, casos de uso e infraestructura.
2. **Estructura Antigua**: Carpetas como `service`, `shared` y `backend` que contienen código de la implementación original.

Se recomienda seguir estas directrices para contribuir al proceso de migración:

1. Todos los nuevos desarrollos deben implementarse siguiendo la nueva estructura.
2. Al modificar código existente, considere migrar las funcionalidades a la nueva arquitectura.
3. Evite añadir nuevas funcionalidades a la estructura antigua.

### Importaciones

-   Evite usar importaciones de la carpeta `models`, en su lugar, use las entidades definidas en `domain/<módulo>/entities/`
-   Evite acceder directamente a los repositorios desde los routers, siempre use casos de uso como intermediarios
-   Cuando importe entidades de dominio, hágalo desde sus módulos específicos, no desde paquetes genéricos

### Implementación de Casos de Uso

Todos los casos de uso deben seguir el mismo patrón:

1. Recibir un repositorio (que implemente la interfaz correspondiente) en el constructor
2. Implementar un método `execute()` con los parámetros necesarios
3. Delegar el acceso a datos al repositorio
4. Encapsular la lógica de negocio dentro del caso de uso

### Implementación de Repositorios

Todos los repositorios deben:

1. Implementar la interfaz correspondiente definida en el dominio
2. Encapsular todos los detalles de acceso a datos
3. Manejar conversiones entre entidades de dominio y modelos de la capa de persistencia
4. Gestionar errores específicos de la capa de datos y traducirlos a excepciones de dominio

## Instalación y Ejecución

1. Instalar dependencias:

    ```
    pip install -r requirements.txt
    ```

2. Configurar variables de entorno:

    ```
    cp .env.example .env
    ```

3. Ejecutar la aplicación:
    ```
    uvicorn app.main:app --reload
    ```

## Documentación de la API

La documentación de la API está disponible en:

-   Swagger UI: `/docs`
-   ReDoc: `/redoc`
