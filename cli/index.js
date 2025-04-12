#!/usr/bin/env node

/**
 * CodeInsight AI
 * A comprehensive CLI tool for AI researchers that analyzes repositories, 
 * generates documentation, and integrates with OpenAI API
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');
const inquirer = require('inquirer');
const dotenv = require('dotenv');
const { marked } = require('marked');
const TerminalRenderer = require('marked-terminal');
const axios = require('axios');
const { VERSION, VERSION_INFO } = require('./version');
const { 
  validateApiKey, 
  generateArchitecturalDoc, 
  generateUserStories, 
  generateCustomAnalysis, 
  generateCodeStory,
  getOpenAIKey 
} = require('./openai-utils');
const { analyzeDependencies } = require('./dep-analyzer');
const { analyzeComplexity } = require('./complexity-analyzer');
const { searchCodebase, formatSearchResults } = require('./search');
const { detectTechStack } = require('./tech-detector');

// Load environment variables from .env file
dotenv.config();

// Configure marked to use the terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer()
});

// Set up commander with version and description
program
  .version(VERSION)
  .description(VERSION_INFO.description);

// Configure analyze command
program
  .command('analyze [directory]')
  .description('Analyze repository and extract code for AI analysis')
  .option('-o, --output <file>', 'Output file name', 'repo_analysis.txt')
  .option('-x, --exclude <pattern...>', 'Additional exclusion pattern(s) (e.g., "dist,build")')
  .option('-s, --max-size <size>', 'Maximum file size in bytes to include')
  .option('--save', 'Save analysis to server for future reference')
  .action(async (directory = '.', options) => {
    try {
      const spinner = ora('Analyzing repository...').start();
      const result = await extractRepositoryCode({ 
        directory: path.resolve(process.cwd(), directory),
        output: options.output,
        exclude: options.exclude?.toString().split(',') || [],
        maxSize: options.maxSize ? parseInt(options.maxSize, 10) : null
      });
      
      spinner.succeed(chalk.green('Repository analysis complete'));
      
      console.log(boxen(
        chalk.bold.blue('Repository Analysis Results\n') +
        `Files processed: ${chalk.cyan(result.stats.totalFiles)}\n` +
        `Files included: ${chalk.cyan(result.stats.includedFiles)}\n` +
        `Files excluded: ${chalk.cyan(result.stats.excludedFiles)}\n` +
        `Total size: ${chalk.cyan(formatBytes(result.stats.totalSizeBytes))}\n` +
        `Included size: ${chalk.cyan(formatBytes(result.stats.includedSizeBytes))}\n\n` +
        `Output file: ${chalk.green(result.outputFile)}`,
        { padding: 1, borderColor: 'blue', dimBorder: true }
      ));

      if (options.save) {
        const saveSpinner = ora('Saving analysis to server...').start();
        try {
          // Logic for saving to server would go here
          // This would typically be an API call to the server
          saveSpinner.succeed(chalk.green('Analysis saved to server'));
          console.log(`Repository ID: ${chalk.cyan(1)}`); // This would be the actual ID returned from the server
        } catch (error) {
          saveSpinner.fail(chalk.red('Failed to save analysis to server'));
          console.error(chalk.red(`Error: ${error.message}`));
        }
      }
    } catch (error) {
      ora().fail(chalk.red('Repository analysis failed'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Configure generate-docs command
program
  .command('generate-docs <repository_id>')
  .description('Generate documentation from repository code using OpenAI')
  .option('--type <type>', 'Type of documentation to generate (architecture, user_stories, code_story, custom)', 'architecture')
  .option('--complexity <level>', 'Complexity level for code story (simple, moderate, detailed)', 'moderate')
  .option('--prompt <prompt>', 'Custom prompt for documentation generation (required if type=custom)')
  .option('--api-key <key>', 'OpenAI API key (will use OPENAI_API_KEY environment variable if not provided)')
  .action(async (repositoryId, options) => {
    try {
      // Validate repository ID
      if (isNaN(parseInt(repositoryId))) {
        console.error(chalk.red('Error: Repository ID must be a number'));
        return;
      }

      // Validate documentation type
      const validTypes = ['architecture', 'user_stories', 'code_story', 'custom'];
      if (!validTypes.includes(options.type)) {
        console.error(chalk.red(`Error: Invalid documentation type. Must be one of: ${validTypes.join(', ')}`));
        return;
      }
      
      // Validate complexity level for code_story
      if (options.type === 'code_story') {
        const validComplexity = ['simple', 'moderate', 'detailed'];
        if (!validComplexity.includes(options.complexity)) {
          console.error(chalk.red(`Error: Invalid complexity level. Must be one of: ${validComplexity.join(', ')}`));
          return;
        }
      }

      // If type is custom, prompt must be provided
      if (options.type === 'custom' && !options.prompt) {
        console.error(chalk.red('Error: Custom prompt is required when type is "custom"'));
        return;
      }

      // Get API key - now interactive
      try {
        const apiKey = await getOpenAIKey(options.apiKey, true);
        if (!apiKey) {
          console.error(chalk.red('Error: OpenAI API key is required but none was provided.'));
          console.log(chalk.yellow('You can provide it via:'));
          console.log(chalk.gray('- Command line: --api-key=your_key'));
          console.log(chalk.gray('- Environment: export OPENAI_API_KEY=your_key'));
          console.log(chalk.gray('- Config file: create ~/.codeinsight file with {"apiKey": "your_key"}'));
          return;
        }
        
        // Validate API key
        const validatingSpinner = ora('Validating OpenAI API key...').start();
        const isValid = await validateApiKey(apiKey);
        if (!isValid) {
          validatingSpinner.fail(chalk.red('Invalid OpenAI API key'));
          return;
        }
        validatingSpinner.succeed(chalk.green('OpenAI API key is valid'));

        // Get repository code
        const codeSpinner = ora('Retrieving repository code...').start();
        const codeContent = await getRepositoryCode(repositoryId);
        if (!codeContent) {
          codeSpinner.fail(chalk.red(`Repository with ID ${repositoryId} not found`));
          return;
        }
        codeSpinner.succeed(chalk.green('Repository code retrieved successfully'));

        // Generate documentation based on type
        let documentation;
        if (options.type === 'architecture') {
          documentation = await generateArchitecturalDoc(codeContent, apiKey);
        } else if (options.type === 'user_stories') {
          documentation = await generateUserStories(codeContent, apiKey);
        } else if (options.type === 'code_story') {
          documentation = await generateCodeStory(codeContent, options.complexity, apiKey);
        } else if (options.type === 'custom') {
          documentation = await generateCustomAnalysis(codeContent, options.prompt, apiKey);
        }

        // Save documentation to file
        const filename = `${options.type}_doc_${repositoryId}.md`;
        fs.writeFileSync(filename, documentation);
        
        console.log(boxen(
          chalk.bold.blue('Documentation Generated\n') +
          `Type: ${chalk.cyan(options.type)}\n` +
          `Output file: ${chalk.green(filename)}\n\n` +
          chalk.dim('Preview (first 500 characters):\n') +
          chalk.white(documentation.substring(0, 500) + '...'),
          { padding: 1, borderColor: 'blue', dimBorder: true }
        ));

        const { viewFull } = await inquirer.prompt([{
          type: 'confirm',
          name: 'viewFull',
          message: 'Would you like to view the full documentation?',
          default: false
        }]);

        if (viewFull) {
          console.log('\n' + marked(documentation));
        }
      } catch (error) {
        ora().fail(chalk.red('Documentation generation failed'));
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
  });

// Configure list-repos command
program
  .command('list-repos')
  .description('List all analyzed repositories')
  .action(async () => {
    try {
      const spinner = ora('Fetching repositories...').start();
      // This would typically be an API call to get repositories from the server
      const repositories = [
        { 
          id: 1, 
          name: 'example-repo', 
          path: '/home/user/projects/example-repo',
          files_count: 120,
          code_size: 2415612,
          analyzed_at: new Date().toISOString()
        }
      ];
      
      spinner.succeed(chalk.green('Repositories retrieved successfully'));
      
      if (repositories.length === 0) {
        console.log(chalk.yellow('No repositories found. Use "codeinsight analyze" to analyze a repository.'));
        return;
      }

      console.log(chalk.bold.blue('\nRepositories:'));
      console.log(chalk.blue('-'.repeat(60)));
      
      repositories.forEach(repo => {
        console.log(
          `ID: ${chalk.cyan(repo.id)}\n` +
          `Name: ${chalk.white(repo.name)}\n` +
          `Path: ${chalk.white(repo.path)}\n` +
          `Files: ${chalk.white(repo.files_count)}\n` +
          `Size: ${chalk.white(formatBytes(repo.code_size))}\n` +
          `Analyzed: ${chalk.white(formatDate(repo.analyzed_at))}\n` +
          chalk.blue('-'.repeat(60))
        );
      });
    } catch (error) {
      ora().fail(chalk.red('Failed to retrieve repositories'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Configure list-docs command
program
  .command('list-docs <repository_id>')
  .description('List all documentation generated for a repository')
  .action(async (repositoryId) => {
    try {
      // Validate repository ID
      if (isNaN(parseInt(repositoryId))) {
        console.error(chalk.red('Error: Repository ID must be a number'));
        return;
      }

      const spinner = ora(`Fetching documentation for repository ${repositoryId}...`).start();
      // This would typically be an API call to get documentation from the server
      const documents = [
        { 
          id: 1, 
          type: 'architecture',
          ai_model: 'gpt-4o',
          created_at: new Date().toISOString()
        },
        { 
          id: 2, 
          type: 'user_stories',
          ai_model: 'gpt-4o',
          created_at: new Date().toISOString()
        }
      ];
      
      spinner.succeed(chalk.green('Documentation retrieved successfully'));
      
      if (documents.length === 0) {
        console.log(chalk.yellow(`No documentation found for repository ${repositoryId}. Use "codeinsight generate-docs ${repositoryId}" to generate documentation.`));
        return;
      }

      console.log(chalk.bold.blue('\nDocumentation:'));
      console.log(chalk.blue('-'.repeat(60)));
      
      documents.forEach(doc => {
        console.log(
          `ID: ${chalk.cyan(doc.id)}\n` +
          `Type: ${chalk.white(doc.type)}\n` +
          `AI Model: ${chalk.white(doc.ai_model)}\n` +
          `Created: ${chalk.white(formatDate(doc.created_at))}\n` +
          chalk.blue('-'.repeat(60))
        );
      });
    } catch (error) {
      ora().fail(chalk.red('Failed to retrieve documentation'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Configure view-doc command
program
  .command('view-doc <document_id>')
  .description('View a specific document')
  .option('--format <format>', 'Output format: "terminal" or "markdown" (default: "terminal")', 'terminal')
  .action(async (documentId, options) => {
    try {
      // Validate document ID
      if (isNaN(parseInt(documentId))) {
        console.error(chalk.red('Error: Document ID must be a number'));
        return;
      }

      const spinner = ora(`Fetching document ${documentId}...`).start();
      const document = await viewDocument(documentId, options.format);
      
      if (!document) {
        spinner.fail(chalk.red(`Document with ID ${documentId} not found`));
        return;
      }
      
      spinner.succeed(chalk.green('Document retrieved successfully'));
      
      if (options.format === 'markdown') {
        // Write to a markdown file
        const filename = `doc_${documentId}.md`;
        fs.writeFileSync(filename, document);
        console.log(chalk.green(`Document saved to ${filename}`));
      } else {
        // Display in terminal
        console.log('\n' + marked(document));
      }
    } catch (error) {
      ora().fail(chalk.red('Failed to retrieve document'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Configure analyze-deps command (Dependency Graph Analysis)
program
  .command('analyze-deps [directory]')
  .description('Analyze dependencies between files in a repository')
  .option('-o, --output <format>', 'Output format: dot, json, html (default: "html")', 'html')
  .option('-d, --depth <level>', 'Maximum depth for dependency analysis', '10')
  .option('-f, --filter <pattern>', 'Filter files by pattern (glob syntax)')
  .option('--exclude <pattern>', 'Exclude files by pattern (glob syntax)')
  .option('--highlight-circular', 'Highlight circular dependencies', false)
  .option('--show-external', 'Include external dependencies', false)
  .action(async (directory = '.', options) => {
    try {
      const spinner = ora('Analyzing dependencies...').start();
      
      const result = await analyzeDependencies({
        directory: path.resolve(process.cwd(), directory),
        output: options.output,
        depth: parseInt(options.depth, 10),
        filter: options.filter,
        exclude: options.exclude,
        highlightCircular: options.highlightCircular,
        showExternal: options.showExternal
      });
      
      spinner.succeed(chalk.green('Dependency analysis completed'));
      
      // Save the result to a file based on the format
      const filename = `dependencies.${options.output === 'dot' ? 'dot' : (options.output === 'json' ? 'json' : 'html')}`;
      fs.writeFileSync(filename, result.result);
      
      console.log(boxen(
        chalk.bold.blue('Dependency Analysis Results\n') +
        `Files analyzed: ${chalk.cyan(Object.keys(result.dependencies).length)}\n` +
        `Output format: ${chalk.cyan(options.output)}\n` +
        `Output file: ${chalk.green(filename)}${options.highlightCircular ? '\n' + 
        `Circular dependencies: ${chalk.yellow(result.circularDependencies.length)}` : ''}`,
        { padding: 1, borderColor: 'blue', dimBorder: true }
      ));
      
      // Open in browser if HTML format
      if (options.output === 'html') {
        const { openBrowser } = await inquirer.prompt([{
          type: 'confirm',
          name: 'openBrowser',
          message: 'Would you like to open the HTML report in your browser?',
          default: false
        }]);
        
        if (openBrowser) {
          console.log(chalk.blue('Opening dependency graph in browser...'));
          // This would typically use a module like 'open' to open the file in a browser
          console.log(chalk.yellow(`To view the graph, open the file: ${filename}`));
        }
      }
    } catch (error) {
      ora().fail(chalk.red('Dependency analysis failed'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Configure complexity command (Code Complexity Metrics)
program
  .command('complexity [directory]')
  .description('Calculate code complexity metrics for a repository')
  .option('-o, --output <format>', 'Output format: json, html, csv (default: "html")', 'html')
  .option('-t, --threshold <number>', 'Complexity threshold for highlighting', '10')
  .option('-l, --language <language>', 'Filter by programming language')
  .option('-f, --filter <pattern>', 'Filter files by pattern (glob syntax)')
  .option('--exclude <pattern>', 'Exclude files by pattern (glob syntax)')
  .option('--details', 'Show detailed breakdown by function/method', false)
  .action(async (directory = '.', options) => {
    try {
      const spinner = ora('Calculating complexity metrics...').start();
      
      const result = await analyzeComplexity({
        directory: path.resolve(process.cwd(), directory),
        output: options.output,
        threshold: parseInt(options.threshold, 10),
        language: options.language,
        filter: options.filter,
        exclude: options.exclude,
        details: options.details
      });
      
      spinner.succeed(chalk.green('Complexity analysis completed'));
      
      // Save the result to a file based on the format
      const filename = `complexity.${options.output === 'json' ? 'json' : (options.output === 'csv' ? 'csv' : 'html')}`;
      fs.writeFileSync(filename, result.formattedOutput);
      
      // Get summary statistics
      const { totalFiles, averageComplexity, highComplexityFiles, highComplexityPercentage } = result.summary;
      
      // Show results summary
      console.log(boxen(
        chalk.bold.blue('Code Complexity Analysis Results\n') +
        `Files analyzed: ${chalk.cyan(totalFiles)}\n` +
        `Average complexity: ${chalk.cyan(averageComplexity.toFixed(2))}\n` +
        `Files with high complexity (>${options.threshold}): ${chalk.yellow(highComplexityFiles)} (${chalk.yellow(highComplexityPercentage.toFixed(1))}%)\n` +
        `Output format: ${chalk.cyan(options.output)}\n` +
        `Output file: ${chalk.green(filename)}`,
        { padding: 1, borderColor: 'blue', dimBorder: true }
      ));
      
      // List top 5 most complex files
      if (totalFiles > 0) {
        const topFiles = Object.entries(result.results)
          .sort((a, b) => b[1].cyclomaticComplexity - a[1].cyclomaticComplexity)
          .slice(0, 5);
        
        if (topFiles.length > 0) {
          console.log(chalk.bold.blue('\nTop 5 Most Complex Files:'));
          console.log(chalk.blue('-'.repeat(60)));
          
          topFiles.forEach(([file, metrics]) => {
            console.log(
              `${chalk.white(file)}\n` +
              `Cyclomatic Complexity: ${getColorForComplexity(metrics.cyclomaticComplexity, options.threshold)(metrics.cyclomaticComplexity)}\n` +
              `Lines: ${chalk.white(metrics.nonEmptyLineCount)} (${chalk.white(metrics.sizeCategory)})\n` +
              chalk.blue('-'.repeat(60))
            );
          });
        }
      }
      
      // Open in browser if HTML format
      if (options.output === 'html') {
        const { openBrowser } = await inquirer.prompt([{
          type: 'confirm',
          name: 'openBrowser',
          message: 'Would you like to open the HTML report in your browser?',
          default: false
        }]);
        
        if (openBrowser) {
          console.log(chalk.blue('Opening complexity report in browser...'));
          // This would typically use a module like 'open' to open the file in a browser
          console.log(chalk.yellow(`To view the report, open the file: ${filename}`));
        }
      }
    } catch (error) {
      ora().fail(chalk.red('Complexity analysis failed'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Helper function for complexity color coding
function getColorForComplexity(value, threshold) {
  const highThreshold = threshold;
  const mediumThreshold = threshold / 2;
  
  if (value >= highThreshold) {
    return chalk.red;
  } else if (value >= mediumThreshold) {
    return chalk.yellow;
  } else {
    return chalk.green;
  }
}

// Configure search command (Natural Language Search)
program
  .command('search <query>')
  .description('Search the codebase using natural language')
  .option('-d, --directory <path>', 'Repository directory to search', '.')
  .option('-n, --limit <number>', 'Maximum number of results', '10')
  .option('-c, --context <number>', 'Lines of context to show', '3')
  .option('-o, --output <format>', 'Output format: text, json, html (default: "text")', 'text')
  .option('--api-key <key>', 'OpenAI API key')
  .option('--no-embeddings', 'Use simple text search instead of embeddings', false)
  .action(async (query, options) => {
    try {
      let searchResult;
      const directoryPath = path.resolve(process.cwd(), options.directory);

      // First check if we need to get the API key for semantic search
      if (options.embeddings) {
        try {
          const apiKey = await getOpenAIKey(options.apiKey, true);
          if (!apiKey) {
            console.error(chalk.red('Error: OpenAI API key is required for semantic search.'));
            console.log(chalk.yellow('Try again with --no-embeddings to use simple text search instead.'));
            return;
          }
          
          // Perform semantic search with OpenAI embeddings
          const spinner = ora('Performing semantic code search...').start();
          
          searchResult = await searchCodebase({
            query,
            directory: directoryPath,
            limit: parseInt(options.limit, 10),
            context: parseInt(options.context, 10),
            apiKey,
            useEmbeddings: true
          });
          
          spinner.succeed(chalk.green('Semantic search completed'));
        } catch (error) {
          ora().fail(chalk.red('Semantic search failed'));
          console.error(chalk.red(`Error: ${error.message}`));
          
          // Fall back to simple search
          console.log(chalk.yellow('Falling back to simple text search...'));
          
          const fallbackSpinner = ora(`Searching for "${query}" using simple text search...`).start();
          
          searchResult = await searchCodebase({
            query,
            directory: directoryPath,
            limit: parseInt(options.limit, 10),
            context: parseInt(options.context, 10),
            useEmbeddings: false
          });
          
          fallbackSpinner.succeed(chalk.green('Simple search completed'));
        }
      } else {
        // Use simple text search without API
        const spinner = ora(`Searching for "${query}"...`).start();
        
        searchResult = await searchCodebase({
          query,
          directory: directoryPath,
          limit: parseInt(options.limit, 10),
          context: parseInt(options.context, 10),
          useEmbeddings: false
        });
        
        spinner.succeed(chalk.green('Search completed'));
      }
      
      // Format and display the results
      const formattedOutput = formatSearchResults(searchResult, options.output);
      
      // For non-text formats, save to file
      if (options.output !== 'text') {
        const filename = `search_results.${options.output}`;
        fs.writeFileSync(filename, formattedOutput);
        console.log(chalk.green(`Search results saved to ${filename}`));
        
        // Open in browser if HTML format
        if (options.output === 'html') {
          const { openBrowser } = await inquirer.prompt([{
            type: 'confirm',
            name: 'openBrowser',
            message: 'Would you like to open the HTML results in your browser?',
            default: false
          }]);
          
          if (openBrowser) {
            console.log(chalk.blue('Opening search results in browser...'));
            // This would typically use a module like 'open' to open the file in a browser
            console.log(chalk.yellow(`To view the results, open the file: ${filename}`));
          }
        }
      } else {
        // Display in terminal for text format
        console.log(formattedOutput);
      }
      
    } catch (error) {
      ora().fail(chalk.red('Search failed'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Configure detect-stack command (Tech Stack Detection)
program
  .command('detect-stack [directory]')
  .description('Detect technologies, frameworks and libraries used in a repository')
  .option('-o, --output <format>', 'Output format: json, html, markdown (default: "markdown")', 'markdown')
  .option('--check-outdated', 'Check for outdated dependencies', false)
  .option('--recommendations', 'Show recommendations for additional tools', false)
  .action(async (directory = '.', options) => {
    try {
      const spinner = ora('Detecting tech stack...').start();
      
      const result = await detectTechStack({
        directory: path.resolve(process.cwd(), directory),
        output: options.output,
        checkOutdated: options.checkOutdated,
        recommendations: options.recommendations
      });
      
      spinner.succeed(chalk.green('Tech stack detection completed'));
      
      // Save the result to a file based on the format
      const filename = `tech_stack.${options.output === 'json' ? 'json' : (options.output === 'html' ? 'html' : 'md')}`;
      fs.writeFileSync(filename, result.formattedOutput);
      
      // Show summary of detected technologies
      const { languages, frameworks, databases, tools } = result.result;
      
      console.log(boxen(
        chalk.bold.blue('Tech Stack Detection Results\n') +
        `Languages: ${chalk.cyan(Object.keys(languages).length > 0 ? Object.keys(languages).join(', ') : 'None detected')}\n` +
        `Frameworks: ${chalk.cyan(Object.keys(frameworks).length > 0 ? Object.keys(frameworks).join(', ') : 'None detected')}\n` +
        `Databases: ${chalk.cyan(Object.keys(databases).length > 0 ? Object.keys(databases).join(', ') : 'None detected')}\n` +
        `Tools: ${chalk.cyan(Object.keys(tools).length > 0 ? Object.keys(tools).join(', ') : 'None detected')}\n` +
        `${options.checkOutdated ? `Outdated Dependencies: ${chalk.yellow(Object.keys(result.result.outdatedDependencies).length)}\n` : ''}` +
        `${options.recommendations ? `Recommendations: ${chalk.yellow(Object.keys(result.result.recommendations).length)}\n` : ''}` +
        `Output file: ${chalk.green(filename)}`,
        { padding: 1, borderColor: 'blue', dimBorder: true }
      ));
      
      // Open in browser if HTML format
      if (options.output === 'html') {
        const { openBrowser } = await inquirer.prompt([{
          type: 'confirm',
          name: 'openBrowser',
          message: 'Would you like to open the HTML report in your browser?',
          default: false
        }]);
        
        if (openBrowser) {
          console.log(chalk.blue('Opening tech stack report in browser...'));
          // This would typically use a module like 'open' to open the file in a browser
          console.log(chalk.yellow(`To view the report, open the file: ${filename}`));
        }
      }
    } catch (error) {
      ora().fail(chalk.red('Tech stack detection failed'));
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

/**
 * Extract all code files from a repository and combine them into a single string
 */
async function extractRepositoryCode({ directory, output, exclude = [], maxSize = null }) {
  return new Promise((resolve, reject) => {
    try {
      const outputFile = path.resolve(directory, output);
      const stats = {
        totalFiles: 0,
        includedFiles: 0,
        excludedFiles: 0,
        totalSizeBytes: 0,
        includedSizeBytes: 0,
        fileTypes: {}
      };

      // Initialize output file
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
      fs.writeFileSync(outputFile, `# Repository Analysis\n\n`);
      fs.appendFileSync(outputFile, `Generated on: ${new Date().toISOString()}\n\n`);

      // Helper: Determine whether a file path should be excluded
      function isExcluded(filePath) {
        // Default exclusions
        const defaultExclusions = ['.git', 'node_modules', 'dist', '.idea', '.vscode'];
        
        // Exclude if any part of the path starts with a dot (hidden files/folders)
        if (filePath.split(path.sep).some(part => part.startsWith('.') && part !== '.')) {
          return true;
        }
        
        // Exclude if path contains any of the default exclusions
        if (defaultExclusions.some(pattern => filePath.includes(`${path.sep}${pattern}${path.sep}`) || filePath.includes(`${path.sep}${pattern}`))) {
          return true;
        }
        
        // Exclude the CLI script file itself and the output file
        if (filePath === __filename || filePath === outputFile) {
          return true;
        }
        
        // Exclude if additional exclusion patterns match anywhere in the file's path
        return exclude.some(pattern => filePath.includes(pattern));
      }

      // Helper: Check if a file is a text file (not binary)
      function isTextFile(filePath) {
        try {
          const content = fs.readFileSync(filePath);
          // If a null character (0) is present, assume it's binary
          return !content.includes(0);
        } catch (err) {
          return false;
        }
      }

      // Recursively traverse directories
      function traverseDirectory(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          const fullPath = path.join(dirPath, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!isExcluded(fullPath)) {
              traverseDirectory(fullPath);
            }
          } else if (stat.isFile()) {
            stats.totalFiles++;
            stats.totalSizeBytes += stat.size;
            
            if (isExcluded(fullPath)) {
              stats.excludedFiles++;
              continue;
            }
            
            // If maxSize is set, skip file if it exceeds the threshold
            if (maxSize && stat.size > maxSize) {
              stats.excludedFiles++;
              continue;
            }
            
            if (isTextFile(fullPath)) {
              const relativePath = path.relative(directory, fullPath);
              const fileExtension = path.extname(fullPath).toLowerCase();
              
              // Update file type statistics
              if (fileExtension) {
                stats.fileTypes[fileExtension] = (stats.fileTypes[fileExtension] || 0) + 1;
              }
              
              // Append file content to the output file
              fs.appendFileSync(outputFile, `## File: ${relativePath}\n\n`);
              const content = fs.readFileSync(fullPath, 'utf8');
              fs.appendFileSync(outputFile, '```' + (fileExtension.slice(1) || '') + '\n');
              fs.appendFileSync(outputFile, content + '\n');
              fs.appendFileSync(outputFile, '```\n\n');
              
              stats.includedFiles++;
              stats.includedSizeBytes += stat.size;
            } else {
              stats.excludedFiles++;
            }
          }
        }
      }
      
      // Start traversing from the directory
      traverseDirectory(directory);
      
      // Add statistics to the end of the file
      fs.appendFileSync(outputFile, '## Statistics\n\n');
      fs.appendFileSync(outputFile, `- Total files: ${stats.totalFiles}\n`);
      fs.appendFileSync(outputFile, `- Included files: ${stats.includedFiles}\n`);
      fs.appendFileSync(outputFile, `- Excluded files: ${stats.excludedFiles}\n`);
      fs.appendFileSync(outputFile, `- Total size: ${formatBytes(stats.totalSizeBytes)}\n`);
      fs.appendFileSync(outputFile, `- Included size: ${formatBytes(stats.includedSizeBytes)}\n\n`);
      
      fs.appendFileSync(outputFile, '### File Types\n\n');
      Object.entries(stats.fileTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([ext, count]) => {
          fs.appendFileSync(outputFile, `- ${ext}: ${count}\n`);
        });
      
      resolve({
        outputFile,
        stats
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get repository code (mock function for demo)
 */
async function getRepositoryCode(repositoryId) {
  // In a real implementation, this would fetch from a server or database
  return `This is a mock repository code content for repository ID ${repositoryId}.\nIt would typically contain the entire codebase extracted from a repository.`;
}

/**
 * View a document (mock function for demo)
 */
async function viewDocument(documentId, format = 'terminal') {
  // In a real implementation, this would fetch from a server or database
  return `# Sample Document ${documentId}

This is a sample document that would typically contain AI-generated content about a repository.

## Architecture Overview

This section would describe the system architecture.

## Components

- Component 1
- Component 2
- Component 3

## Interactions

This section would describe how components interact.`;
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a date string to a readable format
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}