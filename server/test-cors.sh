#!/bin/bash
# Test script for creating a plan through the API

echo "Testing plan creation API with CORS headers..."

# Plan data in JSON format
plan_data='{
  "name": "Test Plan",
  "description": "Plan created for testing with CORS checks",
  "start_date": "2025-06-01",
  "end_date": "2030-06-01",
  "target_amount": 50000
}'

# Test the OPTIONS request first to check CORS preflight
echo -e "\n[1] Testing OPTIONS request (CORS preflight)..."
curl -v -X OPTIONS http://localhost:5002/api/plans \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

echo -e "\n\n[2] Testing actual plan creation..."
# Make the API request with origin header to test CORS
curl -v -X POST http://localhost:5002/api/plans \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d "$plan_data"

echo -e "\n\nTest completed!"
