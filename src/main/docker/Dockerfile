FROM eclipse-temurin:17-jre

# Copy the packaged jar file into our docker image
COPY maven/*.jar /app.jar

RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
RUN chown appuser:appgroup /app.jar
USER appuser

EXPOSE 8080

# Set the startup command to execute the jar
CMD ["java", "-jar", "/app.jar"]
