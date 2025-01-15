# שלב ראשון: בניית הפרונטאנד
FROM node:18 AS build-frontend

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm install
RUN npm run build

# שלב שני: הגדרת הבקאנד
FROM node:18 AS backend

WORKDIR /app

COPY package.json package-lock.json ./
COPY server.ts ./
COPY database.sqlite ./database.sqlite

RUN npm install

COPY --from=build-frontend /app/build ./public

EXPOSE 5000

# Expose the application port
EXPOSE 3000

CMD ["npm", "start"]
