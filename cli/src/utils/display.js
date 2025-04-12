/**
 * Vibe Insights AI - Display Utilities
 * 
 * This file contains utilities for displaying information to the user
 */

const chalk = require('chalk');
const boxen = require('boxen');
const figlet = require('figlet');

/**
 * Generate ASCII art logo
 * @returns {string} ASCII art logo
 */
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

/**
 * Display application header/branding
 */
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
 * Apply colorization to complexity values
 * @param {number} value - The complexity value
 * @param {number} threshold - The threshold for colorization
 * @returns {string} Colorized string
 */
function getColorForComplexity(value, threshold) {
  if (value < threshold * 0.5) return chalk.green(value);
  if (value < threshold) return chalk.yellow(value);
  return chalk.red(value);
}

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - The bytes to format
 * @param {number} decimals - The number of decimal places
 * @returns {string} Formatted string
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
 * @param {string} dateString - The date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Handle errors gracefully
 * @param {Error} error - The error object
 * @param {string} message - Optional custom message
 */
function handleError(error, message = 'An error occurred') {
  console.error(chalk.red(`\n${message}:`));
  console.error(chalk.red(error.message));
  process.exit(1);
}

module.exports = {
  generateLogo,
  displayHeader,
  displayInlineHeader,
  getColorForComplexity,
  formatBytes,
  formatDate,
  handleError
};