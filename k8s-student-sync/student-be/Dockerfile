FROM eclipse-temurin:21 AS builder

WORKDIR /app

COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src

RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ADD https://repo1.maven.org/maven2/co/elastic/apm/elastic-apm-agent/1.56.0/elastic-apm-agent-1.56.0.jar elastic-apm-agent.jar

COPY --from=builder /app/target/student-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# ── Elastic APM Configuration ─────────────────────────────
# Update ELASTIC_APM_SERVER_URL to point to your APM server
ENV ELASTIC_APM_SERVER_URL=http://apm-server:8200
ENV ELASTIC_APM_SERVICE_NAME=student-backend
ENV ELASTIC_APM_APPLICATION_PACKAGES=studentdot.student
ENV ELASTIC_APM_ENVIRONMENT=production
ENV ELASTIC_APM_SECRET_TOKEN=647761aa4c3e992bd1c38cc1f274f3104bb9572d

CMD ["java", "-javaagent:/app/elastic-apm-agent.jar", "-jar", "app.jar"]
