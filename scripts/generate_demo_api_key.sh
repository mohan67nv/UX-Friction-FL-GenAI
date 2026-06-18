#!/bin/bash
# Generate API key for demo testing
# Usage: ./scripts/generate_demo_api_key.sh

API_URL="http://localhost:8001"
EMAIL="demo@zerobanner.local"
PASSWORD="DemoPassword123!"

echo "🔑 Generating API key for demo project..."
echo ""

# Step 1: Try to register (will fail if already exists, which is fine)
echo "📝 Step 1: Attempting registration (may already exist)..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"orgName\":\"Demo Org\"}")

# Check if registration succeeded or if user already exists
if echo "$REGISTER_RESPONSE" | grep -q '"access_token"'; then
  echo "✅ Registration successful!"
  TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
elif echo "$REGISTER_RESPONSE" | grep -q "already"; then
  echo "✅ User already exists, logging in..."
  
  # Step 2: Login
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Response:"
    echo "$LOGIN_RESPONSE"
    exit 1
  fi
else
  echo "❌ Registration failed. Response:"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo ""

# Step 3: Get organizations
echo "📝 Step 3: Getting organizations..."
ORGS=$(curl -s -X GET "$API_URL/dashboard/orgs" \
  -H "Authorization: Bearer $TOKEN")

ORG_ID=$(echo $ORGS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ORG_ID" ]; then
  echo "❌ Could not get org ID. Response:"
  echo "$ORGS"
  exit 1
fi

echo "✅ Found organization: $ORG_ID"
echo ""

# Step 4: Get projects
echo "📝 Step 4: Getting projects..."
PROJECTS=$(curl -s -X GET "$API_URL/dashboard/projects" \
  -H "Authorization: Bearer $TOKEN")

PROJECT_ID=$(echo $PROJECTS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ No projects found. Response:"
  echo "$PROJECTS"
  exit 1
fi

echo "✅ Found project: $PROJECT_ID"
echo ""

# Step 5: Create API key
echo "📝 Step 5: Creating API key..."
KEY_RESPONSE=$(curl -s -X POST "$API_URL/dashboard/projects/$PROJECT_ID/api-keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Test Key"}')

API_KEY=$(echo $KEY_RESPONSE | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
  echo "❌ API key creation failed. Response:"
  echo "$KEY_RESPONSE"
  exit 1
fi

echo ""
echo "✅ ✅ ✅ SUCCESS! ✅ ✅ ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Your Demo API Key:"
echo ""
echo "    $API_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Copy the API key above"
echo "2. Open demo/test-page.html"
echo "3. Replace 'pe_demo_key_123' with your actual key"
echo ""
echo "Or run this command to update automatically:"
echo ""
echo "  sed -i \"s/pe_demo_key_123/$API_KEY/\" demo/test-page.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save key to file for easy access
echo "$API_KEY" > .demo_api_key
echo "💾 API key also saved to .demo_api_key"
echo ""
