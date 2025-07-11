#!/bin/bash

# City Information Service - Environment Setup Script
# This script helps you set up your environment variables

set -e  # Exit on any error

echo "🚀 City Information Service - Environment Setup"
echo "================================================="
echo ""

# Check if .env.sample exists
if [[ ! -f ".env.sample" ]]; then
    echo "❌ Error: .env.sample file not found!"
    echo "   Make sure you're running this script from the city-info-agents directory."
    exit 1
fi

# Check if .env already exists
if [[ -f ".env" ]]; then
    echo "⚠️  Warning: .env file already exists!"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Your existing .env file was not modified."
        exit 0
    fi
    echo ""
fi

# Copy .env.sample to .env
echo "📋 Copying .env.sample to .env..."
cp .env.sample .env
echo "✅ Environment file created successfully!"
echo ""

echo "🔑 API Keys Setup Required:"
echo "============================"
echo ""
echo "1. 🆓 Groq API Key (REQUIRED - FREE!)"
echo "   • Visit: https://console.groq.com/keys"
echo "   • Sign up for a free account"
echo "   • Create an API key"
echo "   • Replace 'your_groq_api_key' in .env"
echo ""
echo "2. 🌍 GeoNames Username (OPTIONAL)"
echo "   • Visit: https://www.geonames.org/login"
echo "   • Create a free account"
echo "   • Enable web services in account settings"
echo "   • Replace 'your_geonames_username' in .env"
echo ""

echo "📝 Next Steps:"
echo "==============="
echo "1. Edit the .env file with your API keys:"
echo "   nano .env  (or use your preferred editor)"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Test the system:"
echo "   npm test"
echo ""

echo "✨ Setup complete! Happy coding! 🎉" 