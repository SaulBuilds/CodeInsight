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
  
  // For non-custom app, first try to load saved credentials
  if (!useCustomApp && (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET)) {
    // Try to load saved credentials
    const savedCredentials = loadSavedCredentials();
    
    if (savedCredentials && savedCredentials.type === 'oauth') {
      // Use saved credentials
      process.env.GITHUB_CLIENT_ID = savedCredentials.github_client_id;
      process.env.GITHUB_CLIENT_SECRET = savedCredentials.github_client_secret;
      
      // Update variables for current session
      GITHUB_CLIENT_ID = savedCredentials.github_client_id;
      GITHUB_CLIENT_SECRET = savedCredentials.github_client_secret;
      
      console.log(chalk.green('✅ Using saved GitHub OAuth credentials'));
    } else {
      // No saved credentials, guide the user through setup
      console.log(chalk.yellow('\n⚠️ GitHub authentication required'));
      
      // Check for stored token first - if it exists, verify it still works
      const storedToken = await getStoredToken();
      if (storedToken && !forceAuth) {
        try {
          // Verify token is still valid
          const spinner = ora('Verifying existing GitHub token...').start();
          await axios.get(`${GITHUB_API_URL}/user`, {
            headers: {
              Authorization: `token ${storedToken}`
            }
          });
          spinner.succeed('Existing GitHub token is valid');
          return storedToken;
        } catch (error) {
          // Token is invalid, continue with setup
          console.log(chalk.yellow('⚠️ Existing GitHub token is invalid or expired. Please authenticate again.'));
        }
      }
      
      // Prompt the user for what they want to do
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'How would you like to connect to GitHub?',
          choices: [
            { 
              name: `${chalk.green('✓')} Personal Access Token (recommended, quick 1-minute setup)`, 
              value: 'personal' 
            },
            { 
              name: 'Local-only mode (no GitHub, analyze directories on your machine)',
              value: 'local' 
            },
            { 
              name: 'OAuth App (advanced, requires GitHub developer settings)',
              value: 'oauth' 
            },
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
            message: 'Would you like to save these credentials for future use?',
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
        console.log(chalk.cyan('\n📂 Continuing in local-only mode'));
        console.log(chalk.yellow('In this mode, you can analyze local directories on your machine.'));
        console.log(chalk.yellow('GitHub-specific features like repository listing and cloning will be unavailable.'));
        console.log(chalk.gray('Run "vibeinsights login" at any time to set up GitHub integration.\n'));
        return null;
      }
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
 * @param {string|null} accessToken - The GitHub access token (null for local-only mode)
 * @returns {Promise<object>} The selected repository
 */
async function selectRepository(accessToken) {
  try {
    // Define choices based on whether we have a GitHub token
    let choices = [];
    
    if (accessToken) {
      // Start spinner for GitHub repositories fetching
      const spinner = ora('Fetching your GitHub repositories...').start();
      
      try {
        // Fetch user repositories
        const repositories = await fetchUserRepositories(accessToken);
        spinner.succeed(`Found ${repositories.length} GitHub repositories`);
        
        // Add GitHub repositories option if we have any
        if (repositories.length > 0) {
          choices.push({ name: `GitHub Repositories (${repositories.length} found)`, value: 'github' });
        } else {
          console.log(chalk.yellow('No repositories found in your GitHub account.'));
        }
      } catch (error) {
        spinner.fail(`Error fetching GitHub repositories: ${error.message}`);
        console.log(chalk.yellow('Continuing with local directory option only.'));
      }
    }
    
    // Always add local directory option
    choices.push({ name: 'Local Directory', value: 'local' });
    
    // If there are no GitHub repositories or no token, skip source selection
    let source = 'local';
    if (choices.length > 1) {
      // Prompt user to select a source
      const response = await inquirer.prompt([
        {
          type: 'list',
          name: 'source',
          message: 'Select repository source:',
          choices: choices,
        },
      ]);
      source = response.source;
    }
    
    if (source === 'github') {
      // Spinner for detailed repository listing
      const spinner = ora('Loading repository details...').start();
      
      // Fetch repositories again (we know this will succeed because we already checked)
      const repositories = await fetchUserRepositories(accessToken);
      spinner.succeed('Repository details loaded');
      
      // Prompt user to select a repository
      const { repoIndex } = await inquirer.prompt([
        {
          type: 'list',
          name: 'repoIndex',
          message: 'Select a GitHub repository:',
          choices: repositories.map((repo, index) => ({
            name: `${repo.fullName} ${repo.isPrivate ? '(Private)' : ''}`,
            value: index,
          })),
          pageSize: 10, // Show 10 repositories at a time for better navigation
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
          default: process.cwd(), // Default to current directory
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
    throw new Error(`Error selecting repository: ${error.message}`);
  }
}

/**
 * Save OAuth credentials to a file for later use
 * @param {string} clientId - GitHub OAuth client ID
 * @param {string} clientSecret - GitHub OAuth client secret
 */
function saveOAuthCredentials(clientId, clientSecret) {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(path.dirname(CREDENTIALS_PATH))) {
      fs.mkdirSync(path.dirname(CREDENTIALS_PATH), { recursive: true });
    }
    
    // Save credentials with some minimal security (JSON format allows for future extensibility)
    fs.writeFileSync(
      CREDENTIALS_PATH, 
      JSON.stringify({
        type: 'oauth',
        github_client_id: clientId,
        github_client_secret: clientSecret,
        created_at: new Date().toISOString()
      }, null, 2),
      { mode: 0o600 } // Set file to be readable/writeable only by the user
    );
  } catch (error) {
    console.error('Error saving OAuth credentials:', error.message);
    throw new Error('Failed to save credentials');
  }
}

/**
 * Load saved credentials if available
 * @returns {Object|null} The credentials or null if not found
 */
function loadSavedCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return null;
  }
  
  try {
    const credentialsData = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    return credentialsData;
  } catch (error) {
    console.error('Error reading credentials:', error.message);
    return null;
  }
}

/**
 * Authenticate with GitHub using a Personal Access Token
 * @returns {Promise<string>} The access token
 */
async function authenticateWithPersonalToken() {
  console.log(chalk.cyan('\n📝 Setting up GitHub Personal Access Token:'));
  console.log(chalk.yellow('📌 Simplified Authentication Instructions:'));
  console.log('1. Go to https://github.com/settings/tokens');
  console.log('2. Click "Generate new token" then "Generate new token (classic)"');
  console.log('3. Give your token a descriptive name like "Vibe Insights AI"');
  console.log('4. Set expiration to match your needs (90 days recommended)');
  console.log('5. Select the following scopes:');
  console.log(`   ${chalk.green('✓')} repo (Access to private repositories)`);
  console.log(`   ${chalk.green('✓')} read:user (Read access to user information)`);
  console.log('6. Click "Generate token" and copy your new token');
  console.log(chalk.gray('   Note: You won\'t be able to see the token again after leaving the page\n'));
  
  // Ask if they need more help
  const { needsHelp } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'needsHelp',
      message: 'Do you need more detailed instructions?',
      default: false
    }
  ]);
  
  if (needsHelp) {
    // Display detailed instructions with screenshots (in text form)
    console.log(chalk.cyan('\n📋 Detailed Instructions:'));
    console.log('1. Navigate to https://github.com/settings/tokens in your browser');
    console.log('2. Find the "Generate new token" button at the top right and click it');
    console.log('3. Select "Generate new token (classic)" from the dropdown');
    console.log('4. Under "Note", enter "Vibe Insights AI" or another memorable name');
    console.log('5. For "Expiration", choose a duration that meets your needs');
    console.log('6. Under "Select scopes", check the following boxes:');
    console.log('   - The entire "repo" section (for access to your repositories)');
    console.log('   - Under "user", check "read:user" (to read user profile data)');
    console.log('7. Scroll down and click the green "Generate token" button');
    console.log('8. The token will appear as a long string of letters and numbers');
    console.log('9. Copy this token immediately - it will only be shown once!\n');
  }
  
  // Prompt for the token
  const { token, saveTokenPermanently } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Enter your GitHub Personal Access Token:',
      validate: (input) => input.trim() ? true : 'Token is required'
    },
    {
      type: 'confirm',
      name: 'saveTokenPermanently',
      message: 'Save this token for future sessions?',
      default: true
    }
  ]);
  
  const accessToken = token.trim();
  
  // Verify the token works by making a simple API call
  const spinner = ora('Verifying token with GitHub...').start();
  try {
    const response = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
    
    // Get the username for nicer messaging
    const username = response.data.login;
    spinner.succeed(`Successfully authenticated as ${chalk.green(username)}`);
    
    // Store the token if requested
    if (saveTokenPermanently) {
      await storeToken(accessToken);
      console.log(chalk.green('✅ Token saved securely for future sessions'));
      console.log(chalk.gray(`   Stored in ${TOKEN_PATH}`));
    } else {
      console.log(chalk.yellow('⚠️ Token not saved - you will need to enter it again next time'));
    }
    
    return accessToken;
  } catch (error) {
    spinner.fail('Failed to verify GitHub token');
    
    // Provide helpful error messaging
    if (error.response && error.response.status === 401) {
      console.log(chalk.red('Error: Invalid or expired token. Please generate a new token.'));
    } else {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    
    throw new Error(`GitHub authentication failed: ${error.message}`);
  }
}

/**
 * Logout by removing stored GitHub token and credentials
 * @returns {Promise<void>}
 */
async function logout() {
  let loggedOut = false;
  
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
    loggedOut = true;
  }
  
  if (fs.existsSync(CREDENTIALS_PATH)) {
    fs.unlinkSync(CREDENTIALS_PATH);
    loggedOut = true;
  }
  
  if (loggedOut) {
    console.log(chalk.green('Successfully logged out from GitHub.'));
  } else {
    console.log(chalk.yellow('No active GitHub session found.'));
  }
}

module.exports = {
  authenticate,
  authenticateWithPersonalToken,
  fetchUserRepositories,
  fetchRepositoryContents,
  cloneRepository,
  selectRepository,
  logout,
  saveOAuthCredentials,
  loadSavedCredentials,
  // Export constants for advanced usage
  GITHUB_AUTH_URL,
  GITHUB_TOKEN_URL,
  GITHUB_API_URL,
  SCOPES,
  WEB_REDIRECT_URI,
  LOCAL_REDIRECT_URI
};