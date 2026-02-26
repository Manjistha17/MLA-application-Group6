# # ---- Build stage ----
FROM gradle:7.2-jdk17 AS build

WORKDIR /home/gradle/src

# Copy only Gradle files first to cache dependencies
COPY build.gradle.kts settings.gradle.kts ./

# Download dependencies only
RUN gradle build --no-daemon -x test || true

# Copy the source code
COPY src ./src

# Build the JAR
RUN gradle bootJar --no-daemon

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre

WORKDIR /app

EXPOSE 8080

COPY --from=build /home/gradle/src/build/libs/*.jar authservice.jar

CMD ["java", "-jar", "authservice.jar"]
