#!/bin/bash
# Guard: Ensure API origin is present in CSP connect-src and form-action
# Required for contact form functionality

set -euo pipefail

API_ORIGIN="https://vipspot-api-a7ce781e1397.herokuapp.com"
CSP_FILE="index.html"

if [ ! -f "$CSP_FILE" ]; then
    echo "❌ $CSP_FILE not found"
    exit 1
fi

# Extract CSP content between quotes
CSP_CONTENT=$(grep -o 'Content-Security-Policy" content="[^"]*"' "$CSP_FILE" | sed 's/.*content="//;s/".*//')

if [ -z "$CSP_CONTENT" ]; then
    echo "❌ No CSP meta tag found in $CSP_FILE"
    exit 1
fi

# Check connect-src contains API origin
if ! echo "$CSP_CONTENT" | grep -q "connect-src [^;]*$API_ORIGIN"; then
    echo "❌ API origin missing from connect-src directive"
    echo "Expected: $API_ORIGIN in connect-src"
    exit 1
fi

# Check form-action contains API origin  
if ! echo "$CSP_CONTENT" | grep -q "form-action [^;]*$API_ORIGIN"; then
    echo "❌ API origin missing from form-action directive"
    echo "Expected: $API_ORIGIN in form-action"
    exit 1
fi

echo "✅ API origin present in both connect-src and form-action"