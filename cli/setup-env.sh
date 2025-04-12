#!/bin/bash
# Setup script for VibeInsights AI environment variables

# Default GitHub OAuth credentials
export VIBE_DEFAULT_GITHUB_CLIENT_ID="Iv23ctBemy9jpxD1fPA0"
export VIBE_DEFAULT_GITHUB_CLIENT_SECRET="60c7d756aeb5c92c45626677ffe75feee9eed662"

# Print confirmation (without revealing full secret)
echo "Environment setup complete:"
echo "VIBE_DEFAULT_GITHUB_CLIENT_ID is set to: ${VIBE_DEFAULT_GITHUB_CLIENT_ID}"
echo "VIBE_DEFAULT_GITHUB_CLIENT_SECRET is set (first 5 chars): ${VIBE_DEFAULT_GITHUB_CLIENT_SECRET:0:5}..."

# Execute the command passed as arguments with the environment variables
exec "$@"