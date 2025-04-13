# Setting Up Environment Variables for VibeInsights AI

This guide explains how to set up the necessary environment variables for developing and running VibeInsights AI.

## GitHub OAuth Environment Variables

### For VibeInsights Developers (Default OAuth App)

If you are a core developer of VibeInsights AI and need to set up the default OAuth credentials, create a file named `.env.local` in your development environment with the following content:

```bash
# Default GitHub OAuth credentials (for built-in authentication)
export VIBE_DEFAULT_GITHUB_CLIENT_ID="Iv23ctBemy9jpxD1fPA0"
export VIBE_DEFAULT_GITHUB_CLIENT_SECRET="60c7d756aeb5c92c45626677ffe75feee9eed662"
```

Then source this file before running or developing the CLI:

```bash
source .env.local
```

### For End Users (Custom OAuth App)

If you are an end user who wants to use your own GitHub OAuth app instead of the default one:

1. Create a GitHub OAuth application at https://github.com/settings/developers
2. Set the following callback URLs:
   - `http://localhost:3000/callback` (for local server flow)
   - `https://vibeinsights.xyz/callback` (for web redirect flow)
3. Set environment variables:

```bash
export GITHUB_CLIENT_ID="your_client_id"
export GITHUB_CLIENT_SECRET="your_client_secret"
```

4. Use the `--use-custom-app` flag when logging in:

```bash
vibe login --use-custom-app
```

## OpenAI API Key

To use the documentation generation features, you'll need an OpenAI API key:

```bash
export OPENAI_API_KEY="your_openai_api_key"
```

## Production Deployment

In production environments, make sure to set these environment variables securely according to your hosting platform's recommendations for managing secrets.

## Verifying Environment Variables

You can verify that your environment variables are set correctly by running:

```bash
echo "VIBE_DEFAULT_GITHUB_CLIENT_ID: ${VIBE_DEFAULT_GITHUB_CLIENT_ID:0:5}... (truncated)"
echo "VIBE_DEFAULT_GITHUB_CLIENT_SECRET: ${VIBE_DEFAULT_GITHUB_CLIENT_SECRET:0:5}... (truncated)"
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:5}... (truncated)" 
```

This will show the first 5 characters of each secret to confirm they're set without revealing the full values.