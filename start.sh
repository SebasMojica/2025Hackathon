#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting Railway deployment..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --production=false

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm ci

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Build backend
echo "🏗️  Building backend..."
cd ../backend
npm run build

# Return to project root
cd ..

# Ensure directories exist
mkdir -p backend/uploads
mkdir -p backend/dataset

# Start the server from project root (server expects process.cwd() to be project root)
echo "✅ Starting server..."
node backend/dist/server.js

