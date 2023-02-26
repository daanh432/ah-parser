FROM node:18-alpine as deps

WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm ci --omit=dev

FROM node:18-alpine as compiler
WORKDIR /app
COPY --from=deps /app/node_modules node_modules/
COPY package-lock.json .
COPY package.json .
RUN npm ci
COPY tsconfig.json .
COPY src/ src/
COPY www/ www/
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=deps /app/node_modules node_modules/
COPY --from=compiler /app/dist dist/

CMD ["node","dist/index.js"]
