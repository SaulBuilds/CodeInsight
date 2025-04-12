#!/usr/bin/env node

/**
 * Vibe Insights AI
 * A sophisticated AI-powered CLI tool that transforms repository analysis 
 * and documentation generation for researchers and developers
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { marked } = require('marked');
const TerminalRenderer = require('marked-terminal');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import constants & utilities
const { 
  CLI_NAME, 
  CLI_DESCRIPTION, 
  CLI_VERSION,
  DATA_DIR, 
  REPO_DIR, 
  DOCS_DIR, 
  TEMP_DIR 
} = require('./utils/constants');
const { displayHeader, displayInlineHeader, handleError } = require('./utils/display');

// Import commands
const {
  // Authentication commands
  login,
  logout,
  
  // Repository and document commands
  getRepositoryCode,
  viewDocument,
  interactiveGitHub,
  executeCommandsOnRepo,
  extractCodeInteractive,
  generateDocsInteractive,
  complexityInteractive,
  dependenciesInteractive,
  searchInteractive,
  detectStackInteractive
} = require('./commands');

// Configure marked with terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer(),
});

// Create data directories if they don't exist
[DATA_DIR, REPO_DIR, DOCS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define CLI program
program
  .name(CLI_NAME)
  .description(CLI_DESCRIPTION)
  .version(CLI_VERSION);

// Interactive mode (default)
program
  .command('interactive')
  .description('Interactive mode to select and analyze repositories')
  .action(async () => {
    try {
      await interactiveGitHub();
    } catch (error) {
      handleError(error, 'Error in interactive mode');
    }
  });

// Extract code from repository
program
  .command('extract')
  .description('Extract code from a repository for analysis')
  .argument('<directory>', 'Directory to extract code from')
  .option('-o, --output <file>', 'Output file name')
  .option('-x, --exclude <patterns>', 'Comma-separated patterns to exclude', 'node_modules,.git,dist,build')
  .option('-s, --max-size <bytes>', 'Maximum file size in bytes to include')
  .action(async (directory, options) => {
    try {
      displayInlineHeader();
      
      const exclude = options.exclude.split(',').map(p => p.trim());
      const maxSize = options.maxSize ? parseInt(options.maxSize) : null;
      
      await extractRepositoryCode({
        directory,
        output: options.output,
        exclude,
        maxSize,
      });
    } catch (error) {
      handleError(error, 'Error extracting code');
    }
  });

// Generate documentation
program
  .command('generate-docs')
  .description('Generate documentation from repository code using OpenAI')
  .argument('<repository_id>', 'Repository ID or local directory path')
  .option('--type <type>', 'Type of documentation to generate (architecture, user_stories, code_story, custom)', 'architecture')
  .option('--complexity <level>', 'Complexity level for code stories (simple, moderate, detailed)', 'moderate')
  .option('--prompt <text>', 'Custom prompt for documentation generation')
  .option('--api-key <key>', 'OpenAI API key (will use OPENAI_API_KEY environment variable if not provided)')
  .action(async (repoIdOrPath, options) => {
    try {
      displayInlineHeader();
      
      let repoPath;
      
      // Check if it's a directory path or repository ID
      if (fs.existsSync(repoIdOrPath) && fs.statSync(repoIdOrPath).isDirectory()) {
        repoPath = repoIdOrPath;
      } else {
        repoPath = path.join(REPO_DIR, repoIdOrPath);
        
        if (!fs.existsSync(repoPath)) {
          throw new Error(`Repository with ID ${repoIdOrPath} not found`);
        }
      }
      
      // Call appropriate function based on options
      switch (options.type) {
        case 'architecture':
          await generateDocsInteractive(repoPath);
          break;
        case 'user_stories':
          await generateDocsInteractive(repoPath);
          break;
        case 'code_story':
          await generateDocsInteractive(repoPath);
          break;
        case 'custom':
          if (!options.prompt) {
            throw new Error('Custom prompt is required when using type=custom');
          }
          await generateDocsInteractive(repoPath);
          break;
        default:
          throw new Error(`Unsupported documentation type: ${options.type}`);
      }
    } catch (error) {
      handleError(error, 'Error generating documentation');
    }
  });

// List repositories
program
  .command('list-repos')
  .description('List all analyzed repositories')
  .action(() => {
    try {
      displayInlineHeader();
      
      const repos = fs.readdirSync(REPO_DIR);
      
      if (repos.length === 0) {
        console.log('No repositories found. Use the analyze command first.');
        return;
      }
      
      console.log('Analyzed repositories:');
      repos.forEach((repo, index) => {
        console.log(`[${index + 1}] ${repo}`);
      });
    } catch (error) {
      handleError(error, 'Error listing repositories');
    }
  });

// List documents
program
  .command('list-docs')
  .description('List all documents generated for a repository')
  .argument('[repository_id]', 'Repository ID (optional, lists all docs if not provided)')
  .action((repoId) => {
    try {
      displayInlineHeader();
      
      const docs = fs.readdirSync(DOCS_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
      
      if (docs.length === 0) {
        console.log('No documents found. Use the generate-docs command first.');
        return;
      }
      
      // Filter by repository if specified
      const filteredDocs = repoId 
        ? docs.filter(doc => doc.includes(repoId)) 
        : docs;
      
      if (filteredDocs.length === 0) {
        console.log(`No documents found for repository ${repoId}.`);
        return;
      }
      
      console.log('Generated documents:');
      filteredDocs.forEach((doc, index) => {
        console.log(`[${index + 1}] ${doc}`);
      });
    } catch (error) {
      handleError(error, 'Error listing documents');
    }
  });

// View document
program
  .command('view-doc')
  .description('View a document')
  .argument('<document_id>', 'Document ID')
  .option('--format <format>', 'Output format: "terminal" or "raw"', 'terminal')
  .action(async (docId, options) => {
    try {
      displayInlineHeader();
      await viewDocument(docId, options.format);
    } catch (error) {
      handleError(error, 'Error viewing document');
    }
  });

// Analyze code complexity
program
  .command('complexity')
  .description('Analyze code complexity metrics')
  .argument('<directory>', 'Directory to analyze')
  .option('--output <format>', 'Output format (json, html, or csv)', 'json')
  .option('--threshold <value>', 'Complexity threshold for highlighting', '15')
  .option('--language <lang>', 'Filter by programming language')
  .option('--filter <pattern>', 'Pattern to filter files (glob syntax)')
  .option('--exclude <pattern>', 'Pattern to exclude files (glob syntax)')
  .option('--details', 'Show detailed breakdown by function/method', false)
  .action(async (directory, options) => {
    try {
      displayInlineHeader();
      
      await complexityInteractive(directory);
    } catch (error) {
      handleError(error, 'Error analyzing complexity');
    }
  });

// Analyze dependencies
program
  .command('analyze-deps')
  .description('Analyze dependencies between files in a codebase')
  .argument('<directory>', 'Directory to analyze')
  .option('--output <format>', 'Output format (dot, json, or html)', 'dot')
  .option('--depth <value>', 'Maximum depth for dependency analysis', '10')
  .option('--filter <pattern>', 'Pattern to filter files (glob syntax)')
  .option('--exclude <pattern>', 'Pattern to exclude files (glob syntax)')
  .option('--highlight-circular', 'Highlight circular dependencies', true)
  .option('--show-external', 'Include external dependencies', false)
  .action(async (directory, options) => {
    try {
      displayInlineHeader();
      
      await dependenciesInteractive(directory);
    } catch (error) {
      handleError(error, 'Error analyzing dependencies');
    }
  });

// Search codebase
program
  .command('search')
  .description('Search for code patterns or concepts in a repository')
  .argument('<directory>', 'Directory to search')
  .option('--query <text>', 'Search query')
  .option('--limit <count>', 'Maximum number of results', '10')
  .option('--context <lines>', 'Lines of context to show', '3')
  .option('--api-key <key>', 'OpenAI API key for semantic search')
  .option('--use-embeddings', 'Use semantic search with embeddings', false)
  .action(async (directory, options) => {
    try {
      displayInlineHeader();
      
      await searchInteractive(directory);
    } catch (error) {
      handleError(error, 'Error searching codebase');
    }
  });

// Detect tech stack
program
  .command('detect-stack')
  .description('Detect technology stack used in a repository')
  .argument('<directory>', 'Directory to analyze')
  .option('--output <format>', 'Output format (text, json, or md)', 'text')
  .option('--scan-deps', 'Perform deep dependency scanning', false)
  .option('--check-outdated', 'Check for outdated dependencies', false)
  .action(async (directory, options) => {
    try {
      displayInlineHeader();
      
      await detectStackInteractive(directory);
    } catch (error) {
      handleError(error, 'Error detecting tech stack');
    }
  });

// GitHub login
program
  .command('login')
  .description('Login to GitHub')
  .option('--force', 'Force re-authentication even if token exists', false)
  .option('--web-redirect', 'Use web redirect instead of local server', false)
  .option('--use-custom-app', 'Use custom GitHub app credentials from environment variables', false)
  .action(async (options) => {
    try {
      displayInlineHeader();
      
      const { authenticate } = require('./api/github-auth');
      await authenticate(options);
      
      console.log(chalk.green('Successfully logged in to GitHub!'));
    } catch (error) {
      handleError(error, 'Error logging in');
    }
  });

// GitHub logout
program
  .command('logout')
  .description('Logout from GitHub')
  .action(async () => {
    try {
      displayInlineHeader();
      
      const { logout } = require('./api/github-auth');
      await logout();
    } catch (error) {
      handleError(error, 'Error logging out');
    }
  });

// Default command is interactive mode
program.addHelpText('afterAll', `
Run without arguments for interactive mode.

Examples:
  $ ${CLI_NAME}                              # Run in interactive mode
  $ ${CLI_NAME} login                        # Login to GitHub with default settings
  $ ${CLI_NAME} login --web-redirect         # Login to GitHub using web redirect
  $ ${CLI_NAME} login --use-custom-app       # Login using custom GitHub OAuth app
  $ ${CLI_NAME} extract ./my-project         # Extract code from a repository
  $ ${CLI_NAME} generate-docs repo_id        # Generate documentation
  $ ${CLI_NAME} complexity ./my-project      # Analyze code complexity
  $ ${CLI_NAME} search ./my-project          # Search codebase interactively
`);

// Parse arguments
program.parse();

// If no command is specified, run interactive mode
if (!process.argv.slice(2).length) {
  interactiveGitHub().catch(error => {
    handleError(error, 'Error in interactive mode');
  });
}