# Stage 1: Build the application
FROM node:alpine as build

# Set working directory for the build stage
WORKDIR /usr/src/app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM nginx:alpine

# Copy built files from the build stage
COPY --from=build /usr/src/app/dist/student-fontend /usr/share/nginx/html

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Command to run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
