FROM node:20-alpine
WORKDIR /app

# 1. Dependency files first: reinstall only when the lock file changes
COPY package.json package-lock.json ./
# Tests run inside the container, so devDependencies (jest, supertest) are installed too
RUN npm ci

# 2. Source, database scripts and tests
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds
COPY scripts ./scripts
COPY tests ./tests

# 3. Do not run as root
USER node
EXPOSE 3000

# Create tables and load sample data (safe to repeat), then start the API
CMD ["sh", "-c", "npm run db:setup && node src/server.js"]