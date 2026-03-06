# # ---- Build Stage ----
# FROM gradle:7.2-jdk17 AS build

# # Set working directory
# WORKDIR /home/gradle/src

# # Copy only Gradle wrapper and configuration files first to cache dependencies
# COPY gradlew gradlew
# COPY gradle/ gradle/
# COPY build.gradle.kts settings.gradle.kts ./

# # Ensure wrapper is executable
# RUN chmod +x gradlew

# # Download dependencies only (no compilation yet) to leverage Docker cache
# RUN ./gradlew build -x test --no-daemon || true

# # Copy source code
# COPY src ./src

# # Build the JAR
# RUN ./gradlew bootJar --no-daemon --parallel

# # ---- Runtime Stage ----
# FROM eclipse-temurin:17-jre

# # Set working directory
# WORKDIR /app

# # Expose port used by Spring Boot
# EXPOSE 8080

# # Copy the built JAR from the build stage
# COPY --from=build /home/gradle/src/build/libs/*.jar authservice.jar

# # Run the service
# CMD ["java", "-jar", "authservice.jar"]
FROM eclipse-temurin:17-jre
WORKDIR /app
EXPOSE 8080
COPY mla-0.0.1-SNAPSHOT.jar authservice.jar
CMD ["java", "-jar", "authservice.jar"]