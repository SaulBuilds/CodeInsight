/**
 * Vibe Insights AI - Constants
 * 
 * This file contains constants used throughout the application
 */

const path = require('path');
const os = require('os');

// User home directory for config/data storage
const USER_HOME = os.homedir();
const DATA_DIR = path.join(USER_HOME, '.vibeinsights');
const REPO_DIR = path.join(DATA_DIR, 'repositories');
const DOCS_DIR = path.join(DATA_DIR, 'documents');
const TEMP_DIR = path.join(DATA_DIR, 'temp');

// Config constants
const CLI_NAME = 'vibe';
const CLI_DESCRIPTION = 'AI-powered repository analysis & documentation generation';
const CLI_VERSION = '1.0.0';

// OpenAI Constants
const OPENAI_MODEL = 'gpt-4o'; // Latest model as of May 2024

// GitHub OAuth Constants
// Use environment variables for default OAuth credentials
// Set VIBE_DEFAULT_GITHUB_CLIENT_ID and VIBE_DEFAULT_GITHUB_CLIENT_SECRET in production
const DEFAULT_GITHUB_CLIENT_ID = process.env.VIBE_DEFAULT_GITHUB_CLIENT_ID || ''; 
const DEFAULT_GITHUB_CLIENT_SECRET = process.env.VIBE_DEFAULT_GITHUB_CLIENT_SECRET || '';
const REDIRECT_URI_PROD = 'https://vibeinsights.xyz/callback';
const REDIRECT_URI_DEV = 'https://54a5e666-dc40-4c6d-863f-d863a4bc27ae-00-1peum3pg6g6r3.kirk.replit.dev/callback';

// Export constants
module.exports = {
  USER_HOME,
  DATA_DIR,
  REPO_DIR,
  DOCS_DIR,
  TEMP_DIR,
  CLI_NAME,
  CLI_DESCRIPTION,
  CLI_VERSION,
  OPENAI_MODEL,
  DEFAULT_GITHUB_CLIENT_ID,
  DEFAULT_GITHUB_CLIENT_SECRET,
  REDIRECT_URI_PROD,
  REDIRECT_URI_DEV
};