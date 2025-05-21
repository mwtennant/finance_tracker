#!/bin/zsh

echo "Restarting Finance Tracker application..."

# Find and kill existing client and server processes
echo "Stopping any running processes..."

# Kill any processes running on ports 3001 (client) and 5002 (server)
CLIENT_PID=$(lsof -ti:3001)
SERVER_PID=$(lsof -ti:5002)

if [ ! -z "$CLIENT_PID" ]; then
  echo "Stopping client process (PID: $CLIENT_PID)..."
  kill -9 $CLIENT_PID
fi

if [ ! -z "$SERVER_PID" ]; then
  echo "Stopping server process (PID: $SERVER_PID)..."
  kill -9 $SERVER_PID
fi

# Wait a moment to ensure processes are fully stopped
sleep 1

# Start both client and server in development mode
echo "Starting client and server..."
npm run dev

echo "Finance Tracker application has been restarted!"
