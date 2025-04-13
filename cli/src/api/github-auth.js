/**
 * Vibe Insights AI - GitHub Authentication
 * 
 * This file contains utilities for authenticating with GitHub OAuth
 * and interacting with the GitHub API.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const open = require('open');
const axios = require('axios');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const simpleGit = require('simple-git');
const { 
  DATA_DIR,
  DEFAULT_GITHUB_CLIENT_ID,
  DEFAULT_GITHUB_CLIENT_SECRET,
  REDIRECT_URI_PROD,
  REDIRECT_URI_DEV
} = require('../utils/constants');

// GitHub OAuth configuration
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';
const SCOPES = 'repo,read:user';

// Determine if we're in development or production mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Get client ID and secret, preferring environment variables if set
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || DEFAULT_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || DEFAULT_GITHUB_CLIENT_SECRET;

// Use appropriate redirect URI based on environment
const WEB_REDIRECT_URI = isDevelopment ? REDIRECT_URI_DEV : REDIRECT_URI_PROD;
const LOCAL_REDIRECT_URI = 'http://localhost:3000/callback';

// Token storage path
const TOKEN_PATH = path.join(DATA_DIR, 'github-token.json');
const CREDENTIALS_PATH = path.join(DATA_DIR, 'credentials.json');

/**
 * Get stored GitHub token if available
 * @returns {Promise<string|null>} The stored token or null if not found
 */
async function getStoredToken() {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }
  
  try {
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    
    // Check if token is expired
    if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
      console.log(chalk.yellow('GitHub token has expired. Please authenticate again.'));
      return null;
    }
    
    return tokenData.accessToken;
  } catch (error) {
    console.error('Error reading token:', error.message);
    return null;
  }
}

/**
 * Store GitHub token
 * @param {string} accessToken - The OAuth access token
 * @param {number} expiresIn - Seconds until token expires (or use a default long value if GitHub doesn't provide)
 */
async function storeToken(accessToken, expiresIn = 3600 * 24 * 30) {  // Default 30 days
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  
  const tokenData = {
    accessToken,
    expiresAt
  };
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(path.dirname(TOKEN_PATH))) {
      fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    }
    
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
  } catch (error) {
    console.error('Error storing token:', error.message);
  }
}

/**
 * Start local server to receive OAuth callback
 * @returns {Promise<{server: http.Server, codePromise: Promise<string>}>}
 */
function startLocalServer() {
  let codeResolve;
  let codeReject;
  
  const codePromise = new Promise((resolve, reject) => {
    codeResolve = resolve;
    codeReject = reject;
  });
  
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Successful</h1>
              <p>You have successfully authenticated with GitHub. You can close this window and return to the CLI.</p>
              <script>window.close();</script>
            </body>
          </html>
        `);
        
        codeResolve(code);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Failed</h1>
              <p>Error: ${error || 'Unknown error'}</p>
              <p>Please try again.</p>
              <script>window.close();</script>
            </body>
          </html>
        `);
        
        codeReject(new Error(`GitHub authentication failed: ${error || 'Unknown error'}`));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  server.listen(3000);
  
  return { server, codePromise };
}

/**
 * Exchange authorization code for access token
 * @param {string} code - The authorization code
 * @param {string} redirectUri - The redirect URI used in the authorization request
 * @returns {Promise<string>} The access token
 */
async function exchangeCodeForToken(code, redirectUri) {
  try {
    const response = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    
    if (response.data.error) {
      throw new Error(response.data.error_description || response.data.error);
    }
    
    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to exchange code for token: ${error.message}`);
  }
}

/**
 * Authenticate with GitHub
 * @param {Object} options - Authentication options
 * @param {boolean} options.forceAuth - Force re-authentication even if token exists
 * @param {boolean} options.useWebRedirect - Whether to use the web redirect instead of local server
 * @param {boolean} options.useCustomApp - Whether to use custom GitHub app credentials instead of defaults
 * @returns {Promise<string>} The access token
 */
async function authenticate(options = {}) {
  const { forceAuth = false, useWebRedirect = false, useCustomApp = false } = options;
  
  // Check if client ID and secret are configured
  if (useCustomApp && !process.env.GITHUB_CLIENT_ID) {
    throw new Error(
      'Custom GitHub Client ID not configured. Please set the GITHUB_CLIENT_ID environment variable.\n' +
      'See the documentation for setting up GitHub OAuth.'
    );
  }
  
  if (useCustomApp && !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(
      'Custom GitHub Client Secret not configured. Please set the GITHUB_CLIENT_SECRET environment variable.\n' +
      'See the documentation for setting up GitHub OAuth.'
    );
  }
  
  // For non-custom app, check if credentials exist or guide the user
  if (!useCustomApp && (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET)) {
    console.log(chalk.yellow('\n⚠️ GitHub OAuth credentials not found'));
    
    // Prompt the user for what they want to do
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: 'Setup personal GitHub access (recommended for most users)', value: 'personal' },
          { name: 'Use your own GitHub OAuth app', value: 'oauth' },
          { name: 'Continue in local-only mode (limited functionality)', value: 'local' },
        ]
      }
    ]);
    
    if (action === 'personal') {
      // Use the Personal Access Token flow instead of OAuth
      return await authenticateWithPersonalToken();
    } else if (action === 'oauth') {
      // Guide them through setting up their own OAuth app
      console.log(chalk.cyan('\n📝 Setting up your own GitHub OAuth App:'));
      console.log('1. Go to https://github.com/settings/developers');
      console.log('2. Click "New OAuth App"');
      console.log('3. Fill in the application details:');
      console.log('   - Application name: VibeInsights AI (or any name you prefer)');
      console.log('   - Homepage URL: https://github.com/YourUsername/vibeinsights');
      console.log('   - Authorization callback URL: http://localhost:3000/callback');
      console.log('4. Click "Register application"');
      console.log('5. On the next page, copy your Client ID');
      console.log('6. Click "Generate a new client secret" and copy the value\n');
      
      // Prompt for credentials
      const { clientId, clientSecret } = await inquirer.prompt([
        {
          type: 'input',
          name: 'clientId',
          message: 'Enter your GitHub OAuth Client ID:',
          validate: (input) => input.trim() ? true : 'Client ID is required'
        },
        {
          type: 'password',
          name: 'clientSecret',
          message: 'Enter your GitHub OAuth Client Secret:',
          validate: (input) => input.trim() ? true : 'Client Secret is required'
        }
      ]);
      
      // Set these for the current session
      process.env.GITHUB_CLIENT_ID = clientId.trim();
      process.env.GITHUB_CLIENT_SECRET = clientSecret.trim();
      
      // Ask if they want to save these credentials for future use
      const { saveCredentials } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'saveCredentials',
          message: 'Would you like to save these credentials for future use? (stored in ~/.vibeinsights/credentials.json)',
          default: true
        }
      ]);
      
      if (saveCredentials) {
        // Save credentials to a secured file
        saveOAuthCredentials(clientId.trim(), clientSecret.trim());
        console.log(chalk.green('Credentials saved successfully!'));
      }
      
      // Update variables for current session
      GITHUB_CLIENT_ID = clientId.trim();
      GITHUB_CLIENT_SECRET = clientSecret.trim();
    } else {
      // Return null to indicate local-only mode
      console.log(chalk.cyan('\nContinuing in local-only mode. Some GitHub features will be unavailable.'));
      console.log('Run "vibe login" at any time to set up GitHub integration.\n');
      return null;
    }
  }
  
  if (!forceAuth) {
    // Check for stored token
    const storedToken = await getStoredToken();
    if (storedToken) {
      return storedToken;
    }
  }
  
  console.log('Authenticating with GitHub...');
  
  // Use the appropriate redirect URI based on the option
  const redirectUri = useWebRedirect ? WEB_REDIRECT_URI : LOCAL_REDIRECT_URI;
  
  try {
    let code;
    
    // Construct authorization URL
    const authUrl = `${GITHUB_AUTH_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}`;
    
    if (useWebRedirect) {
      // For web redirect, just open the browser and prompt the user to paste the code
      console.log(chalk.cyan(`Opening browser for GitHub authentication...`));
      await open(authUrl);
      
      console.log(chalk.yellow(`\nOnce you've authorized the application, you'll be redirected to ${WEB_REDIRECT_URI}`));
      console.log(chalk.yellow(`You'll see a code in the URL after '?code='. Please copy and paste that code below.`));
      
      const { authCode } = await inquirer.prompt([
        {
          type: 'input',
          name: 'authCode',
          message: 'Authorization code:',
          validate: (input) => input.trim() ? true : 'Please enter the authorization code',
        },
      ]);
      
      code = authCode.trim();
    } else {
      // For local redirect, start a server and wait for the callback
      const { server, codePromise } = startLocalServer();
      
      try {
        // Open browser for authentication
        console.log(chalk.cyan(`Opening browser for GitHub authentication...`));
        await open(authUrl);
        
        // Wait for authorization code
        code = await codePromise;
      } finally {
        // Close server
        server.close();
      }
    }
    
    // Exchange code for token
    const spinner = ora('Exchanging code for token...').start();
    const accessToken = await exchangeCodeForToken(code, redirectUri);
    spinner.succeed('Successfully authenticated with GitHub');
    
    // Store token
    await storeToken(accessToken);
    
    return accessToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch user repositories from GitHub
 * @param {string} accessToken - The GitHub access token
 * @param {number} page - The page of repositories to fetch
 * @param {number} perPage - The number of repositories per page
 * @returns {Promise<Array>} List of repositories
 */
async function fetchUserRepositories(accessToken, page = 1, perPage = 100) {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/user/repos`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
      params: {
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
      },
    });
    
    return response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      isPrivate: repo.private,
      cloneUrl: repo.clone_url,
      updatedAt: repo.updated_at,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
}

/**
 * Fetch repository contents from GitHub
 * @param {string} accessToken - The GitHub access token
 * @param {string} repoFullName - The full name of the repository (owner/repo)
 * @param {string} path - The path to fetch
 * @returns {Promise<Array>} List of contents
 */
async function fetchRepositoryContents(accessToken, repoFullName, path = '') {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${repoFullName}/contents/${path}`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repository contents: ${error.message}`);
  }
}

/**
 * Clone a GitHub repository
 * @param {string} cloneUrl - The URL to clone
 * @param {string} targetDir - The target directory
 * @param {string} accessToken - The GitHub access token (for private repos)
 * @returns {Promise<string>} Path to cloned repository
 */
async function cloneRepository(cloneUrl, targetDir, accessToken = null) {
  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Clone repository
    if (accessToken) {
      // For private repositories, include token in URL
      const urlWithToken = cloneUrl.replace('https://', `https://${accessToken}@`);
      await simpleGit().clone(urlWithToken, targetDir);
    } else {
      await simpleGit().clone(cloneUrl, targetDir);
    }
    
    // Remove .git directory to avoid token exposure and reduce size
    const gitDir = path.join(targetDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }
    
    return targetDir;
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

/**
 * Interactive repository selection
 * @param {string} accessToken - The GitHub access token
 * @returns {Promise<object>} The selected repository
 */
async function selectRepository(accessToken) {
  const spinner = ora('Fetching your repositories...').start();
  
  try {
    // Fetch user repositories
    const repositories = await fetchUserRepositories(accessToken);
    spinner.succeed(`Found ${repositories.length} repositories`);
    
    // Prompt user to select a source
    const { source } = await inquirer.prompt([
      {
        type: 'list',
        name: 'source',
        message: 'Select repository source:',
        choices: [
          { name: 'GitHub Repositories', value: 'github' },
          { name: 'Local Directory', value: 'local' },
        ],
      },
    ]);
    
    if (source === 'github') {
      // Prompt user to select a repository
      const { repoIndex } = await inquirer.prompt([
        {
          type: 'list',
          name: 'repoIndex',
          message: 'Select a repository:',
          choices: repositories.map((repo, index) => ({
            name: `${repo.fullName} ${repo.isPrivate ? '(Private)' : ''}`,
            value: index,
          })),
        },
      ]);
      
      return {
        ...repositories[repoIndex],
        isLocal: false,
      };
    } else {
      // Prompt user to enter a local directory path
      const { directory } = await inquirer.prompt([
        {
          type: 'input',
          name: 'directory',
          message: 'Enter local directory path:',
          validate: (input) => {
            if (!input) return 'Directory path is required';
            if (!fs.existsSync(input)) return 'Directory does not exist';
            if (!fs.statSync(input).isDirectory()) return 'Path is not a directory';
            return true;
          },
        },
      ]);
      
      return {
        name: path.basename(directory),
        path: directory,
        isLocal: true,
      };
    }
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

/**
 * Logout by removing stored GitHub token
 * @returns {Promise<void>}
 */
async function logout() {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
    console.log(chalk.green('Successfully logged out from GitHub.'));
  } else {
    console.log(chalk.yellow('No active GitHub session found.'));
  }
}

module.exports = {
  authenticate,
  fetchUserRepositories,
  fetchRepositoryContents,
  cloneRepository,
  selectRepository,
  logout,
  // Export constants for advanced usage
  GITHUB_AUTH_URL,
  GITHUB_TOKEN_URL,
  GITHUB_API_URL,
  SCOPES,
  WEB_REDIRECT_URI,
  LOCAL_REDIRECT_URI
};