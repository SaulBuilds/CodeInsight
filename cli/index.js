#!/usr/bin/env node

/**
 * Vibe Insights AI
 * A sophisticated AI-powered CLI tool that transforms repository analysis 
 * and documentation generation for researchers and developers
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { program } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const { marked } = require('marked');
const TerminalRenderer = require('marked-terminal');
const dotenv = require('dotenv');
const { glob } = require('glob');
const os = require('os');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const simpleGit = require('simple-git');
const figlet = require('figlet');

// Load environment variables
dotenv.config();

// Custom utilities
const { validateApiKey, getOpenAIKey, generateArchitecturalDoc, generateUserStories, generateCustomAnalysis, generateCodeStory } = require('./openai-utils');
const { analyzeComplexity } = require('./complexity-analyzer');
const { analyzeDependencies } = require('./dep-analyzer');
const { searchCodebase } = require('./search');
const { detectTechStack } = require('./tech-detector');
const { authenticate, fetchUserRepositories, cloneRepository, selectRepository, logout } = require('./github-auth');

// Configure marked with terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer(),
});

// User home directory for config/data storage
const USER_HOME = os.homedir();
const DATA_DIR = path.join(USER_HOME, '.vibeinsights');
const REPO_DIR = path.join(DATA_DIR, 'repositories');
const DOCS_DIR = path.join(DATA_DIR, 'documents');
const TEMP_DIR = path.join(DATA_DIR, 'temp');

// Create data directories if they don't exist
[DATA_DIR, REPO_DIR, DOCS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Error handling function
function handleError(error, message = 'An error occurred') {
  console.error(chalk.red(`\n${message}:`));
  console.error(chalk.red(error.message || error));
  process.exit(1);
}

// Generate ASCII art logo
function generateLogo() {
  try {
    return figlet.textSync('VIBE INSIGHTS', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    });
  } catch (error) {
    // Fallback if figlet fails
    return 'VIBE INSIGHTS';
  }
}

// Display application header/branding
function displayHeader() {
  const logoText = chalk.bold.rgb(142, 98, 87)(generateLogo());
  
  const subText = chalk.gray('AI-powered Repository Analysis & Documentation Tool');
  
  console.log(boxen(`${logoText}\n\n${subText}`, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }));
}

// Apply colorization to complexity values
function getColorForComplexity(value, threshold) {
  if (value < threshold * 0.5) return chalk.green(value);
  if (value < threshold) return chalk.yellow(value);
  return chalk.red(value);
}

/**
 * Display a small logo for inline commands
 */
function displayInlineHeader() {
  console.log(chalk.bold.rgb(142, 98, 87)(`
██╗   ██╗██╗██████╗ ███████╗
██║   ██║██║██╔══██╗██╔════╝
██║   ██║██║██████╦╝█████╗  
╚██╗ ██╔╝██║██╔══██╗██╔══╝  
 ╚████╔╝ ██║██████╦╝███████╗
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝`));
  console.log('');
}

/**
 * Extract all code files from a repository and combine them into a single string
 */
async function extractRepositoryCode({ directory, output, exclude = [], maxSize = null }) {
  try {
    const spinner = ora('Extracting code from repository...').start();
    
    if (!fs.existsSync(directory)) {
      spinner.fail();
      throw new Error(`Directory '${directory}' does not exist`);
    }
    
    let extractedCode = '';
    let totalFiles = 0;
    let totalSize = 0;
    const filePaths = [];
    
    // Convert exclude patterns to array if string
    if (typeof exclude === 'string') {
      exclude = exclude.split(',').map(p => p.trim());
    }
    
    // Add common excludes if none specified
    if (exclude.length === 0) {
      exclude = ['node_modules', '.git', 'dist', 'build', '*.min.js', '*.map'];
    }
    
    // Check if path should be excluded
    function isExcluded(filePath) {
      const relativePath = path.relative(directory, filePath);
      
      return exclude.some(pattern => {
        // Exact match
        if (relativePath === pattern) return true;
        // Wildcard pattern
        if (pattern.includes('*')) {
          const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          return new RegExp(`^${regexPattern}$`).test(relativePath);
        }
        // Directory match (any depth)
        return relativePath.split(path.sep).includes(pattern);
      });
    }
    
    // Check if file is a text file (not binary)
    function isTextFile(filePath) {
      const extension = path.extname(filePath).toLowerCase();
      const textExtensions = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.java', '.c', '.cpp', '.h',
        '.cs', '.php', '.go', '.rs', '.swift', '.kt', '.scala', '.md', '.json',
        '.yaml', '.yml', '.txt', '.html', '.htm', '.css', '.scss', '.less',
        '.sh', '.bash', '.zsh', '.xml', '.toml', '.ini', '.cfg', '.conf'
      ];
      
      return textExtensions.includes(extension);
    }
    
    // Recursive directory traversal
    function traverseDirectory(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (isExcluded(fullPath)) continue;
        
        if (entry.isDirectory()) {
          traverseDirectory(fullPath);
        } else if (entry.isFile() && isTextFile(fullPath)) {
          try {
            const stats = fs.statSync(fullPath);
            
            // Skip files larger than maxSize
            if (maxSize && stats.size > maxSize) {
              continue;
            }
            
            filePaths.push(fullPath);
            totalFiles++;
            totalSize += stats.size;
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error.message);
          }
        }
      }
    }
    
    traverseDirectory(directory);
    spinner.text = `Processing ${totalFiles} files (${formatBytes(totalSize)})...`;
    
    // Sort files by path for consistent output
    filePaths.sort();
    
    // Read and combine all files
    for (const filePath of filePaths) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(directory, filePath);
        
        extractedCode += `// ${relativePath}\n// ${'='.repeat(60)}\n${fileContent}\n\n`;
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
      }
    }
    
    // Write to output file if specified
    if (output) {
      fs.writeFileSync(output, extractedCode);
      spinner.succeed(`Extracted code from ${totalFiles} files (${formatBytes(totalSize)}) to ${output}`);
    } else {
      spinner.succeed(`Extracted code from ${totalFiles} files (${formatBytes(totalSize)})`);
    }
    
    return extractedCode;
  } catch (error) {
    handleError(error, 'Error extracting code');
  }
}

/**
 * Get repository code from stored repository
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
 * Format bytes to a human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a date string to a readable format
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Interactive process for working with GitHub repositories
 */
async function interactiveGitHub() {
  displayHeader();
  
  try {
    // Authenticate with GitHub
    const accessToken = await authenticate();
    
    // Select repository
    const selectedRepo = await selectRepository(accessToken);
    
    // Ask for commands to run
    await executeCommandsOnRepo(selectedRepo, accessToken);
  } catch (error) {
    handleError(error, 'Error in GitHub interactive mode');
  }
}

/**
 * Execute commands on a selected repository
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
 */
async function searchInteractive(repoPath) {
  const { query, limit, context, apiKey, useEmbeddings } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Enter your search query:',
      validate: (input) => input.trim() !== '' ? true : 'Query cannot be empty',
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
      message: 'Use semantic search with OpenAI embeddings?',
      default: true,
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'OpenAI API key (leave empty to use environment variable):',
      default: '',
      when: (answers) => answers.useEmbeddings,
    },
  ]);
  
  // Get OpenAI API key if using embeddings
  let finalApiKey = null;
  if (useEmbeddings) {
    finalApiKey = await getOpenAIKey(apiKey);
  }
  
  const results = await searchCodebase({
    query,
    directory: repoPath,
    limit: parseInt(limit),
    context: parseInt(context),
    apiKey: finalApiKey,
    useEmbeddings,
  });
  
  if (results.hits.length === 0) {
    console.log(chalk.yellow('\nNo results found for your query.'));
  } else {
    console.log(chalk.green(`\nFound ${results.hits.length} results for your query:`));
    
    for (let i = 0; i < results.hits.length; i++) {
      const hit = results.hits[i];
      console.log(`\n${chalk.cyan(`[${i + 1}] ${hit.file} (Lines ${hit.lineStart}-${hit.lineEnd})`)}`);
      console.log(chalk.gray(`Score: ${hit.score.toFixed(2)}`));
      console.log('-'.repeat(80));
      console.log(hit.content);
      console.log('-'.repeat(80));
    }
    
    console.log(chalk.gray(`\nSearch completed in ${results.timeMs}ms`));
  }
}

/**
 * Interactive tech stack detection
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
      default: true,
    },
    {
      type: 'confirm',
      name: 'checkOutdated',
      message: 'Check for outdated dependencies?',
      default: true,
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

// Define CLI program
program
  .name('vibe')
  .description('AI-powered repository analysis & documentation generation')
  .version('1.0.0');

// Interactive GitHub flow command
program
  .command('github')
  .description('Authenticate with GitHub and analyze repositories')
  .action(interactiveGitHub);

// GitHub logout command
program
  .command('logout')
  .description('Logout from GitHub')
  .action(async () => {
    displayHeader();
    await logout();
  });

// Extract code command
program
  .command('extract')
  .description('Extract code from a repository')
  .option('-d, --directory <path>', 'Repository directory', process.cwd())
  .option('-o, --output <filename>', 'Output filename')
  .option('-x, --exclude <patterns>', 'Comma-separated patterns to exclude', '')
  .option('-s, --size <size>', 'Maximum file size in KB')
  .action(async (options) => {
    displayHeader();
    
    try {
      let maxSize = null;
      if (options.size) {
        maxSize = parseInt(options.size) * 1024; // Convert KB to bytes
      }
      
      const exclude = options.exclude
        ? options.exclude.split(',').map(p => p.trim())
        : [];
      
      await extractRepositoryCode({
        directory: options.directory,
        output: options.output,
        exclude,
        maxSize
      });
    } catch (error) {
      handleError(error, 'Error extracting code');
    }
  });

// Generate documentation command
program
  .command('generate-docs')
  .description('Generate documentation from repository code')
  .argument('[repository-id]', 'Repository ID (optional if source is provided)')
  .option('-s, --source <filename>', 'Source code file')
  .option('-t, --type <type>', 'Documentation type (architecture, user-stories, code-story)', 'architecture')
  .option('-o, --output-format <format>', 'Output format (md, html)', 'md')
  .option('-k, --api-key <key>', 'OpenAI API key')
  .option('-p, --prompt <text>', 'Custom prompt for analysis')
  .option('-c, --complexity <level>', 'Complexity level for code story (simple, moderate, detailed)', 'moderate')
  .action(async (repositoryId, options) => {
    displayHeader();
    
    try {
      let codeContent;
      
      // Get code content either from source file or repository
      if (options.source) {
        codeContent = fs.readFileSync(options.source, 'utf8');
      } else if (repositoryId) {
        codeContent = await getRepositoryCode(repositoryId);
      } else {
        throw new Error('Either source file or repository ID must be provided');
      }
      
      // Get OpenAI API key
      const apiKey = await getOpenAIKey(options.apiKey);
      
      // Validate API key
      const spinner = ora('Validating API key...').start();
      const isValid = await validateApiKey(apiKey);
      
      if (!isValid) {
        spinner.fail('Invalid API key');
        throw new Error('Invalid OpenAI API key');
      }
      
      spinner.succeed('API key validated');
      
      let result;
      
      // Generate documentation based on type
      if (options.type === 'architecture') {
        spinner.text = 'Generating architectural documentation...';
        spinner.start();
        result = await generateArchitecturalDoc(codeContent, apiKey);
      } else if (options.type === 'user-stories') {
        spinner.text = 'Generating user stories...';
        spinner.start();
        result = await generateUserStories(codeContent, apiKey);
      } else if (options.type === 'code-story') {
        spinner.text = `Generating code story with ${options.complexity} complexity...`;
        spinner.start();
        result = await generateCodeStory(codeContent, options.complexity, apiKey);
      } else if (options.type === 'custom' && options.prompt) {
        spinner.text = 'Generating custom analysis...';
        spinner.start();
        result = await generateCustomAnalysis(codeContent, options.prompt, apiKey);
      } else {
        spinner.fail();
        throw new Error(`Unsupported documentation type: ${options.type}`);
      }
      
      spinner.succeed('Documentation generated');
      
      // Save document
      const docId = `${options.type}_${Date.now()}`;
      const docPath = path.join(DOCS_DIR, `${docId}.md`);
      fs.writeFileSync(docPath, result);
      
      console.log(chalk.green(`\nDocumentation saved to: ${docPath}`));
      console.log('\nDocumentation Preview:');
      console.log(marked(result.slice(0, 1000) + '...\n\n[Content truncated]'));
    } catch (error) {
      handleError(error, 'Error generating documentation');
    }
  });

// Analyze complexity command
program
  .command('complexity')
  .description('Analyze code complexity metrics')
  .option('-d, --directory <path>', 'Repository directory', process.cwd())
  .option('-o, --output <format>', 'Output format (json, html, csv)', 'json')
  .option('-t, --threshold <number>', 'Complexity threshold for highlighting', '15')
  .option('-l, --language <language>', 'Filter by programming language')
  .option('-f, --filter <pattern>', 'Pattern to filter files (glob syntax)')
  .option('-x, --exclude <pattern>', 'Pattern to exclude files (glob syntax)')
  .option('--details', 'Show detailed breakdown by function/method')
  .action(async (options) => {
    displayHeader();
    
    try {
      const result = await analyzeComplexity({
        directory: options.directory,
        output: options.output,
        threshold: parseInt(options.threshold),
        language: options.language,
        filter: options.filter,
        exclude: options.exclude,
        details: options.details || false
      });
      
      console.log('\nComplexity Analysis Results:');
      
      if (options.output === 'json') {
        console.log(result);
      } else if (options.output === 'html') {
        const outputPath = path.join(process.cwd(), 'complexity-report.html');
        fs.writeFileSync(outputPath, result);
        console.log(chalk.green(`\nHTML report saved to: ${outputPath}`));
      } else if (options.output === 'csv') {
        const outputPath = path.join(process.cwd(), 'complexity-report.csv');
        fs.writeFileSync(outputPath, result);
        console.log(chalk.green(`\nCSV report saved to: ${outputPath}`));
      }
    } catch (error) {
      handleError(error, 'Error analyzing complexity');
    }
  });

// Analyze dependencies command
program
  .command('analyze-deps')
  .description('Analyze dependencies between files')
  .option('-d, --directory <path>', 'Repository directory', process.cwd())
  .option('-o, --output <format>', 'Output format (dot, json, html)', 'dot')
  .option('--depth <number>', 'Maximum depth for dependency analysis', '10')
  .option('-f, --filter <pattern>', 'Pattern to filter files (glob syntax)')
  .option('-x, --exclude <pattern>', 'Pattern to exclude files (glob syntax)')
  .option('--highlight-circular', 'Highlight circular dependencies')
  .option('--show-external', 'Include external dependencies')
  .action(async (options) => {
    displayHeader();
    
    try {
      const result = await analyzeDependencies({
        directory: options.directory,
        output: options.output,
        depth: parseInt(options.depth),
        filter: options.filter,
        exclude: options.exclude,
        highlightCircular: options.highlightCircular || false,
        showExternal: options.showExternal || false
      });
      
      if (options.output === 'dot') {
        const outputPath = path.join(process.cwd(), 'dependencies.dot');
        fs.writeFileSync(outputPath, result);
        console.log(chalk.green(`\nDOT file saved to: ${outputPath}`));
        console.log(chalk.yellow('To visualize, use Graphviz: dot -Tpng dependencies.dot -o dependencies.png'));
      } else if (options.output === 'json') {
        console.log(result);
      } else if (options.output === 'html') {
        const outputPath = path.join(process.cwd(), 'dependencies.html');
        fs.writeFileSync(outputPath, result);
        console.log(chalk.green(`\nHTML visualization saved to: ${outputPath}`));
      }
    } catch (error) {
      handleError(error, 'Error analyzing dependencies');
    }
  });

// Search command
program
  .command('search')
  .description('Search code using natural language')
  .argument('<query>', 'Natural language query')
  .option('-d, --directory <path>', 'Repository directory', process.cwd())
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .option('-c, --context <lines>', 'Lines of context to show', '3')
  .option('-k, --api-key <key>', 'OpenAI API key')
  .option('--no-embeddings', 'Use simple keyword search instead of semantic search')
  .action(async (query, options) => {
    displayHeader();
    
    try {
      // Get OpenAI API key if using embeddings
      let apiKey = null;
      if (options.embeddings) {
        apiKey = await getOpenAIKey(options.apiKey);
      }
      
      const results = await searchCodebase({
        query,
        directory: options.directory,
        limit: parseInt(options.limit),
        context: parseInt(options.context),
        apiKey,
        useEmbeddings: options.embeddings
      });
      
      if (results.hits.length === 0) {
        console.log(chalk.yellow('\nNo results found for your query.'));
      } else {
        console.log(chalk.green(`\nFound ${results.hits.length} results for your query:`));
        
        for (let i = 0; i < results.hits.length; i++) {
          const hit = results.hits[i];
          console.log(`\n${chalk.cyan(`[${i + 1}] ${hit.file} (Lines ${hit.lineStart}-${hit.lineEnd})`)}`);
          console.log(chalk.gray(`Score: ${hit.score.toFixed(2)}`));
          console.log('-'.repeat(80));
          console.log(hit.content);
          console.log('-'.repeat(80));
        }
        
        console.log(chalk.gray(`\nSearch completed in ${results.timeMs}ms`));
      }
    } catch (error) {
      handleError(error, 'Error searching code');
    }
  });

// Tech stack detection command
program
  .command('detect-stack')
  .description('Detect technology stack in repository')
  .option('-d, --directory <path>', 'Repository directory', process.cwd())
  .option('-o, --output <format>', 'Output format (json, text, md)', 'text')
  .option('--scan-deps', 'Perform deep dependency scanning')
  .option('--check-outdated', 'Check for outdated dependencies')
  .action(async (options) => {
    displayHeader();
    
    try {
      const spinner = ora('Analyzing tech stack...').start();
      
      const result = await detectTechStack({
        directory: options.directory,
        scanDeps: options.scanDeps || false,
        checkOutdated: options.checkOutdated || false
      });
      
      spinner.succeed('Tech stack analysis complete');
      
      if (options.output === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.output === 'md') {
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
    } catch (error) {
      handleError(error, 'Error detecting tech stack');
    }
  });

// Command to list repositories
program
  .command('list-repos')
  .description('List repositories')
  .action(() => {
    displayHeader();
    
    try {
      const files = fs.readdirSync(REPO_DIR);
      
      if (files.length === 0) {
        console.log(chalk.yellow('No repositories found.'));
        return;
      }
      
      console.log(chalk.bold.cyan('\n=== Repositories ===\n'));
      
      for (const file of files) {
        const repoPath = path.join(REPO_DIR, file);
        const stats = fs.statSync(repoPath);
        
        if (stats.isDirectory()) {
          console.log(`- ${chalk.bold(file)}`);
          console.log(`  Added: ${formatDate(stats.birthtime)}`);
          console.log(`  Path: ${repoPath}`);
        }
      }
    } catch (error) {
      handleError(error, 'Error listing repositories');
    }
  });

// Command to list documents
program
  .command('list-docs')
  .description('List generated documents')
  .action(() => {
    displayHeader();
    
    try {
      const files = fs.readdirSync(DOCS_DIR);
      
      if (files.length === 0) {
        console.log(chalk.yellow('No documents found.'));
        return;
      }
      
      console.log(chalk.bold.cyan('\n=== Documents ===\n'));
      
      for (const file of files) {
        if (path.extname(file) === '.md') {
          const docPath = path.join(DOCS_DIR, file);
          const stats = fs.statSync(docPath);
          const docId = path.basename(file, '.md');
          
          const parts = docId.split('_');
          const type = parts[0];
          const timestamp = parts.slice(1).join('_');
          
          console.log(`- ${chalk.bold(docId)}`);
          console.log(`  Type: ${type}`);
          console.log(`  Created: ${formatDate(stats.birthtime)}`);
          console.log(`  Size: ${formatBytes(stats.size)}`);
          console.log(`  Path: ${docPath}`);
        }
      }
    } catch (error) {
      handleError(error, 'Error listing documents');
    }
  });

// Command to view a document
program
  .command('view-doc')
  .description('View a document')
  .argument('<document-id>', 'Document ID')
  .option('-f, --format <format>', 'Output format (terminal, raw)', 'terminal')
  .action(async (documentId, options) => {
    displayHeader();
    
    try {
      await viewDocument(documentId, options.format);
    } catch (error) {
      handleError(error, 'Error viewing document');
    }
  });

// Default action if no command is specified
program.action(() => {
  displayHeader();
  program.help();
});

// Parse command line arguments
program.parse(process.argv);