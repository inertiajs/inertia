#!/bin/bash

set -e  # Exit on any error

echo "🚀 Installing Inertia.js dependencies..."

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
echo "   npm install -g pnpm"
echo "   or visit: https://pnpm.io/installation"
    exit 1
fi

echo "📦 Installing root dependencies..."
pnpm install

echo "🔧 Installing package dependencies..."
# Install dependencies for all packages
pnpm -r --filter './packages/*' install

echo "🎮 Installing playground dependencies..."
# Install dependencies for all playgrounds
pnpm -r --filter './playgrounds/*' install

echo "🧪 Installing test dependencies..."
# Install test app dependencies
cd tests/app && pnpm install && cd ../..

echo "📚 Installing package test-app dependencies..."
# Install test-app dependencies for each package
cd packages/react/test-app && pnpm install && cd ../../..
cd packages/svelte/test-app && pnpm install && cd ../../..
cd packages/vue3pp && pnpm install && cd ../../..

echo 🏗️  Building all packages...
pnpm build:all

echo "✅ Installation complete!"
echo "🎯 Available commands:"
echo "  pnpm dev                    - Start development mode for all packages"
echo "  pnpm dev:test-app           - Start test apps for React, Svelte, and Vue"
echo "  pnpm test:react             - Run React tests"
echo "  pnpm test:svelte            - Run Svelte tests"
echo "  pnpm test:vue               - Run Vue tests"
echo "  pnpm playground:react       - Start React playground"
echo "  pnpm playground:svelte4     - Start Svelte 4 playground"
echo "  pnpm playground:svelte5     - Start Svelte 5 playground"
echo "  pnpm playground:vue         - Start Vue playground"
