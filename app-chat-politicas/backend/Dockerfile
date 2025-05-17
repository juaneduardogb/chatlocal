# Usa una imagen base oficial de Python
FROM python:3.11.4

# Instala tzdata para manejar zonas horarias
RUN apt-get update -y && apt-get install -y tzdata && \
    groupadd -r appuser && useradd -r -g appuser appuser

# Establece la zona horaria
ENV TZ=America/Santiago

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el código de la aplicación al contenedor
COPY ./backend/ .

RUN ls -la ./  # Check files in /app

RUN pip install --no-cache-dir -r ./requirements.txt

RUN pip install fastapi

RUN pip install "fastapi[standard]"

RUN chown -R appuser:appuser /app && \
    find /app -type d -exec chmod 755 {} \; && \
    find /app -type f -exec chmod 644 {} \;

USER appuser

# Expone el puerto en el que correrá la aplicación
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["fastapi", "run", "./app/main.py", "--port", "8080"]
