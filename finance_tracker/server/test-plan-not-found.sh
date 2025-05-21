#!/bin/bash
# Test script for handling non-existent plans

echo "=== TESTING PLAN NOT FOUND HANDLING ==="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Set test environment
export NODE_ENV=test

# Test getting a non-existent plan by ID
echo -e "\n${BLUE}[1] Testing GET request for non-existent plan (ID 999)...${NC}"
response=$(curl -s -w "%{http_code}" -o /dev/stdout http://localhost:5002/api/plans/999)

# Extract status code (last 3 characters) and body (everything else)
status_code=${response: -3}
body=${response:0:${#response}-3}

echo -e "Status code: ${status_code}"
echo -e "Response body: ${body}"

# Check if we got a 404 status code
if [ "$status_code" -eq 404 ]; then
  echo -e "${GREEN}✓ Server correctly returned 404 status code for non-existent plan${NC}"
else
  echo -e "${RED}✗ Expected 404 status code, but got ${status_code} instead${NC}"
fi

# Check if the response message contains appropriate error message
if echo "$body" | grep -q "No plan found with id"; then
  echo -e "${GREEN}✓ Response contains appropriate error message${NC}"
else
  echo -e "${RED}✗ Response does not contain expected error message${NC}"
fi

echo -e "\n${GREEN}=== TEST COMPLETED ===${NC}"
