FROM --platform=linux/amd64 node:22-alpine as builder

# Set working directory
WORKDIR /usr/src/app

ENV HOST 0.0.0.0

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and data folder
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:22-alpine

# Set working directory to match the expected path
WORKDIR /usr/src/app

# Copy only necessary files from builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Copy the data folder from builder stage
COPY --from=builder /usr/src/app/data ./dist/data

# Expose the port
EXPOSE 8080

# Start the application with the correct path
CMD ["node", "dist/main.js"]