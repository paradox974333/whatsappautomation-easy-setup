FROM node:20-slim

# Install Chromium dependencies for headless browser execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (both prod and dev dependencies are needed for compilation)
RUN npm ci

# Copy code configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Editable AI persona (rebrand the assistant by editing prompt/persona.md)
COPY prompt/ ./prompt/

# Transpile TypeScript to JavaScript
RUN npm run build

# Remove development dependencies to keep image size clean
RUN npm prune --production

ENV NODE_ENV=production

# Expose HTTP API Port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
