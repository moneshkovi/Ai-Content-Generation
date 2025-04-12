#!/bin/bash

# Start AI Content Generation Platform (Backend + Frontend)

echo "Starting AI Content Generation Platform..."
echo "----------------------------------------"

# Create the storage directory if it doesn't exist
mkdir -p storage/blog storage/social storage/product storage/email storage/ad

# Activate the conda environment if it exists
if command -v conda &> /dev/null; then
    echo "Activating conda environment 'content'..."
    # For script execution, we need to source conda
    source $(conda info --base)/etc/profile.d/conda.sh
    conda activate content
fi

# Start the backend server
echo "Starting Backend (Flask API)..."
cd backend
python app.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
cd ..

# Give the backend a moment to initialize
sleep 2

# Start the frontend server
echo "Starting Frontend (React)..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo "----------------------------------------"
echo "AI Content Generation Platform is running!"
echo "Backend API: http://localhost:5000"
echo "Frontend UI: http://localhost:3000"
echo "----------------------------------------"
echo "Press Ctrl+C to stop the servers"

# Set up cleanup for when the script is terminated
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; echo 'Servers stopped.'; exit 0" INT TERM

# Keep the script running
wait
