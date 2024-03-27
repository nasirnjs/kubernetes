# Use OpenJDK as the base image for building
FROM openjdk:17 AS builder

# Set working directory
WORKDIR /app

# Copy Maven Wrapper
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Copy Maven project files
COPY pom.xml .

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN ./mvnw package -DskipTests

# Use OpenJDK as the base image for running the application
FROM openjdk:17

# Set working directory
WORKDIR /app

# Copy the built JAR file from the previous stage
COPY --from=builder /app/target/student-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the Spring Boot application
CMD ["java", "-jar", "app.jar"]

