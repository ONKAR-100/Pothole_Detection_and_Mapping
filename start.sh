#!/bin/bash
echo ""
echo " ================================================="
echo "  PotholeWatch v3 - Starting Both Servers"
echo " ================================================="
echo ""

echo " Starting Flask backend on port 8000..."
cd backend && python main.py &
BACKEND_PID=$!
echo " Backend PID: $BACKEND_PID"

sleep 3

echo " Starting React frontend on port 5173..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo " ================================================="
echo "  PotholeWatch is running!"
echo ""
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000"
echo "  Health   : http://localhost:8000/health"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo " ================================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
