FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the server
RUN npm run build

# Create a non-root user
RUN adduser -D mcpuser && chown -R mcpuser:mcpuser /app
USER mcpuser

# Set environment variables for LinkedIn OAuth
ENV LINKEDIN_CLIENT_ID=""
ENV LINKEDIN_CLIENT_SECRET=""
ENV NODE_ENV=production

# Start the server
CMD ["node", "build/main.js"]