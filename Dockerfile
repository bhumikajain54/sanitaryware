# Root Dockerfile to build and run the Sanitary Ware Backend
# This file is placed in the root to ensure Render can automatically detect it.

# Stage 1: Build stage
FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy pom.xml and resolve dependencies (using Backend as context)
COPY Backend/pom.xml ./Backend/
RUN mvn -f Backend/pom.xml dependency:go-offline

# 2. Copy source code and build
COPY Backend/src ./Backend/src
RUN mvn -f Backend/pom.xml clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create necessary directories
RUN mkdir -p uploads

# Copy build artifacts and uploads
# Note: This assumes you want to include existing uploads in the image.
# If uploads should be persistent, use a Render disk instead.
COPY Backend/uploads ./uploads
COPY --from=build /app/Backend/target/*.jar app.jar

# Environment Variables Configuration
# These can be overridden in the Render Dashboard
ENV PORT=8080

# Expose the application port
EXPOSE 8080

# Specify performance optimizations for Render Free Tier (512MB RAM)
# Bind to 0.0.0.0 to ensure accessibility
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Xms384m -Dserver.port=${PORT:-8080} -Daddress=0.0.0.0 -jar app.jar"]
