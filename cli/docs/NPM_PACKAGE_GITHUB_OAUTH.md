# Setting Up GitHub OAuth for Your NPM Package

This guide walks you through the process of setting up GitHub OAuth for your Vibe Insights AI CLI tool when you publish it as an npm package.

## Prerequisites

- A GitHub account
- An npm account
- Your CLI project ready for publishing

## Step 1: Create a GitHub OAuth App

1. Go to your GitHub account settings
2. Navigate to **Developer settings** → **OAuth Apps** → **New OAuth App**
3. Fill in the application details:
   - **Application name**: Vibe Insights AI
   - **Homepage URL**: Your npm package page or GitHub repository URL
   - **Application description**: AI-powered repository analysis and documentation generation
   - **Authorization callback URL**: `http://localhost:3000/callback`
4. Click **Register application**
5. Note your **Client ID**
6. Click **Generate a new client secret** and save your **Client Secret**

## Step 2: Decide on an OAuth Strategy for Your Users

When publishing a CLI tool that uses GitHub OAuth, you have several options for how users will authenticate:

### Option 1: Users Create Their Own OAuth Apps (Recommended)

This approach requires users to create their own GitHub OAuth apps and provide their own credentials. This is the most secure and recommended approach for open-source tools.

Add these instructions to your README:

```markdown
## GitHub Authentication Setup

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

### Option 2: Embedded Public Client ID with User-Provided Secret

You could provide a public Client ID but require users to obtain their own Client Secret. This simplifies setup somewhat but still requires user action.

```javascript
// In your src/api/github-auth.js
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'your_public_client_id';
// Users must still provide their secret
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
```

### Option 3: Use a Web Service as Intermediary (Advanced)

For a more seamless experience, you could create a small web service that handles the OAuth flow, but this adds complexity and hosting requirements.

## Step 3: Update Your Code to Support User OAuth Setup

Make sure your code is ready to handle the OAuth configuration from environment variables:

1. Check if the relevant GitHub OAuth environment variables are present
2. Provide clear error messages when they're missing
3. Securely store tokens obtained during authentication

The key code in `src/api/github-auth.js` should look like:

```javascript
// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const REDIRECT_URI = 'http://localhost:3000/callback';

// Authentication function should check for required environment variables
async function authenticate(forceAuth = false) {
  // Check if client ID and secret are configured
  if (!GITHUB_CLIENT_ID) {
    throw new Error(
      'GitHub Client ID not configured. Please set the GITHUB_CLIENT_ID environment variable.\n' +
      'See https://github.com/YourUsername/vibeinsights-ai#github-authentication-setup for instructions.'
    );
  }
  
  if (!GITHUB_CLIENT_SECRET) {
    throw new Error(
      'GitHub Client Secret not configured. Please set the GITHUB_CLIENT_SECRET environment variable.\n' +
      'See https://github.com/YourUsername/vibeinsights-ai#github-authentication-setup for instructions.'
    );
  }
  
  // Rest of authentication logic...
}
```

## Step 4: Prepare for Publishing

1. Update your README with clear setup instructions
2. Add a .npmignore file to exclude sensitive information:

```
# .npmignore
.env
.env.local
.env.development
.env.test
.env.production
```

3. Make sure your package.json is correctly configured:

```json
{
  "name": "vibeinsights-ai",
  "version": "1.0.0",
  "bin": {
    "vibe": "./index.js"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YourUsername/vibeinsights-ai"
  }
}
```

## Step 5: Testing Before Publishing

1. Create a test environment with your OAuth credentials
2. Run `npm link` in your project folder to simulate global installation
3. Test the GitHub authentication flow works correctly
4. Test error scenarios (missing credentials, authentication failures)

## Step 6: Publishing to npm

1. Login to npm: `npm login`
2. Publish your package: `npm publish`
3. Verify installation: `npm install -g vibeinsights-ai`

## Step 7: User Experience Considerations

Consider implementing these enhancements to improve the user experience:

1. Interactive setup: Add a `vibe setup` command that guides users through OAuth setup
2. Credential validation: Check credentials before attempting GitHub operations
3. Detailed error messages: Provide specific guidance when authentication fails
4. Documentation: Create a dedicated page about GitHub integration

## Security Considerations

1. Never include your Client Secret in your npm package
2. Always store tokens securely in the user's home directory
3. Set appropriate token scopes to limit access
4. Include token expiration and refresh logic
5. Handle token revocation appropriately

## Troubleshooting Common Issues

Add a troubleshooting section to help users:

```markdown
### Troubleshooting GitHub Authentication

- **Error: GitHub Client ID not configured**
  Ensure you've set the GITHUB_CLIENT_ID environment variable

- **Error: redirect_uri_mismatch**
  Make sure your GitHub OAuth app's callback URL is exactly: http://localhost:3000/callback

- **Error: token exchange failed**
  Check that your GITHUB_CLIENT_SECRET is correct and hasn't expired
```

By following these steps, your users will be able to set up GitHub OAuth integration with your npm package successfully.