# Testing GitHub OAuth Integration for Vibe Insights AI

This document provides a step-by-step guide to test the GitHub OAuth integration in your CLI before publishing to npm.

## Prerequisites

- Your CLI code with GitHub OAuth functionality
- A GitHub account
- A GitHub OAuth App (created in the previous steps)

## Step 1: Set Up Test Environment

1. Create a `.env` file in your project root (make sure it's in `.gitignore` and `.npmignore`):

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

2. Load these environment variables in your development environment:

```bash
source .env  # On Linux/Mac
# Or
set -a; source .env; set +a  # Alternative method
```

On Windows Command Prompt:
```cmd
set GITHUB_CLIENT_ID=your_client_id_here
set GITHUB_CLIENT_SECRET=your_client_secret_here
```

On Windows PowerShell:
```powershell
$env:GITHUB_CLIENT_ID="your_client_id_here"
$env:GITHUB_CLIENT_SECRET="your_client_secret_here"
```

## Step 2: Link Your Package Locally

1. Make your CLI executable:

```bash
chmod +x index.js  # If not already executable
```

2. Create a symbolic link to your package:

```bash
npm link
```

This will install your CLI globally on your local machine, allowing you to run it as if it were installed from npm.

## Step 3: Test Basic GitHub Authentication

1. Run the CLI in interactive mode:

```bash
vibe
```

2. Select GitHub repository analysis when prompted
3. A browser window should open asking you to authorize the GitHub OAuth app
4. After authorization, the CLI should display your list of repositories
5. Select a repository to continue

## Step 4: Test Error Scenarios

### Test Missing Client ID

1. Temporarily unset the Client ID:

```bash
unset GITHUB_CLIENT_ID  # On Linux/Mac
# Or
set GITHUB_CLIENT_ID=  # On Windows CMD
# Or
$env:GITHUB_CLIENT_ID=""  # On Windows PowerShell
```

2. Run the CLI:

```bash
vibe
```

3. Try to select a GitHub repository
4. Verify that you receive a clear error message about the missing Client ID

### Test Missing Client Secret

1. Restore the Client ID and unset the Client Secret:

```bash
export GITHUB_CLIENT_ID=your_client_id_here  # On Linux/Mac
unset GITHUB_CLIENT_SECRET
```

2. Run the CLI:

```bash
vibe
```

3. Try to select a GitHub repository
4. Verify that you receive a clear error message about the missing Client Secret

### Test Invalid Credentials

1. Set invalid credentials:

```bash
export GITHUB_CLIENT_ID=invalid_id
export GITHUB_CLIENT_SECRET=invalid_secret
```

2. Run the CLI:

```bash
vibe
```

3. Try to select a GitHub repository
4. Verify that you receive a clear error message about authentication failure

## Step 5: Test Token Storage and Reuse

1. Reset the correct credentials:

```bash
export GITHUB_CLIENT_ID=your_client_id_here
export GITHUB_CLIENT_SECRET=your_client_secret_here
```

2. Run the CLI and complete GitHub authentication:

```bash
vibe
```

3. Exit the CLI
4. Check that the token is stored:

```bash
ls -la ~/.vibeinsights/
cat ~/.vibeinsights/github-token.json  # Verify token structure but don't share this output
```

5. Run the CLI again:

```bash
vibe
```

6. Verify that you're not prompted to authenticate again (the stored token should be used)

## Step 6: Test Token Logout

1. Run the CLI's logout command:

```bash
vibe logout
```

2. Verify that you receive a confirmation message
3. Check that the token file has been removed:

```bash
ls -la ~/.vibeinsights/  # github-token.json should be gone
```

4. Run the CLI again:

```bash
vibe
```

5. Verify that you're prompted to authenticate again

## Step 7: Test Repository Clone and Analysis

1. Complete authentication
2. Select a repository to analyze
3. Verify that the repository is cloned correctly
4. Try running an analysis command:

```bash
vibe complexity
```

5. Verify that the analysis completes successfully

## Step 8: Testing on Different Operating Systems

If possible, test on:
- macOS
- Linux
- Windows

Watch for platform-specific issues like:
- Path handling differences
- Environment variable persistence
- Browser launch behavior

## Step 9: Final Validation

1. Unlink your package:

```bash
npm unlink
```

2. Install it locally:

```bash
npm install -g .
```

3. Run the full GitHub authentication flow again:

```bash
vibe
```

4. Verify that everything works as expected

## Troubleshooting Tips

### Browser Doesn't Open

Some environments might have issues automatically opening the browser. In this case:

1. Check the CLI output for the authorization URL
2. Manually open the URL in your browser
3. Continue the authentication process

### Port 3000 Already in Use

If port 3000 is already in use:

1. Modify the code to use a different port
2. Update your GitHub OAuth app's callback URL to match
3. Test again

### Token Storage Issues

If token storage is failing:

1. Check file permissions on the ~/.vibeinsights directory
2. Verify the JSON structure being saved
3. Check error handling in the token storage code

## Conclusion

By following these steps, you'll thoroughly test your GitHub OAuth integration before publishing your package. This ensures a smooth experience for your users and helps identify any issues early.