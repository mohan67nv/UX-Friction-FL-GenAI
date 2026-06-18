#!/bin/bash
# Serve demo files for local testing
# Usage: ./scripts/serve_demo.sh

DEMO_DIR="/home/mnvgowda/MNVProjects/UX-Friction-FL-GenAI/demo"

echo "🌐 Starting HTTP server for demo files..."
echo "📂 Serving from: $DEMO_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Available demos:"
echo ""
echo "  • Real SDK Integration:"
echo "    http://localhost:8080/test-page-real-sdk.html"
echo ""
echo "  • Simulated Version:"
echo "    http://localhost:8080/test-page.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔒 CORS Note: SDK loads from http://localhost:8001/static/client.js"
echo "✅ API is running on http://localhost:8001"
echo "✅ Dashboard is running on http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$DEMO_DIR" && python3 -m http.server 8080
