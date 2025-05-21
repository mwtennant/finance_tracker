#!/bin/bash
# Comprehensive test script for plan creation and CORS functionality

echo "=== COMPREHENSIVE PLAN CREATION AND CORS TEST ==="
echo "Testing in test mode with NODE_ENV=test"

# Set test environment
export NODE_ENV=test

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Plan data in JSON format
plan_data='{
  "name": "Comprehensive Test Plan",
  "description": "Plan created for comprehensive testing",
  "start_date": "2025-06-01",
  "end_date": "2030-06-01",
  "target_amount": 50000
}'

# 1. Test CORS preflight
echo -e "\n${BLUE}[1] Testing OPTIONS request (CORS preflight)...${NC}"
preflight_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS http://localhost:5002/api/plans \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

if [ "$preflight_response" -eq 200 ]; then
  echo -e "${GREEN}✓ CORS preflight successful (HTTP $preflight_response)${NC}"
else
  echo -e "${RED}✗ CORS preflight failed (HTTP $preflight_response)${NC}"
fi

# 2. Test plan creation with the correct origin
echo -e "\n${BLUE}[2] Testing plan creation with allowed origin...${NC}"
allowed_origin_response=$(curl -s -X POST http://localhost:5002/api/plans \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d "$plan_data")

# Check if response contains success status
if echo "$allowed_origin_response" | grep -q '"status":"success"'; then
  echo -e "${GREEN}✓ Plan creation successful with allowed origin${NC}"
  plan_id=$(echo "$allowed_origin_response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
  echo -e "  Plan created with ID: $plan_id"
else
  echo -e "${RED}✗ Plan creation failed with allowed origin${NC}"
  echo -e "  Response: $allowed_origin_response"
fi

# 3. Test plan creation with disallowed origin
echo -e "\n${BLUE}[3] Testing plan creation with disallowed origin...${NC}"
disallowed_response=$(curl -s -X POST http://localhost:5002/api/plans \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d "$plan_data")

# Check if response contains error related to CORS
if echo "$disallowed_response" | grep -q "error"; then
  echo -e "${GREEN}✓ Server correctly rejected disallowed origin${NC}"
else
  echo -e "${YELLOW}⚠ Server did not reject disallowed origin${NC}"
  echo -e "  Response: $disallowed_response"
fi

# 4. Test retrieving created plan
echo -e "\n${BLUE}[4] Testing plan retrieval...${NC}"
get_response=$(curl -s http://localhost:5002/api/plans)

# Check if response contains the test plan
if echo "$get_response" | grep -q "Comprehensive Test Plan"; then
  echo -e "${GREEN}✓ Plan retrieval successful${NC}"
else
  echo -e "${YELLOW}⚠ Plan not found in retrieval response${NC}"
  echo -e "  This is expected in test mode as data is not persisted"
fi

# 5. Test plan API with validation errors
echo -e "\n${BLUE}[5] Testing plan creation with validation errors...${NC}"
invalid_data='{
  "name": "Invalid Plan",
  "description": "Plan with invalid dates",
  "start_date": "2030-01-01",
  "end_date": "2025-01-01"
}'

validation_response=$(curl -s -X POST http://localhost:5002/api/plans \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d "$invalid_data")

if echo "$validation_response" | grep -q "End date must be after start date"; then
  echo -e "${GREEN}✓ Validation correctly rejected invalid date range${NC}"
else
  echo -e "${RED}✗ Validation failed to catch invalid date range${NC}"
  echo -e "  Response: $validation_response"
fi

echo -e "\n${GREEN}=== TEST COMPLETED ===${NC}"
