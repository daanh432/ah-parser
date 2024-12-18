FROM node:22-alpine as deps

WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm ci --omit=dev

# Build backend
FROM node:22-alpine as compiler
WORKDIR /app
COPY --from=deps /app/node_modules node_modules/
COPY package-lock.json .
COPY package.json .
RUN npm ci
COPY tsconfig.json .
COPY src/ src/
RUN npm run build

# Build frontend
FROM node:22-alpine as webcompiler
WORKDIR /app/www
COPY www/package-lock.json .
COPY www/package.json .
RUN npm ci
COPY www/ .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules node_modules/
COPY --from=compiler /app/dist dist/
COPY --from=webcompiler /app/www/dist www/dist/

CMD ["node","dist/index.js"]
