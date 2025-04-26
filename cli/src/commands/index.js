/**
 * Vibe Insights AI - Commands
 * 
 * This file contains the implementation of CLI commands
 */

const fs = require('fs');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { marked } = require('marked');

// Import utilities
const { displayHeader, displayInlineHeader, formatBytes, formatDate, handleError } = require('../utils/display');
const { extractRepositoryCode } = require('../utils/file');
const constants = require('../utils/constants');

// Import APIs
const { 
  validateApiKey, 
  getOpenAIKey, 
  generateArchitecturalDoc, 
  generateUserStories, 
  generateCustomAnalysis, 
  generateCodeStory 
} = require('../api/openai-utils');

const { 
  authenticate, 
  fetchUserRepositories, 
  cloneRepository, 
  selectRepository, 
  logout 
} = require('../api/github-auth');

// Import analyzers
const { analyzeComplexity } = require('../analyzers/complexity-analyzer');
const { analyzeDependencies } = require('../analyzers/dep-analyzer');
const { searchCodebase, formatSearchResults } = require('../analyzers/search');
const { detectTechStack } = require('../analyzers/tech-detector');

// Constants
const { REPO_DIR, DOCS_DIR } = constants;

/**
 * Get repository code from stored repository
 * @param {string} repositoryId - The repository ID
 * @returns {Promise<string>} The repository code
 */
async function getRepositoryCode(repositoryId) {
  try {
    const repoPath = path.join(REPO_DIR, repositoryId);
    
    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository with ID ${repositoryId} not found`);
    }
    
    return await extractRepositoryCode({ directory: repoPath });
  } catch (error) {
    handleError(error, 'Error getting repository code');
  }
}

/**
 * View a document
 * @param {string} documentId - The document ID
 * @param {string} format - The format to display ('terminal' or 'raw')
 */
async function viewDocument(documentId, format = 'terminal') {
  try {
    const docPath = path.join(DOCS_DIR, `${documentId}.md`);
    
    if (!fs.existsSync(docPath)) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    const content = fs.readFileSync(docPath, 'utf8');
    
    if (format === 'terminal') {
      console.log(marked(content));
    } else if (format === 'raw') {
      console.log(content);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    handleError(error, 'Error viewing document');
  }
}

/**
 * Interactive process for working with GitHub repositories or local directories
 */
async function interactiveGitHub() {
  displayHeader();
  
  try {
    // First, ask if the user wants to use GitHub or local mode
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'How would you like to use Vibe Insights AI?',
        choices: [
          { name: 'Connect to GitHub (recommended for full features)', value: 'github' },
          { name: 'Local mode only (analyze directories on your machine)', value: 'local' }
        ]
      }
    ]);
    
    let accessToken = null;
    
    // Only authenticate with GitHub if the user chose that mode
    if (mode === 'github') {
      console.log(chalk.cyan('\n🔄 Setting up GitHub connection...'));
      accessToken = await authenticate();
    } else {
      console.log(chalk.cyan('\n📂 Running in local-only mode. GitHub features will not be available.'));
    }
    
    // Select repository (handles both GitHub repos and local directories)
    const selectedRepo = await selectRepository(accessToken);
    
    // Ask for commands to run on the selected repository/directory
    await executeCommandsOnRepo(selectedRepo, accessToken);
  } catch (error) {
    handleError(error, 'Error in interactive mode');
  }
}

/**
 * Execute commands on a selected repository
 * @param {Object} repository - The repository object
 * @param {string} accessToken - The GitHub access token
 */
async function executeCommandsOnRepo(repository, accessToken) {
  let repoPath;
  let repoId;
  
  // Clone the repository if it's not local
  if (repository.isLocal) {
    repoPath = repository.path;
    repoId = path.basename(repoPath);
    console.log(chalk.green(`Using local repository at ${repoPath}`));
  } else {
    // Create a unique directory name
    repoId = `${repository.owner}_${repository.name}_${Date.now()}`;
    repoPath = path.join(REPO_DIR, repoId);
    
    // Clone the repository
    try {
      const spinner = ora(`Cloning ${repository.fullName}...`).start();
      await cloneRepository(repository.cloneUrl, repoPath, repository.isPrivate ? accessToken : null);
      spinner.succeed(`Cloned ${repository.fullName} to ${repoPath}`);
    } catch (error) {
      handleError(error, 'Error cloning repository');
    }
  }
  
  // Show available commands
  const { command } = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: 'What would you like to do with this repository?',
      choices: [
        { name: 'Extract code for analysis', value: 'extract' },
        { name: 'Generate documentation', value: 'generate-docs' },
        { name: 'Analyze code complexity', value: 'complexity' },
        { name: 'Analyze dependencies', value: 'analyze-deps' },
        { name: 'Search code semantically', value: 'search' },
        { name: 'Detect tech stack', value: 'detect-stack' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);
  
  if (command === 'exit') {
    return;
  }
  
  // Execute the selected command
  switch (command) {
    case 'extract':
      await extractCodeInteractive(repoPath);
      break;
    case 'generate-docs':
      await generateDocsInteractive(repoPath);
      break;
    case 'complexity':
      await complexityInteractive(repoPath);
      break;
    case 'analyze-deps':
      await dependenciesInteractive(repoPath);
      break;
    case 'search':
      await searchInteractive(repoPath);
      break;
    case 'detect-stack':
      await detectStackInteractive(repoPath);
      break;
  }
  
  // Ask if the user wants to perform another action
  const { another } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'another',
      message: 'Would you like to perform another action on this repository?',
      default: true,
    },
  ]);
  
  if (another) {
    await executeCommandsOnRepo(repository, accessToken);
  }
}

/**
 * Interactive code extraction
 * @param {string} repoPath - Path to the repository
 */
async function extractCodeInteractive(repoPath) {
  const { output, excludeInput, maxSize } = await inquirer.prompt([
    {
      type: 'input',
      name: 'output',
      message: 'Output file path (leave empty to print to console):',
      default: '',
    },
    {
      type: 'input',
      name: 'excludeInput',
      message: 'Patterns to exclude (comma-separated):',
      default: 'node_modules,.git,dist,build,*.min.js,*.map',
    },
    {
      type: 'input',
      name: 'maxSize',
      message: 'Maximum file size in KB (leave empty for no limit):',
      default: '',
      validate: (input) => {
        if (input === '') return true;
        const num = parseInt(input);
        return !isNaN(num) && num > 0 ? true : 'Please enter a positive number or leave empty';
      },
    },
  ]);
  
  const exclude = excludeInput.split(',').map(p => p.trim());
  const maxSizeBytes = maxSize ? parseInt(maxSize) * 1024 : null;
  
  await extractRepositoryCode({
    directory: repoPath,
    output,
    exclude,
    maxSize: maxSizeBytes,
  });
}

/**
 * Interactive documentation generation
 * @param {string} repoPath - Path to the repository
 */
async function generateDocsInteractive(repoPath) {
  // Get code content
  const codeContent = await extractRepositoryCode({ directory: repoPath });
  
  // Prompt for options
  const { type, outputFormat, apiKey, prompt, complexity } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What type of documentation would you like to generate?',
      choices: [
        { name: 'Architectural Documentation', value: 'architecture' },
        { name: 'User Stories', value: 'user-stories' },
        { name: 'Code Story (Narrative Explanation)', value: 'code-story' },
        { name: 'Custom Analysis', value: 'custom' },
      ],
    },
    {
      type: 'list',
      name: 'outputFormat',
      message: 'Output format:',
      choices: ['md', 'html'],
      default: 'md',
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'OpenAI API key (leave empty to use environment variable):',
      default: '',
    },
    {
      type: 'input',
      name: 'prompt',
      message: 'Custom prompt for analysis:',
      default: '',
      when: (answers) => answers.type === 'custom',
    },
    {
      type: 'list',
      name: 'complexity',
      message: 'Complexity level for code story:',
      choices: ['simple', 'moderate', 'detailed'],
      default: 'moderate',
      when: (answers) => answers.type === 'code-story',
    },
  ]);
  
  // Get OpenAI API key
  const finalApiKey = await getOpenAIKey(apiKey);
  
  // Validate API key
  const spinner = ora('Validating API key...').start();
  const isValid = await validateApiKey(finalApiKey);
  
  if (!isValid) {
    spinner.fail('Invalid API key');
    throw new Error('Invalid OpenAI API key');
  }
  
  spinner.succeed('API key validated');
  
  let result;
  
  // Generate documentation based on type
  if (type === 'architecture') {
    spinner.text = 'Generating architectural documentation...';
    spinner.start();
    result = await generateArchitecturalDoc(codeContent, finalApiKey);
  } else if (type === 'user-stories') {
    spinner.text = 'Generating user stories...';
    spinner.start();
    result = await generateUserStories(codeContent, finalApiKey);
  } else if (type === 'code-story') {
    spinner.text = `Generating code story with ${complexity} complexity...`;
    spinner.start();
    result = await generateCodeStory(codeContent, complexity, finalApiKey);
  } else if (type === 'custom' && prompt) {
    spinner.text = 'Generating custom analysis...';
    spinner.start();
    result = await generateCustomAnalysis(codeContent, prompt, finalApiKey);
  } else {
    spinner.fail();
    throw new Error(`Unsupported documentation type: ${type}`);
  }
  
  spinner.succeed('Documentation generated');
  
  // Save document
  const docId = `${type}_${Date.now()}`;
  const docPath = path.join(DOCS_DIR, `${docId}.md`);
  fs.writeFileSync(docPath, result);
  
  console.log(chalk.green(`\nDocumentation saved to: ${docPath}`));
  console.log('\nDocumentation Preview:');
  console.log(marked(result.slice(0, 1000) + '...\n\n[Content truncated]'));
}

/**
 * Interactive complexity analysis
 * @param {string} repoPath - Path to the repository
 */
async function complexityInteractive(repoPath) {
  const { output, threshold, language, filter, exclude, details } = await inquirer.prompt([
    {
      type: 'list',
      name: 'output',
      message: 'Output format:',
      choices: ['json', 'html', 'csv'],
      default: 'json',
    },
    {
      type: 'number',
      name: 'threshold',
      message: 'Complexity threshold for highlighting:',
      default: 15,
      validate: (input) => {
        const num = parseInt(input);
        return !isNaN(num) && num > 0 ? true : 'Please enter a positive number';
      },
    },
    {
      type: 'input',
      name: 'language',
      message: 'Filter by programming language (leave empty for all):',
      default: '',
    },
    {
      type: 'input',
      name: 'filter',
      message: 'Pattern to filter files (glob syntax, leave empty for all):',
      default: '',
    },
    {
      type: 'input',
      name: 'exclude',
      message: 'Pattern to exclude files (glob syntax, leave empty for none):',
      default: '',
    },
    {
      type: 'confirm',
      name: 'details',
      message: 'Show detailed breakdown by function/method?',
      default: false,
    },
  ]);
  
  const result = await analyzeComplexity({
    directory: repoPath,
    output,
    threshold: parseInt(threshold),
    language: language || undefined,
    filter: filter || undefined,
    exclude: exclude || undefined,
    details,
  });
  
  console.log('\nComplexity Analysis Results:');
  
  if (output === 'json') {
    console.log(result);
  } else if (output === 'html') {
    const outputPath = path.join(process.cwd(), 'complexity-report.html');
    fs.writeFileSync(outputPath, result);
    console.log(chalk.green(`\nHTML report saved to: ${outputPath}`));
  } else if (output === 'csv') {
    const outputPath = path.join(process.cwd(), 'complexity-report.csv');
    fs.writeFileSync(outputPath, result);
    console.log(chalk.green(`\nCSV report saved to: ${outputPath}`));
  }
}

/**
 * Interactive dependencies analysis
 * @param {string} repoPath - Path to the repository
 */
async function dependenciesInteractive(repoPath) {
  const { output, depth, filter, exclude, highlightCircular, showExternal } = await inquirer.prompt([
    {
      type: 'list',
      name: 'output',
      message: 'Output format:',
      choices: ['dot', 'json', 'html'],
      default: 'dot',
    },
    {
      type: 'number',
      name: 'depth',
      message: 'Maximum depth for dependency analysis:',
      default: 10,
      validate: (input) => {
        const num = parseInt(input);
        return !isNaN(num) && num > 0 ? true : 'Please enter a positive number';
      },
    },
    {
      type: 'input',
      name: 'filter',
      message: 'Pattern to filter files (glob syntax, leave empty for all):',
      default: '',
    },
    {
      type: 'input',
      name: 'exclude',
      message: 'Pattern to exclude files (glob syntax, leave empty for none):',
      default: '',
    },
    {
      type: 'confirm',
      name: 'highlightCircular',
      message: 'Highlight circular dependencies?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'showExternal',
      message: 'Include external dependencies?',
      default: false,
    },
  ]);
  
  const result = await analyzeDependencies({
    directory: repoPath,
    output,
    depth: parseInt(depth),
    filter: filter || undefined,
    exclude: exclude || undefined,
    highlightCircular,
    showExternal,
  });
  
  if (output === 'dot') {
    const outputPath = path.join(process.cwd(), 'dependencies.dot');
    fs.writeFileSync(outputPath, result);
    console.log(chalk.green(`\nDOT file saved to: ${outputPath}`));
    console.log(chalk.yellow('To visualize, use Graphviz: dot -Tpng dependencies.dot -o dependencies.png'));
  } else if (output === 'json') {
    console.log(result);
  } else if (output === 'html') {
    const outputPath = path.join(process.cwd(), 'dependencies.html');
    fs.writeFileSync(outputPath, result);
    console.log(chalk.green(`\nHTML visualization saved to: ${outputPath}`));
  }
}

/**
 * Interactive code search
 * @param {string} repoPath - Path to the repository
 */
async function searchInteractive(repoPath) {
  const { query, limit, context, apiKey, useEmbeddings, fileExt, filterType } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Enter your search query:',
      validate: (input) => input.length > 0 ? true : 'Search query is required',
    },
    {
      type: 'number',
      name: 'limit',
      message: 'Maximum number of results:',
      default: 10,
      validate: (input) => {
        const num = parseInt(input);
        return !isNaN(num) && num > 0 ? true : 'Please enter a positive number';
      },
    },
    {
      type: 'number',
      name: 'context',
      message: 'Lines of context to show:',
      default: 3,
      validate: (input) => {
        const num = parseInt(input);
        return !isNaN(num) && num >= 0 ? true : 'Please enter a non-negative number';
      },
    },
    {
      type: 'confirm',
      name: 'useEmbeddings',
      message: 'Use semantic search with embeddings?',
      default: true,
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'OpenAI API key (required for semantic search, leave empty to use environment variable):',
      default: '',
      when: (answers) => answers.useEmbeddings,
    },
    {
      type: 'input',
      name: 'fileExt',
      message: 'File extensions to filter (comma-separated, e.g., js,py):',
      default: '',
    },
    {
      type: 'list',
      name: 'filterType',
      message: 'Filter by code construct type:',
      choices: [
        { name: 'All constructs', value: '' },
        { name: 'Functions', value: 'function' },
        { name: 'Classes', value: 'class' },
        { name: 'Variables', value: 'variable' }
      ],
      default: '',
    }
  ]);
  
  // Parse file extensions
  const fileExtArray = fileExt ? fileExt.split(',').map(ext => ext.trim()).filter(ext => ext) : [];
  
  // Get OpenAI API key if using embeddings
  let finalApiKey = null;
  if (useEmbeddings) {
    finalApiKey = await getOpenAIKey(apiKey);
    
    if (!finalApiKey) {
      console.log(chalk.yellow('No API key provided. Falling back to keyword search.'));
    }
  }
  
  const results = await searchCodebase({
    query,
    directory: repoPath,
    limit: parseInt(limit),
    context: parseInt(context),
    apiKey: finalApiKey,
    useEmbeddings: useEmbeddings && !!finalApiKey,
    fileExt: fileExtArray,
    filterType
  });
  
  // Format and display results using the updated formatSearchResults function
  const formattedOutput = formatSearchResults(results, 'text');
  console.log(formattedOutput);
}

/**
 * Interactive tech stack detection
 * @param {string} repoPath - Path to the repository
 */
async function detectStackInteractive(repoPath) {
  const { output, scanDeps, checkOutdated } = await inquirer.prompt([
    {
      type: 'list',
      name: 'output',
      message: 'Output format:',
      choices: ['text', 'json', 'md'],
      default: 'text',
    },
    {
      type: 'confirm',
      name: 'scanDeps',
      message: 'Perform deep dependency scanning?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'checkOutdated',
      message: 'Check for outdated dependencies?',
      default: false,
    },
  ]);
  
  const spinner = ora('Analyzing tech stack...').start();
  
  const result = await detectTechStack({
    directory: repoPath,
    scanDeps,
    checkOutdated,
  });
  
  spinner.succeed('Tech stack analysis complete');
  
  if (output === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else if (output === 'md') {
    let markdown = '# Tech Stack Analysis\n\n';
    
    markdown += '## Primary Technologies\n\n';
    for (const tech of result.primaryTech) {
      markdown += `- **${tech.name}** (${tech.type})\n`;
      if (tech.version) markdown += `  - Version: ${tech.version}\n`;
      if (tech.confidence) markdown += `  - Confidence: ${tech.confidence}%\n`;
    }
    
    if (result.frameworks.length > 0) {
      markdown += '\n## Frameworks\n\n';
      for (const framework of result.frameworks) {
        markdown += `- **${framework.name}**\n`;
        if (framework.version) markdown += `  - Version: ${framework.version}\n`;
      }
    }
    
    if (result.libraries.length > 0) {
      markdown += '\n## Libraries\n\n';
      for (const lib of result.libraries) {
        markdown += `- **${lib.name}**\n`;
        if (lib.version) markdown += `  - Version: ${lib.version}\n`;
        if (lib.outdated) markdown += `  - **Outdated**: Latest version is ${lib.latestVersion}\n`;
      }
    }
    
    if (result.buildTools.length > 0) {
      markdown += '\n## Build Tools\n\n';
      for (const tool of result.buildTools) {
        markdown += `- **${tool.name}**\n`;
        if (tool.version) markdown += `  - Version: ${tool.version}\n`;
      }
    }
    
    if (result.recommendations.length > 0) {
      markdown += '\n## Recommendations\n\n';
      for (const rec of result.recommendations) {
        markdown += `- ${rec}\n`;
      }
    }
    
    console.log(markdown);
    
    const outputPath = path.join(process.cwd(), 'tech-stack.md');
    fs.writeFileSync(outputPath, markdown);
    console.log(chalk.green(`\nMarkdown report saved to: ${outputPath}`));
  } else {
    // Text output
    console.log(chalk.bold.cyan('\n=== Tech Stack Analysis ===\n'));
    
    console.log(chalk.bold.underline('Primary Technologies:'));
    for (const tech of result.primaryTech) {
      console.log(`- ${chalk.bold(tech.name)} (${tech.type})`);
      if (tech.version) console.log(`  Version: ${tech.version}`);
      if (tech.confidence) console.log(`  Confidence: ${tech.confidence}%`);
    }
    
    if (result.frameworks.length > 0) {
      console.log(chalk.bold.underline('\nFrameworks:'));
      for (const framework of result.frameworks) {
        console.log(`- ${chalk.bold(framework.name)}`);
        if (framework.version) console.log(`  Version: ${framework.version}`);
      }
    }
    
    if (result.libraries.length > 0) {
      console.log(chalk.bold.underline('\nLibraries:'));
      for (const lib of result.libraries) {
        console.log(`- ${chalk.bold(lib.name)}`);
        if (lib.version) console.log(`  Version: ${lib.version}`);
        if (lib.outdated) console.log(`  ${chalk.yellow('Outdated')}: Latest version is ${lib.latestVersion}`);
      }
    }
    
    if (result.buildTools.length > 0) {
      console.log(chalk.bold.underline('\nBuild Tools:'));
      for (const tool of result.buildTools) {
        console.log(`- ${chalk.bold(tool.name)}`);
        if (tool.version) console.log(`  Version: ${tool.version}`);
      }
    }
    
    if (result.recommendations.length > 0) {
      console.log(chalk.bold.underline('\nRecommendations:'));
      for (const rec of result.recommendations) {
        console.log(`- ${rec}`);
      }
    }
  }
}

/**
 * Login to GitHub
 * @param {Object} options - Command options
 * @param {boolean} options.force - Force re-authentication even if token exists
 * @param {boolean} options.webRedirect - Use web redirect instead of local server
 * @param {boolean} options.useCustomApp - Use custom GitHub app credentials
 */
async function loginCommand(options = {}) {
  const { force = false, webRedirect = false, useCustomApp = false } = options;
  
  try {
    displayHeader('GitHub Authentication');
    
    if (useCustomApp) {
      console.log(chalk.yellow('Using custom GitHub OAuth credentials from environment variables.'));
      console.log(chalk.yellow('Make sure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set.'));
    } else {
      console.log(chalk.green('Using VibeInsights default GitHub OAuth application.'));
    }
    
    if (webRedirect) {
      const redirectUri = process.env.NODE_ENV === 'development' 
        ? 'https://54a5e666-dc40-4c6d-863f-d863a4bc27ae-00-1peum3pg6g6r3.kirk.replit.dev/callback'
        : 'https://vibeinsights.xyz/callback';
      
      console.log(chalk.cyan(`Using web redirect flow to ${redirectUri}`));
      console.log(chalk.cyan('You will need to manually copy the authorization code.'));
    } else {
      console.log(chalk.cyan('Using local server flow (http://localhost:3000/callback)'));
    }
    
    // Authenticate with GitHub
    const token = await authenticate({
      forceAuth: force,
      useWebRedirect: webRedirect,
      useCustomApp: useCustomApp
    });
    
    console.log(chalk.green('\n✓ Successfully authenticated with GitHub!'));
    
    return token;
  } catch (error) {
    handleError('Authentication failed', error);
    process.exit(1);
  }
}

/**
 * Logout from GitHub
 */
async function logoutCommand() {
  try {
    displayHeader('GitHub Logout');
    await logout();
  } catch (error) {
    handleError('Logout failed', error);
    process.exit(1);
  }
}

/**
 * Setup command-line interface
 */
function setupCLI(program) {
  // Existing commands can go here if needed

  program
    .command('search <directory>')
    .description('Search codebase using natural language')
    .option('--query <query>', 'Search query')
    .option('--limit <limit>', 'Maximum number of results', parseInt, 10)
    .option('--context <context>', 'Lines of context', parseInt, 3)
    .option('--api-key <key>', 'OpenAI API key')
    .option('--use-embeddings', 'Use semantic search', true)
    .option('--filter-type <type>', 'Filter by code construct (function, class)')
    .option('--file-ext <extensions>', 'Filter by file extensions (e.g., js,py)')
    .option('--output <format>', 'Output format (text, json, html)', 'text')
    .action(async (directory, options) => {
      try {
        // Parse file extensions
        const fileExtArray = options.fileExt ? options.fileExt.split(',').map(ext => ext.trim()).filter(ext => ext) : [];
        
        const results = await searchCodebase({
          query: options.query,
          directory,
          limit: options.limit,
          context: options.context,
          apiKey: options.apiKey || process.env.OPENAI_API_KEY,
          useEmbeddings: options.useEmbeddings,
          fileExt: fileExtArray,
          filterType: options.filterType
        });
        
        const formattedOutput = formatSearchResults(results, options.output);
        console.log(formattedOutput);
      } catch (error) {
        handleError(error, 'Error performing search');
        process.exit(1);
      }
    });
}

module.exports = {
  // Authentication commands
  login: loginCommand,
  logout: logoutCommand,
  
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
  detectStackInteractive,
  setupCLI
};