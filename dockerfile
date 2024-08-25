# Use the official Node.js image.
FROM node:22

# Create and set the working directory.
WORKDIR /app

# Copy the package.json and install dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of the application code.
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
