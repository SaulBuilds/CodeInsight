#!/usr/bin/env node

/**
 * Test script for repo-scraper-cli
 * 
 * This script demonstrates how to use the RepoScraper CLI programmatically,
 * without needing to install it globally.
 */

// Import the necessary modules
const { program } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const { VERSION, VERSION_INFO } = require('./version');

console.log(boxen(
  chalk.blue.bold('RepoScraper CLI Test Script\n\n') +
  chalk.white(`Version: ${VERSION}\n`) +
  chalk.white(`Release Date: ${VERSION_INFO.releaseDate}\n\n`) +
  chalk.dim('This script demonstrates how to use the RepoScraper CLI programmatically.'),
  { padding: 1, borderColor: 'blue', dimBorder: true }
));

// Example of programmatically extracting repository code
console.log(chalk.yellow('\nExample 1: Extracting repository code'));
console.log(chalk.dim('----------------------------------'));

try {
  console.log(chalk.green('✓ Importing extract function'));
  const { extractRepositoryCode } = require('./index');
  
  console.log(chalk.green('✓ Setting up test parameters'));
  const testOptions = {
    directory: process.cwd(),
    output: 'test_output.md',
    exclude: ['node_modules', 'dist', '.git'],
    maxSize: 1024 * 100 // 100KB max file size
  };
  
  console.log(chalk.dim(`\nTo run this test for real, uncomment the following code in ${__filename}:`));
  console.log(chalk.white(`
/*
  console.log(chalk.cyan('Analyzing repository...'));
  extractRepositoryCode(testOptions)
    .then(result => {
      console.log(chalk.green('✓ Repository analysis complete'));
      console.log(chalk.white(\`Files included: \${result.stats.includedFiles}\`));
      console.log(chalk.white(\`Output: \${result.outputFile}\`));
    })
    .catch(error => {
      console.error(chalk.red(\`Error: \${error.message}\`));
    });
*/`));
} catch (error) {
  console.error(chalk.red(`Error: ${error.message}`));
}

// Example of API integration
console.log(chalk.yellow('\nExample 2: OpenAI Integration'));
console.log(chalk.dim('----------------------------------'));

try {
  console.log(chalk.green('✓ Importing OpenAI utilities'));
  const { validateApiKey, generateArchitecturalDoc } = require('./openai-utils');
  
  console.log(chalk.dim(`\nTo test OpenAI integration, uncomment the following code in ${__filename}:`));
  console.log(chalk.white(`
/*
  // You would provide a valid OpenAI API key here
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  
  // Sample code content (would typically come from extractRepositoryCode)
  const sampleCode = \`
  function hello() {
    console.log("Hello, world!");
  }
  \`;
  
  console.log(chalk.cyan('Validating API key...'));
  validateApiKey(apiKey)
    .then(isValid => {
      if (isValid) {
        console.log(chalk.green('✓ API key is valid'));
        
        console.log(chalk.cyan('Generating documentation...'));
        return generateArchitecturalDoc(sampleCode, apiKey);
      } else {
        throw new Error('Invalid API key');
      }
    })
    .then(documentation => {
      console.log(chalk.green('✓ Documentation generated successfully'));
      console.log(chalk.white(documentation.substring(0, 200) + '...'));
    })
    .catch(error => {
      console.error(chalk.red(\`Error: \${error.message}\`));
    });
*/`));
} catch (error) {
  console.error(chalk.red(`Error: ${error.message}`));
}

console.log(chalk.yellow('\nTest script completed'));