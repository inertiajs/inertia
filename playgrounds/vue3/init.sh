#!/bin/bash
set -e

# Install PHP dependencies via Composer
if [ ! -d "vendor" ]; then
    echo "Installing PHP dependencies..."
    composer install
else
    echo "PHP dependencies already installed"
fi

# Install Node.js dependencies via pnpm
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    pnpm install
else
    echo "Node.js dependencies already installed"
fi

# Set up environment configuration
if [ ! -f ".env" ]; then
    echo "Creating environment configuration..."
    cp .env.example .env
    php artisan key:generate
else
    echo "Environment configuration already exists"
fi

# Set up SQLite database
if [ ! -f "database/database.sqlite" ]; then
    echo "Creating SQLite database..."
    touch database/database.sqlite
    echo "Running fresh migrations with seed data..."
    php artisan migrate:fresh --seed
else
    echo "Database already exists"
fi

# Ensure database is up to date
echo "Running any pending migrations..."
php artisan migrate
