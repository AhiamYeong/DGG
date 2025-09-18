# ---------- build stage ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Gradle 래퍼/설정 먼저 복사(캐시)
COPY gradlew gradlew
COPY gradle  gradle
COPY build.gradle settings.gradle ./

RUN chmod +x gradlew

# 소스 복사 후 빌드
COPY src src
RUN ./gradlew -x test --no-daemon clean bootJar

# ---------- run stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENV JAVA_OPTS=""

# Actuator 건강 체크 사용 시
HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD curl -fsS http://127.0.0.1:8080/actuator/health || curl -fI http://127.0.0.1:8080/ || exit 1

CMD ["sh","-c","java $JAVA_OPTS -jar app.jar"]
