# Setting up GitHub OAuth for Vibe Insights AI

This guide walks through the process of setting up GitHub OAuth for your Vibe Insights AI CLI, allowing users to authenticate with GitHub and access repositories.

## 1. Create a GitHub OAuth App

First, you need to register a new OAuth application on GitHub:

1. Go to your GitHub account settings
2. Navigate to **Developer settings** → **OAuth Apps** → **New OAuth App**
3. Fill in the application details:
   - **Application name**: Vibe Insights AI
   - **Homepage URL**: Your project website or GitHub repository URL
   - **Application description**: Optional description of your tool
   - **Authorization callback URL**: `http://localhost:3000/callback`
4. Click **Register application**
5. Note your **Client ID**
6. Click **Generate a new client secret** and save your **Client Secret**

> **IMPORTANT**: The callback URL must be exactly `http://localhost:3000/callback` as this matches the local server the CLI starts during authentication.

## 2. Set Environment Variables

You have two options for providing these credentials to your CLI:

### Option 1: Environment Variables in Development

When developing locally, use environment variables:

```bash
export GITHUB_CLIENT_ID=your_client_id
export GITHUB_CLIENT_SECRET=your_client_secret
```

### Option 2: Configuration for Published Package

For users of your published package, provide instructions to set these environment variables before using the GitHub integration features.

## 3. Configuration in the Code

The relevant code that uses these environment variables is in `src/api/github-auth.js`:

```javascript
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const REDIRECT_URI = 'http://localhost:3000/callback';
```

These variables are already set up to use the environment variables you defined.

## 4. Testing the OAuth Flow

To test the OAuth flow:

1. Set the environment variables with your GitHub OAuth app credentials
2. Run a command that requires GitHub access, such as:
   ```bash
   vibe interactive
   ```
   Then select "GitHub Repositories" when prompted for a source
3. The CLI should open your browser and redirect to GitHub for authentication
4. After authentication, GitHub will redirect back to your local server
5. The CLI should then display your repositories

## 5. Publishing Your Package with OAuth Support

When publishing your package to npm, you should:

1. Document the GitHub OAuth requirements in your README
2. Instruct users that they'll need to create their own GitHub OAuth app for GitHub integration
3. Provide detailed setup instructions for setting environment variables

### Sample user instructions:

```markdown
## GitHub Integration Setup

To use GitHub integration features:

1. Create a GitHub OAuth app at https://github.com/settings/developers
2. Set the callback URL to: http://localhost:3000/callback
3. Set these environment variables:
   ```
   export GITHUB_CLIENT_ID=your_client_id
   export GITHUB_CLIENT_SECRET=your_client_secret
   ```
4. Now you can use all GitHub-related features of the CLI
```

## 6. Security Considerations

- **Never** commit your actual Client Secret to version control
- **Never** hardcode these values in your published package
- Use environment variables or a secure configuration mechanism
- When storing the user's OAuth token, the CLI saves it in the user's home directory with appropriate permissions
- The token includes an expiration time and is refreshed when needed

## 7. Advanced Configuration

For advanced scenarios, you might want to make these values configurable:

1. Add CLI options to specify alternative client IDs and secrets
2. Support multiple GitHub instances (like GitHub Enterprise)
3. Allow custom callback URLs and ports

These can be implemented by extending the current configuration system.