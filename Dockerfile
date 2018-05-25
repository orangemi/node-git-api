FROM docker.io/node:10.2.0-alpine AS node-api-server-builder
LABEL maintainer="Orange Mi<orangemiwj@gmail.com>"
RUN mkdir -p /app
WORKDIR /app
COPY ./build/package* /app/

RUN npm install --production

FROM docker.io/node:10.2.0-alpine
LABEL maintainer="Orange Mi<orangemiwj@gmail.com>"

RUN mkdir -p /app
WORKDIR /app

COPY --from=node-api-server-builder /app/node_modules /app/node_modules
COPY . /app

EXPOSE 3000
CMD [ "npm", "start" ]
