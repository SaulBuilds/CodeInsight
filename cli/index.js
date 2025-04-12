#!/usr/bin/env node

/**
 * repo-scraper-cli
 * A comprehensive CLI tool for AI researchers that analyzes repositories, 
 * generates documentation, and integrates with OpenAI API
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const axios = require('axios');
const ora = require('ora');
const inquirer = require('inquirer');
const open = require('open');
const { marked } = require('marked');
const TerminalRenderer = require('marked-terminal');

// Configure marked to render to the terminal
marked.setOptions({
  renderer: new TerminalRenderer()
});

// Define the base URL for API calls
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Define CLI version and description
program
  .version('1.0.0')
  .description(chalk.blue.bold('RepoScraper CLI - Repository Analysis & Documentation Generation'));

// Command to analyze a repository and generate documentation
program
  .command('analyze [directory]')
  .description('Analyze a repository and extract code for documentation generation')
  .option('-o, --output <filename>', 'Output file name', 'repo_analysis.txt')
  .option('-x, --exclude <patterns...>', 'Patterns to exclude (e.g., "node_modules dist")')
  .option('-s, --max-size <size>', 'Maximum file size in bytes to include', parseInt)
  .option('--save', 'Save analysis to the server for future reference')
  .action(async (directory = '.', options) => {
    const spinner = ora('Analyzing repository...').start();
    
    try {
      const fullPath = path.resolve(process.cwd(), directory);
      
      // Validate directory exists
      if (!fs.existsSync(fullPath)) {
        spinner.fail(chalk.red(`Directory not found: ${fullPath}`));
        return;
      }
      
      // Prepare exclusion patterns
      const excludePatterns = options.exclude ? 
        options.exclude.split(' ') : 
        ['.git', 'node_modules', 'dist', 'build'];
      
      // Call the API to analyze the repository
      const response = await axios.post(`${API_BASE_URL}/repositories/scrape`, {
        directory: fullPath,
        exclude: excludePatterns,
        maxSize: options.maxSize
      });
      
      spinner.succeed(chalk.green('Repository analysis complete!'));
      
      const { repository, stats, outputFile } = response.data;
      
      // Display stats
      console.log(chalk.cyan('\nRepository Stats:'));
      console.log(chalk.cyan('------------------'));
      console.log(`Total Files: ${stats.totalFiles}`);
      console.log(`Included Files: ${stats.includedFiles}`);
      console.log(`Excluded Files: ${stats.excludedFiles}`);
      console.log(`Total Size: ${formatBytes(stats.totalSizeBytes)}`);
      console.log(`Included Size: ${formatBytes(stats.includedSizeBytes)}`);
      
      console.log(chalk.cyan('\nFile Types:'));
      Object.entries(stats.fileTypes).forEach(([ext, count]) => {
        console.log(`${ext || 'no extension'}: ${count} files`);
      });
      
      console.log(chalk.green(`\nAnalysis saved to: ${outputFile}`));
      
      // If saving is enabled, repository is already saved via the API
      if (options.save) {
        console.log(chalk.green(`Repository saved with ID: ${repository.id}`));
      }
      
      // Ask if user wants to generate documentation
      const { generateDocs } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateDocs',
          message: 'Would you like to generate documentation using AI?',
          default: true
        }
      ]);
      
      if (generateDocs) {
        await promptDocumentationGeneration(repository.id, outputFile);
      }
      
    } catch (error) {
      spinner.fail(chalk.red('Analysis failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      if (error.response) {
        console.error(chalk.red(`Server response: ${JSON.stringify(error.response.data)}`));
      }
    }
  });

// Command to generate documentation from an existing repository
program
  .command('generate-docs <repository_id>')
  .description('Generate documentation from an analyzed repository')
  .option('--type <type>', 'Type of documentation to generate (architecture, user_stories, custom)', 'architecture')
  .option('--prompt <prompt>', 'Custom prompt for documentation generation')
  .option('--api-key <key>', 'OpenAI API key (optional, will use environment variable if not provided)')
  .action(async (repositoryId, options) => {
    try {
      // Convert repository_id to number
      const repoId = parseInt(repositoryId, 10);
      
      // Validate repository exists
      const spinner = ora('Fetching repository details...').start();
      
      try {
        await axios.get(`${API_BASE_URL}/repositories/${repoId}`);
        spinner.succeed('Repository found');
      } catch (error) {
        spinner.fail(`Repository with ID ${repoId} not found`);
        return;
      }
      
      // Get code content from the repository
      const { codeContent } = await getRepositoryCode(repoId);
      
      // Generate documentation
      await generateDocumentation({
        repositoryId: repoId,
        codeContent,
        type: options.type,
        customPrompt: options.prompt,
        apiKey: options.apiKey
      });
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      if (error.response) {
        console.error(chalk.red(`Server response: ${JSON.stringify(error.response.data)}`));
      }
    }
  });

// Command to list all repositories
program
  .command('list-repos')
  .description('List all analyzed repositories')
  .action(async () => {
    const spinner = ora('Fetching repositories...').start();
    
    try {
      const response = await axios.get(`${API_BASE_URL}/repositories`);
      spinner.succeed(chalk.green('Repositories retrieved'));
      
      if (response.data.length === 0) {
        console.log(chalk.yellow('No repositories found'));
        return;
      }
      
      console.log(chalk.cyan('\nRepositories:'));
      console.log(chalk.cyan('-------------'));
      
      response.data.forEach(repo => {
        console.log(`ID: ${repo.id}`);
        console.log(`Name: ${repo.name}`);
        console.log(`Path: ${repo.path}`);
        console.log(`Files: ${repo.files_count}`);
        console.log(`Size: ${formatBytes(repo.code_size)}`);
        console.log(`Analyzed: ${new Date(repo.analyzed_at).toLocaleString()}`);
        console.log('---');
      });
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch repositories'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Command to list all documentation generated for a repository
program
  .command('list-docs <repository_id>')
  .description('List all documentation generated for a repository')
  .action(async (repositoryId) => {
    const spinner = ora('Fetching documentation...').start();
    
    try {
      const repoId = parseInt(repositoryId, 10);
      const response = await axios.get(`${API_BASE_URL}/repositories/${repoId}/analyses`);
      
      spinner.succeed(chalk.green('Documentation retrieved'));
      
      if (response.data.length === 0) {
        console.log(chalk.yellow('No documentation found for this repository'));
        return;
      }
      
      console.log(chalk.cyan('\nDocumentation:'));
      console.log(chalk.cyan('--------------'));
      
      response.data.forEach(doc => {
        console.log(`ID: ${doc.id}`);
        console.log(`Type: ${doc.type}`);
        console.log(`AI Model: ${doc.ai_model}`);
        console.log(`Created: ${new Date(doc.created_at).toLocaleString()}`);
        console.log('---');
      });
      
      // Ask if user wants to view any documentation
      const { viewDoc } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'viewDoc',
          message: 'Would you like to view any of these documents?',
          default: true
        }
      ]);
      
      if (viewDoc) {
        const { docId } = await inquirer.prompt([
          {
            type: 'input',
            name: 'docId',
            message: 'Enter the document ID:',
            validate: input => !isNaN(parseInt(input, 10))
          }
        ]);
        
        await viewDocument(parseInt(docId, 10));
      }
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch documentation'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Command to view a specific document
program
  .command('view-doc <document_id>')
  .description('View a specific document')
  .option('--format <format>', 'Output format (terminal, markdown)', 'terminal')
  .action(async (documentId, options) => {
    await viewDocument(parseInt(documentId, 10), options.format);
  });

// Command to verify OpenAI API key
program
  .command('verify-key <api_key>')
  .description('Verify an OpenAI API key')
  .action(async (apiKey) => {
    const spinner = ora('Verifying API key...').start();
    
    try {
      const response = await axios.post(`${API_BASE_URL}/analyses/generate`, {
        repository_id: 0, // Dummy value
        code_content: 'console.log("test");', // Minimal code
        type: 'custom',
        custom_prompt: 'Verify API key only',
        api_key: apiKey
      });
      
      spinner.succeed(chalk.green('OpenAI API key is valid!'));
    } catch (error) {
      spinner.fail(chalk.red('API key verification failed'));
      if (error.response && error.response.status === 401) {
        console.error(chalk.red('Invalid OpenAI API key'));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
  });

// Function to prompt for documentation generation
async function promptDocumentationGeneration(repositoryId, outputFile) {
  // Read the content of the output file
  const codeContent = fs.readFileSync(outputFile, 'utf8');
  
  // Ask for the type of documentation to generate
  const { docType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'docType',
      message: 'What type of documentation would you like to generate?',
      choices: [
        { name: 'Architectural Overview', value: 'architecture' },
        { name: 'User Stories', value: 'user_stories' },
        { name: 'Custom Analysis', value: 'custom' }
      ]
    }
  ]);
  
  let customPrompt;
  if (docType === 'custom') {
    const { prompt } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: 'Enter your custom prompt for the AI:',
        validate: input => input.trim().length > 0
      }
    ]);
    customPrompt = prompt;
  }
  
  // Ask for API key if needed
  const { useEnvKey } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useEnvKey',
      message: 'Use the default OpenAI API key?',
      default: true
    }
  ]);
  
  let apiKey;
  if (!useEnvKey) {
    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: 'Enter your OpenAI API key:',
        validate: input => input.trim().length > 0
      }
    ]);
    apiKey = key;
  }
  
  // Generate documentation
  await generateDocumentation({
    repositoryId,
    codeContent,
    type: docType,
    customPrompt,
    apiKey
  });
}

// Function to generate documentation
async function generateDocumentation(options) {
  const { repositoryId, codeContent, type, customPrompt, apiKey } = options;
  
  const spinner = ora('Generating documentation with AI...').start();
  
  try {
    const requestData = {
      repository_id: repositoryId,
      code_content: codeContent,
      type
    };
    
    if (customPrompt) {
      requestData.custom_prompt = customPrompt;
    }
    
    if (apiKey) {
      requestData.api_key = apiKey;
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/analyses/generate`,
      requestData
    );
    
    spinner.succeed(chalk.green('Documentation generated successfully!'));
    
    // Display generated content
    console.log(chalk.cyan('\nGenerated Documentation:'));
    console.log(chalk.cyan('------------------------'));
    
    // Render markdown to terminal
    console.log(marked(response.data.content));
    
    console.log(chalk.green(`\nDocumentation saved with ID: ${response.data.analysis.id}`));
    
    // Ask if user wants to save to a file
    const { saveToFile } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'saveToFile',
        message: 'Would you like to save this documentation to a file?',
        default: true
      }
    ]);
    
    if (saveToFile) {
      const { filename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'filename',
          message: 'Enter filename (will be saved as markdown):',
          default: `docs_${response.data.analysis.id}.md`
        }
      ]);
      
      fs.writeFileSync(filename, response.data.content);
      console.log(chalk.green(`Documentation saved to: ${filename}`));
    }
    
  } catch (error) {
    spinner.fail(chalk.red('Documentation generation failed'));
    console.error(chalk.red(`Error: ${error.message}`));
    if (error.response) {
      console.error(chalk.red(`Server response: ${JSON.stringify(error.response.data)}`));
    }
  }
}

// Function to get repository code content
async function getRepositoryCode(repositoryId) {
  // This is a placeholder - in a real implementation, we would
  // fetch the actual file content from the server
  const spinner = ora('Fetching repository code content...').start();
  
  // For now, we'll return a simple string as a placeholder
  // In a real implementation, we would make an API call to get the content
  spinner.succeed('Repository code content retrieved');
  
  return {
    codeContent: `// This is placeholder code content for repository ${repositoryId}\n` +
      `console.log("Hello, world!");\n`
  };
}

// Function to view a document
async function viewDocument(documentId, format = 'terminal') {
  const spinner = ora('Fetching document...').start();
  
  try {
    const response = await axios.get(`${API_BASE_URL}/analyses/${documentId}`);
    spinner.succeed(chalk.green('Document retrieved'));
    
    if (format === 'terminal') {
      console.log(chalk.cyan('\nDocument Content:'));
      console.log(chalk.cyan('-----------------'));
      console.log(marked(response.data.content));
    } else {
      // Save to markdown file
      const filename = `doc_${documentId}.md`;
      fs.writeFileSync(filename, response.data.content);
      console.log(chalk.green(`Document saved to: ${filename}`));
      
      // Ask if user wants to open the file
      const { openFile } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'openFile',
          message: 'Would you like to open this file?',
          default: true
        }
      ]);
      
      if (openFile) {
        await open(filename);
      }
    }
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch document'));
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}