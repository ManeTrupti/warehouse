# Use an official Nginx runtime as a base image
FROM nginx:latest

# Remove the default Nginx configuration file
RUN rm -rf /etc/nginx/conf.d/default.conf

# Set the working directory to /usr/share/nginx/html/app
WORKDIR /usr/share/nginx/html/app

# Copy the contents of the dist directory into the working directory
COPY dist/ .

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80 to the outside world
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]