/**
 * CodeInsight AI - OpenAI Utilities
 * 
 * This file contains utilities for interacting with the OpenAI API
 */

const axios = require('axios');
const { OpenAI } = require('openai');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');

/**
 * Validate OpenAI API key
 * @param {string} apiKey - The OpenAI API key to validate
 * @returns {Promise<boolean>} - True if the API key is valid
 */
async function validateApiKey(apiKey) {
  try {
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Make a small request to verify the API key
    const response = await openai.createChatCompletion({
      model: "gpt-4", 
      messages: [
        { role: "user", content: "This is a test message to verify the API key." }
      ],
      max_tokens: 10,
    });
    
    return !!response.data.choices && response.data.choices.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Generate architectural documentation
 * @param {string} codeContent - The code content to analyze
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} - The generated documentation
 */
async function generateArchitecturalDoc(codeContent, apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey
  });
  const spinner = ora('Analyzing codebase architecture...').start();
  
  try {
    const prompt = `
    Please analyze the following repository code and generate a comprehensive architectural documentation.
    Focus on the overall structure, key components, design patterns, and how different parts of the system interact.
    Format the output as markdown with proper headings, code blocks, and bullet points as needed.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;
    
    const systemMessage = "You are an experienced software architect who specializes in creating clear, detailed architectural documentation.";

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('Architectural documentation generated successfully'));
    return response.data.choices[0].message.content || "Failed to generate documentation";
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate architectural documentation'));
    console.error(chalk.red(`Error: ${error.message}`));
    throw error;
  }
}

/**
 * Generate user stories from repository code
 * @param {string} codeContent - The code content to analyze
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} - The generated user stories
 */
async function generateUserStories(codeContent, apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey
  });
  const spinner = ora('Generating user stories...').start();
  
  try {
    const prompt = `
    Please analyze the following repository code and generate user stories that describe the functionality from an end-user perspective.
    Include acceptance criteria for each story when possible.
    Format the output as markdown with proper headings and structure.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;
    
    const systemMessage = "You are a product manager who specializes in creating detailed user stories from technical implementations.";

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('User stories generated successfully'));
    return response.data.choices[0].message.content || "Failed to generate user stories";
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate user stories'));
    console.error(chalk.red(`Error: ${error.message}`));
    throw error;
  }
}

/**
 * Generate custom analysis based on specific prompts
 * @param {string} codeContent - The code content to analyze
 * @param {string} customPrompt - The custom prompt to use
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} - The generated analysis
 */
async function generateCustomAnalysis(codeContent, customPrompt, apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey
  });
  const spinner = ora('Generating custom analysis...').start();
  
  try {
    const prompt = `
    Please analyze the following repository code and respond to this specific request:
    
    ${customPrompt}
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;
    
    const systemMessage = "You are an AI assistant specialized in code analysis and documentation generation.";

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('Custom analysis generated successfully'));
    return response.data.choices[0].message.content || "Failed to generate custom analysis";
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate custom analysis'));
    console.error(chalk.red(`Error: ${error.message}`));
    throw error;
  }
}

/**
 * Generate a narrative story that explains complex code structures
 * @param {string} codeContent - The code content to analyze
 * @param {string} complexity - The complexity level (simple, moderate, detailed)
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} - The generated code story
 */
async function generateCodeStory(codeContent, complexity = 'moderate', apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey
  });
  const spinner = ora('Generating code story...').start();
  
  try {
    // Customize the prompt based on complexity level
    let detailLevel = '';
    switch(complexity) {
      case 'simple':
        detailLevel = 'Keep explanations simple and beginner-friendly, focusing on high-level concepts rather than implementation details.';
        break;
      case 'moderate':
        detailLevel = 'Balance technical details with narrative storytelling, making the code approachable to intermediate programmers.';
        break;
      case 'detailed':
        detailLevel = 'Include detailed explanations of algorithms, patterns, and technical concepts, suitable for experienced developers.';
        break;
      default:
        detailLevel = 'Balance technical details with narrative storytelling, making the code approachable to intermediate programmers.';
        break;
    }

    const prompt = `
    Please analyze the following code and create a narrative "Code Story" that explains the complex structures and logic in an engaging, storytelling format.
    ${detailLevel}
    
    Use analogies, metaphors, and storytelling elements to make the code understandable.
    Focus on the "why" behind design decisions, not just the "what" and "how".
    Format the output as markdown with proper headings, code blocks for key examples, and narrative sections.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;
    
    const systemMessage = "You are a master programmer and storyteller who excels at explaining complex code through narrative storytelling.";

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('Code story generated successfully'));
    return response.data.choices[0].message.content || "Failed to generate code story";
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate code story'));
    console.error(chalk.red(`Error: ${error.message}`));
    throw error;
  }
}

/**
 * Get OpenAI API key from environment or user input
 * @param {string} providedKey - The key provided by the user via CLI
 * @param {boolean} interactive - Whether to prompt the user for input if key not found
 * @returns {Promise<string|null>} - The API key or null if not found
 */
async function getOpenAIKey(providedKey, interactive = true) {
  // Check command line arg first
  if (providedKey) {
    return providedKey;
  }
  
  // Then check environment variable
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // Check config file
  try {
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    const configPath = path.join(os.homedir(), '.vibeinsights');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.apiKey) {
        return config.apiKey;
      }
    }
  } catch (error) {
    // Ignore config file errors
  }
  
  // If interactive mode is enabled, prompt the user
  if (interactive) {
    try {
      const inquirer = require('inquirer');
      
      console.log(chalk.yellow('\n🔑 OpenAI API Key Required'));
      console.log(chalk.gray('This command requires an OpenAI API key to function.'));
      console.log(chalk.gray('Your key will only be used for this session and not stored unless you specify.'));
      
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your OpenAI API key:',
          validate: (input) => input.length > 0 ? true : 'API key is required for this operation'
        },
        {
          type: 'confirm',
          name: 'saveKey',
          message: 'Would you like to save this key for future use? (Saved to ~/.vibeinsights)',
          default: false
        }
      ]);
      
      // Save the key if requested
      if (answers.saveKey) {
        try {
          const os = require('os');
          const path = require('path');
          const fs = require('fs');
          const configPath = path.join(os.homedir(), '.codeinsight');
          
          const config = fs.existsSync(configPath) 
            ? JSON.parse(fs.readFileSync(configPath, 'utf8')) 
            : {};
          
          config.apiKey = answers.apiKey;
          
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
          console.log(chalk.green('✓ API key saved to ~/.codeinsight'));
        } catch (error) {
          console.log(chalk.red(`Failed to save API key: ${error.message}`));
        }
      }
      
      return answers.apiKey;
    } catch (error) {
      console.log(chalk.red(`Error prompting for API key: ${error.message}`));
      return null;
    }
  }
  
  // If we get here, no key was found and interactive mode is disabled
  return null;
}

module.exports = {
  validateApiKey,
  generateArchitecturalDoc,
  generateUserStories,
  generateCustomAnalysis,
  generateCodeStory,
  getOpenAIKey
};