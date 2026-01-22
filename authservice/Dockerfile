# ---- Build stage ----
FROM gradle:7.2-jdk17 AS build

WORKDIR /home/gradle/src

COPY build.gradle.kts .
COPY src ./src

RUN gradle bootJar --no-daemon

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre

WORKDIR /app

EXPOSE 8080

COPY --from=build /home/gradle/src/build/libs/*.jar authservice.jar

CMD ["java", "-jar", "authservice.jar"]
