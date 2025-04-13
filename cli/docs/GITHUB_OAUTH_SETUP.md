# GitHub OAuth Setup Guide for VibeInsights AI

This guide explains how VibeInsights AI uses GitHub OAuth for authentication and the options available to you.

## Default Authentication

VibeInsights AI can use pre-configured GitHub OAuth credentials from environment variables that allow you to authenticate without creating your own GitHub OAuth application. When you run commands that require GitHub access (like `vibe list-repos` or `vibe analyze`), the tool will attempt to use these credentials.

### Setting up Default Credentials

To use the default authentication method, the following environment variables must be set:

```bash
# For developers of VibeInsights:
export VIBE_DEFAULT_GITHUB_CLIENT_ID="your_default_client_id"
export VIBE_DEFAULT_GITHUB_CLIENT_SECRET="your_default_client_secret"
```

These credentials will be used by default when users run the CLI without specifying custom credentials.

For detailed instructions on setting up these environment variables, see [Setting Up Environment Variables](./SETUP_ENV.md).

## Authentication Flow Options

The CLI supports two authentication flows:

### 1. Local Server (Default)

By default, the CLI starts a temporary local server on port 3000 to receive the OAuth callback. This is the simplest approach for most users as it happens automatically.

When you authenticate:
1. The CLI opens your browser to GitHub's authorization page
2. GitHub redirects back to `http://localhost:3000/callback` after you authorize
3. The local server receives the authorization code and completes the authentication

### 2. Web Redirect

For cases where the local server approach doesn't work (like certain CI/CD environments or systems with firewall restrictions), you can use the web redirect flow:

```bash
vibe login --web-redirect
```

This will:
1. Open your browser to GitHub's authorization page
2. GitHub redirects to the VibeInsights website (https://vibeinsights.xyz/callback)
3. The website displays the authorization code
4. You copy this code and paste it back into the CLI prompt

## Using Your Own OAuth Application

If you prefer to use your own GitHub OAuth App instead of the built-in credentials:

1. Create a GitHub OAuth application at https://github.com/settings/developers
2. Set the Authorization callback URL to `http://localhost:3000/callback`
3. Note your Client ID and Client Secret
4. Set environment variables before running the CLI:

```bash
export GITHUB_CLIENT_ID=your_client_id
export GITHUB_CLIENT_SECRET=your_client_secret
vibe login --use-custom-app
```

## Advanced Configuration

If you're creating a custom integration, you'll need to:

1. Create a GitHub OAuth App
2. Set the callback URL to one of these options:
   - `http://localhost:3000/callback` - For local server authentication
   - `https://vibeinsights.xyz/callback` - For web redirect authentication

## Troubleshooting

If you encounter issues with GitHub authentication:

1. **Token Storage**: Tokens are securely stored in `~/.vibeinsights/github-token.json`
2. **Clear Tokens**: Run `vibe logout` to remove stored tokens
3. **Force Re-authentication**: Use `vibe login --force` to bypass cached tokens
4. **Access Scopes**: VibeInsights requires the `repo` and `read:user` scopes

For additional assistance, please open an issue on our GitHub repository at https://github.com/SaulBuilds/vibeinsights.