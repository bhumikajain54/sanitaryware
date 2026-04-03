# Use an official Maven image to build the Spring Boot app
FROM maven:3.8.4-eclipse-temurin-17 AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Use a lightweight JRE image to run the application
FROM eclipse-temurin:17-jre-alpine

# Set the working directory
WORKDIR /app

# Create the uploads directory and copy existing files
RUN mkdir -p uploads
COPY uploads ./uploads

# Environment variables (to be set in Render or at runtime)
# DATASOURCE_URL
# DATASOURCE_USER
# DATASOURCE_PASSWORD
# FRONTEND_URL

# Copy the built Jar file from the build stage
COPY --from=build /app/target/sanitary-ware-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Specify the command to run the application with dynamic port for Render
# Memory optimization for Render Free Tier (512MB)
# Explicit 0.0.0.0 binding on the provided PORT
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Xms320m -XX:+UseG1GC -Dserver.port=${PORT:-8080} -Dserver.address=0.0.0.0 -jar app.jar"]
