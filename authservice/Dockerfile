
FROM gradle:7.6.0-jdk17 AS build
WORKDIR /home/gradle/src
COPY build.gradle.kts .
COPY src ./src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre
EXPOSE 8080
COPY --from=build /home/gradle/src/build/libs/*.jar /app/authservice.jar
CMD ["java", "-jar", "/app/authservice.jar"]
