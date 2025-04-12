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
  OPENAI_MODEL
};