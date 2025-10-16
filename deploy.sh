#!/bin/bash

echo "🚀 Deploying 3Best Product Importer..."

# Check if Shopify CLI is installed
if ! command -v shopify &> /dev/null; then
    echo "❌ Shopify CLI is not installed. Please install it first:"
    echo "npm install -g @shopify/cli @shopify/theme"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create exports directory
echo "📁 Creating exports directory..."
mkdir -p exports

# Build the app
echo "🔨 Building the app..."
npm run build

# Deploy to Shopify
echo "🚀 Deploying to Shopify..."
npm run deploy

echo "✅ Deployment complete!"
echo "📱 Your app is now available in your Shopify Partner Dashboard"
echo "🔗 Install it on your store to start importing products"
