/**
 * Vibe Insights AI - OpenAI Integration
 * 
 * This file contains utilities for interacting with OpenAI's API.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { OPENAI_MODEL } = require('../utils/constants');

// OpenAI API configuration
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

/**
 * Validate an OpenAI API key
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<boolean>} Whether the key is valid
 */
async function validateApiKey(apiKey) {
  if (!apiKey) return false;

  try {
    const response = await axios.get(`${OPENAI_API_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Get OpenAI API key from user input or environment
 * @param {string} providedKey - The key provided by the user (optional)
 * @returns {Promise<string>} The API key
 */
async function getOpenAIKey(providedKey = '') {
  // If key is provided, use it
  if (providedKey) {
    return providedKey;
  }

  // Check environment variable
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) {
    return envKey;
  }

  // If not provided and not in environment, prompt user
  console.log(chalk.yellow('\nOpenAI API key not found in environment.'));
  
  const { useKeyNow } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useKeyNow',
      message: 'Would you like to provide an OpenAI API key now?',
      default: true,
    },
  ]);

  if (!useKeyNow) {
    console.log(chalk.red('OpenAI API key is required for this operation.'));
    return null;
  }

  const { apiKey, saveKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your OpenAI API key:',
      validate: (input) => input.length > 0 ? true : 'API key is required',
    },
    {
      type: 'confirm',
      name: 'saveKey',
      message: 'Save this key for future use? (will be stored in environment variable)',
      default: false,
    },
  ]);

  if (saveKey) {
    console.log(chalk.green('To permanently save your API key, add it to your environment:'));
    console.log(chalk.cyan('export OPENAI_API_KEY=your-api-key'));
  }

  return apiKey;
}

/**
 * Call OpenAI API with custom prompt
 * @param {Object} options - Options for the API call
 * @param {string} options.prompt - The prompt to send to the API
 * @param {string} options.apiKey - The API key to use
 * @param {string} options.model - The model to use
 * @param {number} options.maxTokens - Maximum tokens to generate
 * @param {number} options.temperature - Temperature for sampling
 * @returns {Promise<string>} The API response
 */
async function callOpenAI({
  prompt,
  apiKey,
  model = OPENAI_MODEL,
  maxTokens = 4000,
  temperature = 0.7,
}) {
  try {
    const response = await axios.post(
      `${OPENAI_API_BASE_URL}/chat/completions`,
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a technical documentation generator for codebases. Provide detailed, accurate, and well-structured information about the code being analyzed.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
    } else {
      throw new Error(`Error calling OpenAI API: ${error.message}`);
    }
  }
}

/**
 * Generate architectural documentation
 * @param {string} codeContent - The code content to analyze
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} The generated documentation
 */
async function generateArchitecturalDoc(codeContent, apiKey) {
  const prompt = `
# Architecture Documentation Generator

Please analyze the following codebase and generate comprehensive architectural documentation. Focus on:

1. **High-level architecture overview**
2. **Core components and their relationships**
3. **Design patterns used**
4. **Data flow between components**
5. **Key abstractions and interfaces**
6. **System boundaries and external integrations**
7. **Scalability and performance considerations**

Format the documentation in Markdown with clear headings, diagrams descriptions, and examples where helpful.

## Code to Analyze:

\`\`\`
${codeContent}
\`\`\`

Generate detailed architecture documentation based on this code.
`;

  return await callOpenAI({
    prompt,
    apiKey,
    temperature: 0.5,
  });
}

/**
 * Generate user stories from code
 * @param {string} codeContent - The code content to analyze
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} The generated documentation
 */
async function generateUserStories(codeContent, apiKey) {
  const prompt = `
# User Stories Generator

Please analyze the following codebase and extract potential user stories. For each feature or functionality identified:

1. **Create a user story in the format: "As a [user type], I want [action/goal] so that [benefit]"**
2. **Identify acceptance criteria for each story**
3. **Group related stories by feature area or user type**
4. **Estimate relative complexity (simple, moderate, complex)**

Format the output in Markdown with clear headings and bullet points.

## Code to Analyze:

\`\`\`
${codeContent}
\`\`\`

Generate comprehensive user stories based on this code.
`;

  return await callOpenAI({
    prompt,
    apiKey,
    temperature: 0.6,
  });
}

/**
 * Generate custom analysis
 * @param {string} codeContent - The code content to analyze
 * @param {string} customPrompt - The custom prompt
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} The generated documentation
 */
async function generateCustomAnalysis(codeContent, customPrompt, apiKey) {
  const prompt = `
# Custom Code Analysis

${customPrompt}

## Code to Analyze:

\`\`\`
${codeContent}
\`\`\`

Generate analysis based on the instructions and this code.
`;

  return await callOpenAI({
    prompt,
    apiKey,
    temperature: 0.7,
  });
}

/**
 * Generate a code story (narrative explanation)
 * @param {string} codeContent - The code content to analyze
 * @param {string} complexity - The complexity level (simple, moderate, detailed)
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<string>} The generated documentation
 */
async function generateCodeStory(codeContent, complexity, apiKey) {
  let detailLevel, audience, technicalDepth;

  switch (complexity) {
    case 'simple':
      detailLevel = 'high-level concepts and main functionality';
      audience = 'non-technical or junior developers';
      technicalDepth = 'minimal technical jargon and simplified explanations';
      break;
    case 'moderate':
      detailLevel = 'balanced overview with some implementation details';
      audience = 'intermediate developers';
      technicalDepth = 'moderate technical depth with some architectural concepts';
      break;
    case 'detailed':
      detailLevel = 'in-depth analysis of implementation details, edge cases, and design decisions';
      audience = 'experienced developers familiar with the technologies used';
      technicalDepth = 'deep technical insights, performance considerations, and architectural patterns';
      break;
    default:
      detailLevel = 'balanced overview with some implementation details';
      audience = 'intermediate developers';
      technicalDepth = 'moderate technical depth with some architectural concepts';
  }

  const prompt = `
# Code Story Generator

Create a narrative explanation of the following codebase, focusing on ${detailLevel}. 
Target audience: ${audience}.
Technical depth: ${technicalDepth}.

The narrative should:
1. Tell the "story" of how this code works from a conceptual perspective
2. Explain why certain design decisions were made
3. Use metaphors and analogies to explain complex concepts where appropriate
4. Follow a logical progression that helps the reader build a mental model
5. Highlight important patterns and relationships between components

Format as a Markdown document with clear headings, code examples, and diagrams descriptions where helpful.

## Code to Analyze:

\`\`\`
${codeContent}
\`\`\`

Generate a ${complexity} complexity narrative explanation of this code.
`;

  return await callOpenAI({
    prompt,
    apiKey,
    temperature: 0.7,
  });
}

module.exports = {
  validateApiKey,
  getOpenAIKey,
  callOpenAI,
  generateArchitecturalDoc,
  generateUserStories,
  generateCustomAnalysis,
  generateCodeStory
};