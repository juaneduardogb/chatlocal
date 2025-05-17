############################
###
### Generación del build
### de la aplicación
###
############################


FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY ./frontend/.npmrc ./
COPY ./frontend/package.json ./

RUN echo 'LISTA ARCHIVOS PACK'
RUN ls -la

RUN npm install --registry=https://pkgs.dev.azure.com/pwc-cl-ifs-fin/PortalReclutamiento/_packaging/package-test/npm/registry/ package_entra_id@1.0.90 --userconfig .npmrc
RUN npm install

COPY ./frontend/ .

RUN echo 'LISTA ARCHIVOS COPIADOS'
RUN ls -la


RUN npm run build

RUN echo 'LISTA ARCHIVOS CON DIST'
RUN ls -la

############################
###
### Servicio NGINX para levantar
### aplicación con archivos estáticos
###
############################

FROM nginx:latest as production
# Limpiar solo el directorio principal de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar la configuración de nginx
COPY ./frontend/nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos de la aplicación a un solo lugar
COPY --from=build /usr/src/app/dist /usr/share/nginx/html/

RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

RUN echo 'LISTA ARCHIVOS EN NGINX'
RUN ls -la /usr/share/nginx/html/assets

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]