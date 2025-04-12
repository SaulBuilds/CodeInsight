/**
 * CodeInsight AI - Natural Language Search
 * 
 * This file contains utilities for searching code using natural language queries
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const OpenAI = require('openai');

/**
 * Perform semantic search on a codebase using natural language
 * @param {Object} options - Search options
 * @param {string} options.query - Natural language query
 * @param {string} options.directory - Directory to search
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.context - Lines of context to show
 * @param {string} options.apiKey - OpenAI API key
 * @param {boolean} options.useEmbeddings - Whether to use embeddings for semantic search
 * @returns {Promise<Object>} - Search results
 */
async function searchCodebase(options) {
  const {
    query,
    directory = '.',
    limit = 10,
    context = 3,
    apiKey,
    useEmbeddings = true
  } = options;

  // Find all code files
  const files = await findCodeFiles(directory);
  
  // If no files found, return early
  if (files.length === 0) {
    return {
      query,
      results: [],
      message: 'No code files found in the specified directory.'
    };
  }

  // Choose the search method based on options
  let searchResults;
  if (useEmbeddings && apiKey) {
    searchResults = await performSemanticSearch(files, query, limit, directory, apiKey);
  } else {
    searchResults = await performSimpleSearch(files, query, limit, directory);
  }

  // Add context to the results
  const resultsWithContext = await addContextToResults(searchResults, context);

  return {
    query,
    results: resultsWithContext,
    resultCount: resultsWithContext.length,
    semanticSearch: useEmbeddings && apiKey
  };
}

/**
 * Find all code files in a directory
 * @param {string} directory - Directory to search
 * @returns {Promise<string[]>} - List of file paths
 */
async function findCodeFiles(directory) {
  return new Promise((resolve, reject) => {
    const pattern = '**/*.{js,jsx,ts,tsx,py,java,go,rb,php,c,cpp,cs,html,css,json,md}';
    const options = {
      cwd: directory,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/package-lock.json',
        '**/yarn.lock'
      ],
      absolute: true
    };

    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

/**
 * Perform semantic search using OpenAI embeddings
 * @param {string[]} files - List of file paths
 * @param {string} query - Natural language query
 * @param {number} limit - Maximum number of results
 * @param {string} baseDir - Base directory for relative paths
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object[]>} - Search results
 */
async function performSemanticSearch(files, query, limit, baseDir, apiKey) {
  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey });
  
  // Get embedding for the query
  const queryEmbedding = await getEmbedding(query, openai);
  
  // Process files in batches to avoid memory issues
  const batchSize = 50;
  let allResults = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await processBatch(batch, queryEmbedding, baseDir, openai);
    allResults = allResults.concat(batchResults);
  }
  
  // Sort by similarity score (descending) and take the top results
  return allResults
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Process a batch of files for semantic search
 * @param {string[]} files - Batch of file paths
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {string} baseDir - Base directory for relative paths
 * @param {Object} openai - OpenAI client
 * @returns {Promise<Object[]>} - Search results
 */
async function processBatch(files, queryEmbedding, baseDir, openai) {
  const results = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(baseDir, file);
    
    // Skip empty files or very large files
    if (!content.trim() || content.length > 100000) continue;
    
    // Split file into chunks of code
    const chunks = splitIntoChunks(content);
    
    for (const [chunk, lineStart, lineEnd] of chunks) {
      // Skip very small chunks
      if (chunk.length < 50) continue;
      
      // Get embedding for this chunk
      const embedding = await getEmbedding(chunk, openai);
      
      // Calculate cosine similarity
      const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
      
      // If the similarity is above a threshold, add to results
      if (similarity > 0.7) {
        results.push({
          file: relativePath,
          lineStart,
          lineEnd,
          content: chunk,
          similarity
        });
      }
    }
  }
  
  return results;
}

/**
 * Split file content into reasonably sized chunks of code
 * @param {string} content - File content
 * @returns {Array} - Array of [chunk, lineStart, lineEnd] tuples
 */
function splitIntoChunks(content) {
  const lines = content.split('\n');
  const chunks = [];
  const chunkSize = 30; // Lines per chunk
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n');
    chunks.push([chunk, i + 1, Math.min(i + chunkSize, lines.length)]);
  }
  
  return chunks;
}

/**
 * Get embedding for a text using OpenAI API
 * @param {string} text - Text to embed
 * @param {Object} openai - OpenAI client
 * @returns {Promise<number[]>} - Embedding vector
 */
async function getEmbedding(text, openai) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error(chalk.red(`Error getting embedding: ${error.message}`));
    // Return a zero vector as fallback
    return Array(1536).fill(0);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Cosine similarity
 */
function calculateCosineSimilarity(vec1, vec2) {
  // Check if vectors have the same dimension
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  // Calculate magnitudes
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  // Return cosine similarity
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (norm1 * norm2);
}

/**
 * Perform simple keyword-based search
 * @param {string[]} files - List of file paths
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Promise<Object[]>} - Search results
 */
async function performSimpleSearch(files, query, limit, baseDir) {
  const results = [];
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(baseDir, file);
      
      // Check each line for keyword matches
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        // Calculate a simple match score based on keyword occurrences
        let matchScore = 0;
        for (const keyword of keywords) {
          if (line.includes(keyword)) {
            matchScore += 1;
          }
        }
        
        if (matchScore > 0) {
          results.push({
            file: relativePath,
            lineStart: i + 1,
            lineEnd: i + 1,
            content: lines[i],
            similarity: matchScore / keywords.length // Normalize to a 0-1 scale
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }
  
  // Sort by match score (descending) and take the top results
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Add context lines to search results
 * @param {Object[]} results - Search results
 * @param {number} contextLines - Number of context lines
 * @returns {Promise<Object[]>} - Results with context
 */
async function addContextToResults(results, contextLines) {
  for (const result of results) {
    try {
      const content = fs.readFileSync(result.file, 'utf8');
      const lines = content.split('\n');
      
      // Calculate context range
      const startLine = Math.max(0, result.lineStart - contextLines - 1);
      const endLine = Math.min(lines.length - 1, result.lineEnd + contextLines - 1);
      
      // Extract context
      const contextContent = lines.slice(startLine, endLine + 1).join('\n');
      
      // Update result
      result.lineStart = startLine + 1;
      result.lineEnd = endLine + 1;
      result.content = contextContent;
      result.highlightStart = result.lineStart;
      result.highlightEnd = result.lineEnd;
    } catch (error) {
      // Keep the original content if there's an error
      continue;
    }
  }
  
  return results;
}

/**
 * Generate formatted output for search results
 * @param {Object} searchResults - Search results
 * @param {string} format - Output format (text, json, html)
 * @returns {string} - Formatted output
 */
function formatSearchResults(searchResults, format = 'text') {
  const { query, results, resultCount, semanticSearch } = searchResults;
  
  switch (format) {
    case 'json':
      return JSON.stringify(searchResults, null, 2);
      
    case 'html':
      return generateHtmlOutput(searchResults);
      
    case 'text':
    default:
      let output = chalk.green(`Search results for: "${query}"\n`);
      output += chalk.green(`Found ${resultCount} matches using ${semanticSearch ? 'semantic' : 'keyword'} search.\n\n`);
      
      if (resultCount === 0) {
        output += chalk.yellow('No matches found.');
        return output;
      }
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        output += chalk.blue(`[${i + 1}] ${result.file}:${result.highlightStart}-${result.highlightEnd}`);
        output += ` (score: ${result.similarity.toFixed(2)})\n`;
        
        // Split the content into lines
        const lines = result.content.split('\n');
        
        // Add line numbers and highlight the matching lines
        for (let j = 0; j < lines.length; j++) {
          const lineNum = result.lineStart + j;
          const isHighlighted = lineNum >= result.highlightStart && lineNum <= result.highlightEnd;
          
          const lineNumStr = ` ${lineNum}`.padStart(5, ' ');
          output += isHighlighted 
            ? chalk.yellow(`${lineNumStr} | ${lines[j]}\n`) 
            : chalk.gray(`${lineNumStr} | ${lines[j]}\n`);
        }
        
        output += '\n';
      }
      
      return output;
  }
}

/**
 * Generate HTML output for search results
 * @param {Object} searchResults - Search results
 * @returns {string} - HTML output
 */
function generateHtmlOutput(searchResults) {
  const { query, results, resultCount, semanticSearch } = searchResults;
  
  let resultsHtml = '';
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const lines = result.content.split('\n');
    
    let linesHtml = '';
    for (let j = 0; j < lines.length; j++) {
      const lineNum = result.lineStart + j;
      const isHighlighted = lineNum >= result.highlightStart && lineNum <= result.highlightEnd;
      
      const escapedLine = lines[j]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      const lineClass = isHighlighted ? 'highlighted' : '';
      linesHtml += `<tr class="${lineClass}">
        <td class="line-number">${lineNum}</td>
        <td class="line-content">${escapedLine}</td>
      </tr>\n`;
    }
    
    resultsHtml += `
      <div class="result">
        <div class="result-header">
          <h3>${result.file}</h3>
          <span class="lines">Lines ${result.lineStart}-${result.lineEnd}</span>
          <span class="score">Score: ${result.similarity.toFixed(2)}</span>
        </div>
        <div class="code-container">
          <table class="code">
            <tbody>${linesHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeInsight AI - Search Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    
    h1, h2, h3 {
      color: #0077cc;
    }
    
    .query-info {
      background-color: #e9f5ff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
      border-left: 5px solid #0077cc;
    }
    
    .result {
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      overflow: hidden;
    }
    
    .result-header {
      background-color: #f8f9fa;
      padding: 10px 15px;
      border-bottom: 1px solid #e1e4e8;
      display: flex;
      align-items: center;
    }
    
    .result-header h3 {
      margin: 0;
      flex: 1;
      font-size: 16px;
      font-weight: 600;
    }
    
    .lines, .score {
      font-size: 14px;
      color: #666;
      margin-left: 15px;
    }
    
    .score {
      font-weight: 600;
      color: #0077cc;
    }
    
    .code-container {
      overflow-x: auto;
      background-color: #f6f8fa;
    }
    
    .code {
      width: 100%;
      border-collapse: collapse;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      line-height: 1.5;
    }
    
    .line-number {
      text-align: right;
      padding: 0 10px;
      width: 1%;
      min-width: 50px;
      color: #a0a0a0;
      border-right: 1px solid #e1e4e8;
      user-select: none;
    }
    
    .line-content {
      padding: 0 10px;
      white-space: pre;
    }
    
    .highlighted {
      background-color: #fffbdd;
    }
    
    .highlighted .line-number {
      background-color: #fff5b1;
      color: #735c0f;
      font-weight: 600;
    }
    
    @media (max-width: 768px) {
      .result-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .lines, .score {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <h1>CodeInsight AI - Search Results</h1>
  
  <div class="query-info">
    <h2>Query: "${query}"</h2>
    <p>Found ${resultCount} matches using ${semanticSearch ? 'semantic' : 'keyword'} search.</p>
  </div>
  
  ${resultCount === 0 ? '<p>No matches found.</p>' : resultsHtml}
</body>
</html>`;
}

module.exports = {
  searchCodebase,
  formatSearchResults
};