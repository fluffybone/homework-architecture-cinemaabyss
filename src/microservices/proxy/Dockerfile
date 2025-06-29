# FROM node:24-alpine AS builder

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 8000

# CMD ["npm", "run", "start"]

# Базовый образ
FROM node:20 as builder

# Рабочая директория
WORKDIR /usr/src/app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники и собираем
COPY . .
RUN npm run build

# Финальный образ
FROM node:20-alpine

WORKDIR /usr/src/app

# Копируем только нужное из builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --only=production

# Запуск приложения
CMD ["npm", "start"]