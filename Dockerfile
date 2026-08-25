FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build \
    && npm prune --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node public ./public
COPY --chown=node:node src/database/objects ./src/database/objects

RUN mkdir -p tmp/exports \
    && chown -R node:node tmp

USER node

EXPOSE 5001

CMD ["node", "dist/index.js"]
