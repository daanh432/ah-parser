FROM node:16 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run tsc

WORKDIR /app/www

RUN npm run build

FROM node:16 AS runtime

WORKDIR /app

COPY --from=build /app/dist ./
COPY --from=build /app/wwww/dist ./www/

EXPOSE 3000

CMD [ "node", "dist/index.js" ]