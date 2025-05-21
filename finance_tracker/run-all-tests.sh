#!/bin/bash
# Run all tests for the Finance Tracker application

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to run tests with styled output
run_test() {
  echo -e "${BLUE}Running $1...${NC}"
  $2
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1 completed successfully${NC}"
  else
    echo -e "${RED}✗ $1 failed${NC}"
    FAILED_TESTS="$FAILED_TESTS\n$1"
  fi
  echo ""
}

# Initialize variable to track failed tests
FAILED_TESTS=""

# Set test environment
export NODE_ENV=test

echo -e "${YELLOW}===== FINANCE TRACKER TEST SUITE =====${NC}"
echo "Starting tests at $(date)"
echo ""

# 1. Server unit tests
run_test "Server Unit Tests" "cd server && npm test"

# 2. Server API tests
run_test "Server API Tests" "cd server && npm run test:api"

# 3. Client unit tests
run_test "Client Unit Tests" "cd client && npm test"

# 4. CORS tests
run_test "CORS Tests" "cd server && ./test-cors.sh"

# 5. Plan creation tests
run_test "Plan Creation Tests" "cd server && ./test-plan-creation.sh"

# 6. Plan not found tests
run_test "Plan Not Found Tests" "cd server && ./test-plan-not-found.sh"

# 7. Comprehensive tests
run_test "Comprehensive Tests" "cd server && ./test-comprehensive.sh"

# Results summary
echo -e "${YELLOW}===== TEST RESULTS SUMMARY =====${NC}"
if [ -z "$FAILED_TESTS" ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
else
  echo -e "${RED}The following tests failed:${NC}"
  echo -e "$FAILED_TESTS"
fi

echo ""
echo "Tests completed at $(date)"
