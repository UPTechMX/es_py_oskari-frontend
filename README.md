# Oskari

[Oskari](http://www.oskari.org/) Map Application Framework apunta a proveer un framework y una colección de bundles (módulos) de mejoras de funcionamiento y plugins para un desarrollo rápido de características ricas de aplicaciones web GI.

Documentación disponible en [http://www.oskari.org].

Este repositorio contiene el código frontend framework para Oskari. El desarrollo del frontend framework requiere de una aplicación frontend. Puedes clonar la muestra de aplicación frontend de [https://github.com/oskariorg/sample-application]. El directorio de la aplicación muestra debería estar localizada cerca del directorio del frontend framework.

Necesitarás que el servidor de oskari se ejecute en respuesta a las demandas del XHR hechas por el frontend. Puedes descargar una copia pre-compilada del servidor de [http://www.oskari.org/download]. También puedes construirla desde la fuente por clonación [oskari-server](https://github.com/oskariorg/oskari-server) y [sample-server-extension](https://github.com/oskariorg/sample-server-extension).

Las aplicaciones de Oskari frontend son construidas usando Webpack.

## Preparación

Asegúrate de contar con Node 10.x / NPM 5.x por lo menos. 

* Ejecuta `npm install` en el repositorio raíz frontend framework.
* Ejecuta `npm install` en el repositorio raíz frontend de la aplicación.

Asegúrate de contar con la ejecución del servidor de oskari en el localhost port 8080 (puede ser personalizado en webpack.config.js).

## Ejecución del desarrollo

El servidor Webpack dev se utiliza para servir al bundle JS (módulo) y a los activos cuando se ejecuta en un desarrollo local. Las llamadas XHR serán recuperadas al Java backend que se asumen serán ejecutadas en localhost:8080.

Para que el servidor sepa buscar el bundle JS y los activos desde el lugar correcto, necesitamos tener la versión cliente configurada en el servidor Oskari `oskari-ext.properties`:

```
oskari.client.version=dist/devapp
```

Para inicar el servidor Webpack dev ejecuta `npm start`. El script de inicio en el oskari-frontend package.json se predefine al directorios de la aplicación muestra pero esto puede ser parametrizado para aplicaciones personalizadas.

Cuando veas el mensaje "Compilación exitosa." en la terminal, podrás abrir la aplicación en el navegador en `localhost:8081`.

El servidor dev tiene activada la recarga automática cuando guardes los cambios en código JS y hot reloading para S/CSS sin la necesidad de recargar todo el navegador.

## Construir para la producción

Para construir minifed JS y los activos ejecuta: `npm run build`.

Esto producirá archivos optimizados para la producción debajo de `dist/devapp/servlet/`. El script de construcción en el paquete j.son oskari-frontend, de nuevo, predefine el directorio de la aplicación muestra. También se predefine a una versión nombrada `devapp`. Tanto la aplicación como el número de la versión pueden ser parametrizadas para aplicaciones personalizadas.

Nota: El número de versión dado para el comando de construcción necesita igualar la versión cliente (`oskari.client.version`) en el servidor Oskari `oskari-ext.properties`.

Caso especial: Si en tu servidor de producción, la localización de tu index.jsp de aplicación es mapeada a algo distinto a la raíz (eg. `http://yourdomain.com/my-oskari-app/`), pero los activos se mapeados en relación con la raíz (eg. `http://yourdomain.com/Oskari/dist/...`), necesitarás agregar el parametro de construcción `--env.absolutePublicPath=true` como éste:

    npm run build -- --env.absolutePublicPath=true

## Personaliación de Oskari

Cualquier aplicación personalizada debe usar la plantilla de [sample-server-extension](https://github.com/oskariorg/sample-server-extension) como base para servidores personalizados y crear un repositorio específico para aplicación para el frontend. 

Puedes utilizar la plantilla de [sample-application](https://github.com/oskariorg/sample-application) para crear tu aplicación frontend personalizada. Mira más instrucciones en el repositorio de la aplicación muestra.

Ejecuta npm `build` y comandos `start` en la raíz de tu repositorio de la aplicación.

## Dependencies

¡Nota! Todas las depenencias (incluso las dev-dependencies como Webpack) se encuentran debajo de dependencias por una razón. La razón es que este repositorio se usa como dependencia para aplicaciones y las depenencias web-pack inherentes de las mismas automáticamente, en lugar de instalar y configurar sus propias versiones.

# Problemas reportados

Todos los problemas relacionados con Oskari deben ser reportados aquí: https://github.com/oskariorg/oskari-docs/issues

# Contribución

Por favor lee los [contribution guidelines](http://oskari.org/documentation/development/how-to-contribute) antes de enviar solicitudes para contribuir al projecto Oskari.

## Licencia
 
Este trabajo tiene licencia dual por MIT y [EUPL v1.1](https://joinup.ec.europa.eu/software/page/eupl/licence-eupl) 
(cualquier versión de lenguaje aplica, la versión en Inglés se incluye en https://github.com/oskariorg/oskari-docs/blob/master/documents/LICENSE-EUPL.pdf).
Puedes elegir utilizar cualquiera de ellas si lo necesitas.
 
`SPDX-License-Identifier: MIT OR EUPL-1.1`

Copyright (c) 2014-present National Land Survey of Finland