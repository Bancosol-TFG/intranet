#!/bin/bash
set -e

echo "[dev] Iniciando watcher..."
watchexec \
    --watch src/main/java \
    --watch src/main/resources \
    --exts java,properties,yml,yaml \
    "bash ./mvnw compile" &

WATCHER_PID=$!

echo "[dev] Watcher iniciado $WATCHER_PID"

exec bash ./mvnw spring-boot:run
