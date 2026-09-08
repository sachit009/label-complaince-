#!/bin/bash
# Instant Public HTTPS Tunnel for LM Scan
# Runs on any network, 4G/5G, giving a free global URL & QR code for mobile devices.

echo "=========================================================="
echo "🌐 Starting Instant Public HTTPS Tunnel for LM Scan..."
echo "=========================================================="
echo "Connecting to localhost:8080..."
echo ""

# Try pinggy first, fallback to localhost.run
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 a.pinggy.io 2>/dev/null || \
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 nokey@localhost.run
