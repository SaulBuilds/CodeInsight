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
const chalk = require('chalk');
const inquirer = require('inquirer');
const os = require('os');

// GitHub OAuth configuration
const config = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: 'http://localhost:3000/callback',
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  scope: 'repo',
  userAgent: 'VibeInsights-AI-CLI',
};

// Credentials storage path
const CONFIG_DIR = path.join(os.homedir(), '.vibeinsights');
const TOKEN_PATH = path.join(CONFIG_DIR, 'github-token.json');

/**
 * Get stored GitHub token if available
 * @returns {Promise<string|null>} The stored token or null if not found
 */
async function getStoredToken() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      if (data.accessToken && data.expiry > Date.now()) {
        return data.accessToken;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Store GitHub token
 * @param {string} accessToken - The OAuth access token
 * @param {number} expiresIn - Seconds until token expires (or use a default long value if GitHub doesn't provide)
 */
async function storeToken(accessToken, expiresIn = 3600 * 24 * 30) {  // Default 30 days
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  const tokenData = {
    accessToken,
    expiry: Date.now() + (expiresIn * 1000),
  };
  
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData), 'utf8');
}

/**
 * Start local server to receive OAuth callback
 * @returns {Promise<{server: http.Server, codePromise: Promise<string>}>}
 */
function startLocalServer() {
  let codeResolve;
  const codePromise = new Promise((resolve) => {
    codeResolve = resolve;
  });
  
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');
    
    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Authentication Successful</h1>
            <p>You have been authenticated with GitHub. You can close this window and return to the CLI.</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
      codeResolve(code);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Authentication Failed</h1>
            <p>No authorization code received from GitHub. Please try again.</p>
          </body>
        </html>
      `);
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
  const response = await axios.post(
    config.tokenEndpoint,
    {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    },
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': config.userAgent,
      },
    }
  );
  
  return response.data.access_token;
}

/**
 * Authenticate with GitHub
 * @param {boolean} forceAuth - Force re-authentication even if token exists
 * @returns {Promise<string>} The access token
 */
async function authenticate(forceAuth = false) {
  if (!forceAuth) {
    const storedToken = await getStoredToken();
    if (storedToken) {
      return storedToken;
    }
  }
  
  // Verify client credentials are set
  if (!config.clientId || !config.clientSecret) {
    throw new Error(
      'GitHub OAuth credentials not found. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.'
    );
  }
  
  console.log(chalk.blue('Authenticating with GitHub...'));
  
  // Set up authorization URL
  const authUrl = `${config.authorizationEndpoint}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}`;
  
  // Start local server to receive callback
  const { server, codePromise } = startLocalServer();
  
  // Open browser for authorization
  console.log(chalk.blue('Opening browser for GitHub authentication.'));
  await open(authUrl);
  
  // Wait for authorization code
  const code = await codePromise;
  
  // Close server
  server.close();
  
  // Exchange code for token
  console.log(chalk.blue('Exchanging code for token...'));
  const accessToken = await exchangeCodeForToken(code);
  
  // Store token
  await storeToken(accessToken);
  
  console.log(chalk.green('Successfully authenticated with GitHub!'));
  
  return accessToken;
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
    const response = await axios.get(
      `https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          'User-Agent': config.userAgent,
        },
      }
    );
    
    return response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || 'No description',
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      isPrivate: repo.private,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
      stars: repo.stargazers_count,
      language: repo.language || 'Unknown',
      updatedAt: new Date(repo.updated_at).toLocaleDateString(),
    }));
  } catch (error) {
    console.error(chalk.red('Error fetching repositories:'), error.message);
    return [];
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
    const response = await axios.get(
      `https://api.github.com/repos/${repoFullName}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          'User-Agent': config.userAgent,
        },
      }
    );
    
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error(chalk.red(`Error fetching repository contents from ${path}:`), error.message);
    return [];
  }
}

/**
 * Clone a GitHub repository
 * @param {string} cloneUrl - The URL to clone
 * @param {string} targetDir - The target directory
 * @param {string} accessToken - The GitHub access token (for private repos)
 * @returns {Promise<string>} Path to cloned repository
 */
async function cloneRepository(cloneUrl, targetDir, accessToken) {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    // For private repos, we need to include the token in the URL
    const gitUrl = accessToken 
      ? cloneUrl.replace('https://', `https://${accessToken}@`) 
      : cloneUrl;
    
    console.log(chalk.blue(`Cloning repository to ${targetDir}...`));
    
    exec(`git clone ${gitUrl} ${targetDir}`, (error) => {
      if (error) {
        reject(new Error(`Failed to clone repository: ${error.message}`));
      } else {
        resolve(targetDir);
      }
    });
  });
}

/**
 * Interactive repository selection
 * @param {string} accessToken - The GitHub access token
 * @returns {Promise<object>} The selected repository
 */
async function selectRepository(accessToken) {
  try {
    console.log(chalk.blue('Fetching your GitHub repositories...'));
    
    // Fetch first page of repositories
    const repositories = await fetchUserRepositories(accessToken);
    
    if (repositories.length === 0) {
      throw new Error('No repositories found.');
    }
    
    // Ask if user wants to use a public repository by URL instead
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'How would you like to select a repository?',
        choices: [
          { name: 'Select from my GitHub repositories', value: 'my-repos' },
          { name: 'Enter a public repository URL', value: 'public-repo' },
          { name: 'Use a local repository', value: 'local-repo' },
        ],
      },
    ]);
    
    if (choice === 'public-repo') {
      const { repoUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'repoUrl',
          message: 'Enter the GitHub repository URL (e.g., https://github.com/owner/repo):',
          validate: (input) => {
            const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
            return regex.test(input) || 'Please enter a valid GitHub repository URL';
          },
        },
      ]);
      
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
      return {
        fullName: `${match[1]}/${match[2]}`,
        cloneUrl: `https://github.com/${match[1]}/${match[2]}.git`,
        isPrivate: false,
        owner: match[1],
        name: match[2],
      };
    } else if (choice === 'local-repo') {
      const { repoPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'repoPath',
          message: 'Enter the path to your local repository:',
          validate: (input) => {
            return fs.existsSync(input) || 'Directory does not exist';
          },
        },
      ]);
      
      return {
        fullName: 'local',
        path: repoPath,
        isLocal: true,
      };
    } else {
      // Display repositories for selection
      console.log(chalk.green(`Found ${repositories.length} repositories.`));
      
      // Add pagination if there are many repositories
      const PAGE_SIZE = 10;
      let currentPage = 0;
      const totalPages = Math.ceil(repositories.length / PAGE_SIZE);
      
      while (true) {
        const startIndex = currentPage * PAGE_SIZE;
        const endIndex = Math.min(startIndex + PAGE_SIZE, repositories.length);
        const currentRepos = repositories.slice(startIndex, endIndex);
        
        const choices = currentRepos.map(repo => ({
          name: `${repo.fullName} ${repo.isPrivate ? '(Private)' : '(Public)'} - ${repo.language} - Last updated: ${repo.updatedAt}`,
          value: repo,
        }));
        
        if (totalPages > 1) {
          if (currentPage > 0) {
            choices.unshift({ name: '« Previous page', value: 'prev' });
          }
          
          if (currentPage < totalPages - 1) {
            choices.push({ name: 'Next page »', value: 'next' });
          }
        }
        
        const { selected } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selected',
            message: `Select a repository (Page ${currentPage + 1}/${totalPages}):`,
            choices,
            pageSize: 15,
          },
        ]);
        
        if (selected === 'prev') {
          currentPage--;
        } else if (selected === 'next') {
          currentPage++;
        } else {
          return selected;
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Error selecting repository:'), error.message);
    throw error;
  }
}

/**
 * Logout by removing stored GitHub token
 * @returns {Promise<void>}
 */
async function logout() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      console.log(chalk.green('Successfully logged out from GitHub.'));
    } else {
      console.log(chalk.yellow('No active GitHub session found.'));
    }
  } catch (error) {
    console.error(chalk.red('Error during logout:'), error.message);
  }
}

module.exports = {
  authenticate,
  fetchUserRepositories,
  fetchRepositoryContents,
  cloneRepository,
  selectRepository,
  logout,
};