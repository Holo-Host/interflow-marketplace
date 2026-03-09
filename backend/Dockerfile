# Use Node 20 (Stable) instead of the cutting-edge v25
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Install EVERY system dependency Medusa might need for native builds
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libvips-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Use --legacy-peer-deps to ignore the "unmet peer dependency" warnings 
# that we saw in your previous Buildpack logs
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 9000

# Start command
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start --port $PORT"]
