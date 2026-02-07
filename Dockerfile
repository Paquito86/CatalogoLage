# Build stage
FROM node:22-slim AS build
WORKDIR /app
COPY react-app/package*.json ./
RUN npm ci
COPY react-app/ .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-slim AS production
ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
