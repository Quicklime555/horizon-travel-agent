# Stage 1: Build the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built frontend from stage 1
COPY --from=builder /app/dist ./dist

# Copy the server source code
COPY --from=builder /app/server ./server
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose the ports
# Frontend usually on 3000 (Vite) but production Express might serve on 3001
EXPOSE 3000
EXPOSE 3001

# Start the server (using tsx to run TypeScript server)
# In a real production setup, you might want to compile to JS first
CMD ["npm", "run", "server"]
