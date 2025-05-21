#!/bin/bash
# Test script for creating a plan through the API

echo "Testing plan creation API..."

# Plan data in JSON format
plan_data='{
  "name": "Test Plan",
  "description": "Plan created for testing",
  "start_date": "2025-06-01",
  "end_date": "2030-06-01",
  "target_amount": 50000
}'

# Make the API request
echo "Sending request to create a plan..."
curl -v -X POST http://localhost:5001/api/plans \
  -H "Content-Type: application/json" \
  -d "$plan_data"

echo -e "\n\nTest completed!"
