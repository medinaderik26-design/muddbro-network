#!/bin/bash
source /app/.agents/.env 2>/dev/null || true
cd /app/ringmine_game
while true; do
    echo "[$(date)] Starting Ring Mine bot..."
    python bot.py
    echo "[$(date)] Bot exited. Restarting in 5s..."
    sleep 5
done
