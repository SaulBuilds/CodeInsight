/**
 * Vibe Insights AI - File Utilities
 * 
 * This file contains utilities for file operations
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { formatBytes } = require('./display');
const ora = require('ora');
const chalk = require('chalk');

/**
 * Check if a file should be excluded based on patterns
 * @param {string} filePath - Path to the file
 * @param {string} directory - Base directory
 * @param {string[]} exclude - Patterns to exclude
 * @returns {boolean} Whether the file should be excluded
 */
function isExcluded(filePath, directory, exclude) {
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

/**
 * Check if a file is a text file
 * @param {string} filePath - Path to the file
 * @returns {boolean} Whether the file is a text file
 */
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

/**
 * Extract all code files from a repository and combine them into a single string
 * @param {Object} options - Options for extraction
 * @param {string} options.directory - Directory to extract from
 * @param {string} [options.output] - Output file path
 * @param {string[]} [options.exclude=[]] - Patterns to exclude
 * @param {number} [options.maxSize=null] - Maximum file size in bytes
 * @returns {Promise<string>} The extracted code
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
    
    // Recursive directory traversal
    function traverseDirectory(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (isExcluded(fullPath, directory, exclude)) continue;
        
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
    throw error;
  }
}

module.exports = {
  isExcluded,
  isTextFile,
  extractRepositoryCode
};