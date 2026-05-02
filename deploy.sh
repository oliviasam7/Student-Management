#!/bin/bash

echo "======================================"
echo "  Student Dashboard - Deploy Script"
echo "======================================"

# Step 1: Check SF CLI is installed
if ! command -v sf &> /dev/null; then
    echo "❌ Salesforce CLI not found. Install it first:"
    echo "   npm install -g @salesforce/cli"
    exit 1
fi

echo "✅ Salesforce CLI found"

# Step 2: List authenticated orgs
echo ""
echo "📋 Your authenticated orgs:"
sf org list

# Step 3: Deploy to default org
echo ""
echo "🚀 Deploying to your default org..."
sf project deploy start --source-dir force-app --wait 10

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "  1. Go to your Salesforce org"
    echo "  2. Open App Launcher (9-dot grid)"
    echo "  3. Search for 'Student Dashboard App'"
    echo "  4. Click it to open your dashboard"
else
    echo ""
    echo "❌ Deployment failed. Check errors above."
    echo "   Common fix: sf org login web --alias my-org"
fi
