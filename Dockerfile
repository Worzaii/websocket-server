# First, we make a staging image that will build npm
FROM node:22-trixie-slim AS build
WORKDIR /app
# Install dependencies first so this layer is cached until package*.json changes.
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
# And we are done, the project is built into /app/dist

#Make a new image, which we will copy over the built app into
FROM node:22-trixie-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Get dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Copy over the stuff we built in the first image.
COPY --from=build /app/dist ./dist
# Make a user, expose the correct port, and make a healthcheck.

RUN chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["npm", "start"]
