# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./


# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Copy environment file
COPY .env.example .env

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "run", "dev"]
