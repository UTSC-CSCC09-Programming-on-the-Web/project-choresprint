FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build Prisma client & transpile TypeScript
RUN npm run build
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "dist/index.js"]
