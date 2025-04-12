/**
 * RepoScraper CLI - OpenAI Utilities
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
    const openai = new OpenAI({ apiKey });
    
    // Make a small request to verify the API key
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "user", content: "This is a test message to verify the API key." }
      ],
      max_tokens: 10,
    });
    
    return !!response.choices && response.choices.length > 0;
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
  const openai = new OpenAI({ apiKey });
  const spinner = ora('Analyzing codebase architecture...').start();
  
  try {
    const prompt = `
    Please analyze the following repository code and generate a comprehensive architectural documentation.
    Focus on the overall structure, key components, design patterns, and how different parts of the system interact.
    Format the output as markdown with proper headings, code blocks, and bullet points as needed.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an experienced software architect who specializes in creating clear, detailed architectural documentation." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('Architectural documentation generated successfully'));
    return response.choices[0].message.content || "Failed to generate documentation";
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
  const openai = new OpenAI({ apiKey });
  const spinner = ora('Generating user stories...').start();
  
  try {
    const prompt = `
    Please analyze the following repository code and generate user stories that describe the functionality from an end-user perspective.
    Include acceptance criteria for each story when possible.
    Format the output as markdown with proper headings and structure.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a product manager who specializes in creating detailed user stories from technical implementations." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('User stories generated successfully'));
    return response.choices[0].message.content || "Failed to generate user stories";
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
  const openai = new OpenAI({ apiKey });
  const spinner = ora('Generating custom analysis...').start();
  
  try {
    const prompt = `
    Please analyze the following repository code and respond to this specific request:
    
    ${customPrompt}
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an AI assistant specialized in code analysis and documentation generation." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    spinner.succeed(chalk.green('Custom analysis generated successfully'));
    return response.choices[0].message.content || "Failed to generate custom analysis";
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate custom analysis'));
    console.error(chalk.red(`Error: ${error.message}`));
    throw error;
  }
}

/**
 * Get OpenAI API key from environment or user input
 * @param {string} providedKey - The key provided by the user via CLI
 * @returns {string|null} - The API key or null if not found
 */
function getOpenAIKey(providedKey) {
  return providedKey || process.env.OPENAI_API_KEY || null;
}

module.exports = {
  validateApiKey,
  generateArchitecturalDoc,
  generateUserStories,
  generateCustomAnalysis,
  getOpenAIKey
};