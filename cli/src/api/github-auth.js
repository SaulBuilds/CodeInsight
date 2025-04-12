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
const { DATA_DIR } = require('../utils/constants');

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = 'repo,read:user';

// Token storage path
const TOKEN_PATH = path.join(DATA_DIR, 'github-token.json');

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
 * @returns {Promise<string>} The access token
 */
async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
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
 * @param {boolean} forceAuth - Force re-authentication even if token exists
 * @returns {Promise<string>} The access token
 */
async function authenticate(forceAuth = false) {
  // Check if client ID is configured
  if (!GITHUB_CLIENT_ID) {
    throw new Error('GitHub Client ID not configured. Please set the GITHUB_CLIENT_ID environment variable.');
  }
  
  if (!forceAuth) {
    // Check for stored token
    const storedToken = await getStoredToken();
    if (storedToken) {
      return storedToken;
    }
  }
  
  console.log('Authenticating with GitHub...');
  
  // Start local server to receive callback
  const { server, codePromise } = startLocalServer();
  
  try {
    // Construct authorization URL
    const authUrl = `${GITHUB_AUTH_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    
    // Open browser for authentication
    console.log(chalk.cyan(`Opening browser for GitHub authentication...`));
    await open(authUrl);
    
    // Wait for authorization code
    const code = await codePromise;
    
    // Exchange code for token
    const spinner = ora('Exchanging code for token...').start();
    const accessToken = await exchangeCodeForToken(code);
    spinner.succeed('Successfully authenticated with GitHub');
    
    // Store token
    await storeToken(accessToken);
    
    return accessToken;
  } catch (error) {
    throw error;
  } finally {
    // Close server
    server.close();
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
  logout
};