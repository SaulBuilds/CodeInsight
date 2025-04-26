/**
 * CodeInsight AI - Natural Language Search
 * 
 * This file contains utilities for searching code using natural language queries
 */

const fs = require('fs');
const path = require('path');
// const glob = require('glob'); // Remove glob dependency
const chalk = require('chalk');
const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');

// Standard ignore patterns (similar to .gitignore)
const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/package-lock.json',
  '**/yarn.lock'
];

/**
 * Checks if a file path matches any of the simplified ignore patterns.
 * Note: This is a basic implementation and may not cover all .gitignore complexities.
 * @param {string} filePath - The absolute path to the file.
 * @param {string[]} [ignorePatterns=DEFAULT_IGNORE_PATTERNS] - An array of ignore patterns.
 * @param {string} baseDir - The absolute path to the base directory for relative path calculation.
 * @returns {boolean} True if the path should be ignored, false otherwise.
 */
function isIgnored(filePath, ignorePatterns = DEFAULT_IGNORE_PATTERNS, baseDir) {
  const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/'); // Use forward slashes
  // Basic check: does the relative path contain ignored directory names?
  return ignorePatterns.some(pattern => {
    const simplifiedPattern = pattern.replace(/\*\*\//g, '').replace(/\/\*\*/g, ''); // Simplistic removal of **/
    return relativePath.includes(simplifiedPattern);
  });
}

/**
 * Perform semantic or keyword search on a codebase.
 * Uses Tree-sitter for construct filtering and OpenAI embeddings for semantic matching.
 * 
 * @param {Object} options - Search options.
 * @param {string} options.query - Natural language query or keywords.
 * @param {string} [options.directory='.'] - Directory to search.
 * @param {number} [options.limit=10] - Maximum number of results to return.
 * @param {number} [options.context=3] - Number of lines of context to include around matches.
 * @param {string|null} options.apiKey - OpenAI API key (required for semantic search).
 * @param {boolean} [options.useEmbeddings=true] - Whether to use embeddings for semantic search (requires apiKey).
 * @param {string[]} [options.fileExt=[]] - Array of file extensions (lowercase, without dot) to filter by (e.g., ['js', 'py']). If empty, defaults are used.
 * @param {string} [options.filterType=''] - Type of code construct to filter for ('function', 'class', 'variable'). If empty, searches all content.
 * @returns {Promise<Object>} - An object containing the search query, results array, result count, semantic search status, and formatted text output.
 * @property {string} query - The original search query.
 * @property {Array<Object>} results - The search results, augmented with context.
 * @property {number} resultCount - The number of results found.
 * @property {boolean} semanticSearch - Indicates if semantic search was used.
 * @property {string} formattedOutput - Pre-formatted text output for the console.
 */
async function searchCodebase(options) {
  const {
    query,
    directory = '.',
    limit = 10,
    context = 3,
    apiKey,
    useEmbeddings = true,
    fileExt = [],
    filterType = ''
  } = options;
  console.log(chalk.magenta('--- Entering searchCodebase ---'));
  console.log(chalk.magenta(`Options received: ${JSON.stringify(options)}`));

  const files = await findCodeFiles(directory, fileExt);
  console.log(chalk.magenta(`Files found by findCodeFiles: ${JSON.stringify(files)}`));

  if (!files || files.length === 0) {
    const formattedOutput = chalk.yellow('No code files found in the specified directory.');
    console.log(chalk.magenta('Exiting searchCodebase early: No files found.'));
    return { query, results: [], resultCount: 0, semanticSearch: useEmbeddings && apiKey, formattedOutput };
  }

  let searchResults;
  if (useEmbeddings && apiKey) {
    console.log(chalk.blue('>>> Calling performSemanticSearch...'));
    try {
      searchResults = await performSemanticSearch(files, query, limit, directory, apiKey, { constructType: filterType });
      console.log(chalk.blue(`<<< performSemanticSearch returned (type: ${typeof searchResults}, isArray: ${Array.isArray(searchResults)}, length: ${Array.isArray(searchResults) ? searchResults.length : 'N/A'})`));
    } catch (semanticError) {
      console.error(chalk.red('>>> Error DIRECTLY from performSemanticSearch call:'), semanticError.message);
      searchResults = [];
    }
  } else {
    console.log(chalk.blue('Calling performSimpleSearch...'));
    searchResults = await performSimpleSearch(files, query, limit, directory, { constructType: filterType });
    console.log(chalk.blue(`performSimpleSearch returned: ${JSON.stringify(searchResults)}`));
  }

  if (!Array.isArray(searchResults)) {
    console.error(chalk.red(`Search results are not an array after search execution! Got: ${typeof searchResults}. Defaulting to empty array.`));
    searchResults = [];
  }
  console.log(chalk.magenta(`searchResults before addContextToResults (length: ${searchResults.length})`));

  const resultsWithContext = await addContextToResults(searchResults, context);
  console.log(chalk.magenta(`resultsWithContext (length: ${resultsWithContext.length})`));

  const formattedOutput = formatSearchResults({
    query,
    results: resultsWithContext,
    resultCount: resultsWithContext.length,
    semanticSearch: useEmbeddings && apiKey
  }, 'text');

  console.log(chalk.magenta('--- Exiting searchCodebase normally ---'));

  return { query, results: resultsWithContext, resultCount: resultsWithContext.length, semanticSearch: useEmbeddings && apiKey, formattedOutput };
}

/**
 * Finds all code files matching specified extensions within a directory, recursively.
 * Uses manual file system traversal.
 * 
 * @param {string} directory - Directory to search.
 * @param {string[]} [fileExt=[]] - Array of file extensions (lowercase, without dot) to filter by (e.g., ['js', 'py']). If empty, uses default extensions.
 * @returns {Promise<string[]>} - A promise that resolves to a list of absolute file paths matching the criteria.
 */
async function findCodeFiles(directory, fileExt = []) {
  console.log(chalk.cyan(`--- Entering findCodeFiles (Manual FS Walk) ---`));
  console.log(chalk.cyan(`Directory: ${directory}, FileExt: ${JSON.stringify(fileExt)}`));

  const resolvedDirectory = path.resolve(directory);
  console.log(chalk.cyan(`Resolved Directory: ${resolvedDirectory}`));

  const allowedExtensions = fileExt.length > 0 
    ? new Set(fileExt.map(ext => `.${ext.toLowerCase()}`))
    : null; // null means allow all default extensions (or maybe define defaults?)

  const allFiles = [];

  function walkSync(currentDirPath) {
    try {
      const entries = fs.readdirSync(currentDirPath);

      for (const entry of entries) {
        const fullPath = path.join(currentDirPath, entry);
        
        // Check against ignore patterns before proceeding
        if (isIgnored(fullPath, DEFAULT_IGNORE_PATTERNS, resolvedDirectory)) {
           // console.log(chalk.grey(`Ignoring: ${fullPath}`));
           continue; 
        }

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            walkSync(fullPath); // Recurse into subdirectories
          } else if (stat.isFile()) {
            const fileExtension = path.extname(fullPath).toLowerCase();
            
            // Filter by extension
            if (allowedExtensions) {
              if (allowedExtensions.has(fileExtension)) {
                allFiles.push(path.resolve(fullPath)); // Ensure absolute path
              }
            } else {
              // If no extensions specified, maybe use a default list or include all?
              // For now, including based on a default list if fileExt is empty
              const defaultExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.c', '.cpp', '.cs', '.html', '.css', '.json', '.md']);
              if (defaultExts.has(fileExtension)) {
                 allFiles.push(path.resolve(fullPath));
              }
            }
          }
        } catch (statError) {
          console.warn(chalk.yellow(`Could not get stats for ${fullPath}: ${statError.message}`));
        }
      }
    } catch (readError) {
      console.error(chalk.red(`Could not read directory ${currentDirPath}: ${readError.message}`));
    }
  }

  if (!fs.existsSync(resolvedDirectory)) {
     console.error(chalk.red(`Directory does not exist: ${resolvedDirectory}`));
     return Promise.resolve([]); // Return empty array if dir doesn't exist
  }

  walkSync(resolvedDirectory);
  console.log(chalk.cyan(`Manual walk found ${allFiles.length} files: ${JSON.stringify(allFiles)}`));
  return Promise.resolve(allFiles);
}

/**
 * Perform semantic search using OpenAI embeddings and Tree-sitter constructs.
 * 
 * @param {string[]} files - List of absolute file paths to search.
 * @param {string} query - Natural language query.
 * @param {number} limit - Maximum number of results to return.
 * @param {string} baseDir - Base directory path (used for calculating relative paths in results).
 * @param {string} apiKey - OpenAI API key.
 * @param {Object} [filters={}] - Additional filters for search.
 * @param {string} [filters.constructType] - Specific construct type ('function', 'class', 'variable') to target.
 * @returns {Promise<Object[]>} - A promise resolving to an array of ranked search result objects.
 */
async function performSemanticSearch(files, query, limit, baseDir, apiKey, filters = {}) {
  console.log(chalk.yellow('--- Entering performSemanticSearch ---'));
  console.log(chalk.yellow(`Files received: ${JSON.stringify(files)}`)); 
  console.log(chalk.yellow(`Query: "${query}", Limit: ${limit}, BaseDir: ${baseDir}, API Key Present: ${!!apiKey}, Filters: ${JSON.stringify(filters)}`));

  try {
    // Check files array explicitly
    if (!files || files.length === 0) {
      console.error(chalk.red('performSemanticSearch received empty or invalid files array.'));
      return []; // Return empty results if no files
    }
    console.log(chalk.cyan(`performSemanticSearch: Found ${files.length} files to process.`)); 

    if (!apiKey || typeof apiKey !== 'string') {
      console.error(chalk.red(`Invalid OpenAI API key provided: ${apiKey}`));
      throw new Error('Invalid OpenAI API key');
    }

    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    console.log(chalk.cyan('Getting query embedding...'));
    const queryEmbedding = await getEmbedding(query, openai);
    if (!Array.isArray(queryEmbedding)) {
       console.error(chalk.red('Failed to generate query embedding. Embedding was not an array.'));
      throw new Error('Failed to generate query embedding');
    }
     console.log(chalk.cyan(`Query embedding received (length: ${queryEmbedding.length})`));

    const batchSize = 50;
    let allResults = [];
    // This log was added previously but didn't appear, let's verify again
    console.log(chalk.blue(`Preparing to loop through ${files.length} files in batches...`)); 

     for (let i = 0; i < files.length; i += batchSize) { 
       const batch = files.slice(i, i + batchSize);
       console.log(chalk.blue(`Processing batch ${Math.floor(i / batchSize) + 1} (files ${i + 1} to ${Math.min(i + batchSize, files.length)})`)); 
      const batchResults = await processBatch(batch, queryEmbedding, baseDir, openai, filters);
      allResults = allResults.concat(batchResults);
    }

    console.log(chalk.cyan(`Finished processing all batches. Total results found: ${allResults.length}`));

    return allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error(chalk.red(`Error caught in performSemanticSearch: ${error.message}`)); // Enhanced catch log
    // console.error(chalk.gray(`Stack trace: ${error.stack}`)); // Optionally uncomment for more detail
    throw error; // Re-throw to ensure it propagates
  }
}

/**
 * Process a batch of files: extract constructs or chunks, get embeddings, calculate similarity, and score results.
 * 
 * @param {string[]} files - Batch of absolute file paths.
 * @param {number[]} queryEmbedding - Embedding vector for the search query.
 * @param {string} baseDir - Base directory path for relative path calculation.
 * @param {Object} openai - Initialized OpenAI client (v3 API).
 * @param {Object} [filters={}] - Filters to apply.
 * @param {string} [filters.constructType] - Specific construct type ('function', 'class', 'variable') to target.
 * @returns {Promise<Object[]>} - A promise resolving to an array of result objects for this batch (unsorted).
 */
async function processBatch(files, queryEmbedding, baseDir, openai, filters = {}) {
  const results = [];
  const parser = new Parser();
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(baseDir, file);
    const ext = path.extname(file).toLowerCase();
    
    // Re-add large file check
    if (!content.trim() || content.length > 100000) { 
      console.warn(chalk.yellow(`Skipping large or empty file: ${relativePath} (length: ${content.length})`));
      continue;
    }
    
    let language;
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      language = JavaScript;
    } else if (ext === '.py') {
      language = Python;
    }
    
    let constructs = [];
    if (filters.constructType && language) {
      console.log(chalk.magenta(`Attempting to extract constructs of type '${filters.constructType}' from ${relativePath}`));
      parser.setLanguage(language);
      const tree = parser.parse(content);
      constructs = extractConstructs(tree, filters.constructType);
      console.log(chalk.magenta(`Extracted ${constructs.length} constructs of type '${filters.constructType}'.`));
      // Log extracted construct names for debugging
      if (constructs.length > 0) {
        console.log(chalk.grey(`Construct names: ${constructs.map(c => c.name).join(', ')}`));
      }
    }
    
    if (constructs.length > 0) {
      console.log(chalk.blue(`Processing ${constructs.length} specific constructs for ${relativePath}...`));
      for (const construct of constructs) {
        const chunk = content.slice(construct.startIndex, construct.endIndex);
        if (chunk.length < 50) continue;
        console.log(chalk.grey(`  Processing construct '${construct.name}' chunk (length ${chunk.length})`));
        
        const embedding = await getEmbedding(chunk, openai);
        if (!Array.isArray(embedding) || !Array.isArray(queryEmbedding)) {
            console.warn(chalk.yellow(`  Skipping construct '${construct.name}': Invalid embedding received.`));
            continue;
        }
        
        const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
        console.log(chalk.grey(`  Similarity for '${construct.name}': ${similarity.toFixed(4)}`));

        const chunkSizeFactor = Math.min(chunk.length / 500, 1);
        const typeWeight = construct.type === 'function' ? 1.2 : construct.type === 'class' ? 1.1 : 1.0;
        const finalScore = similarity * 0.7 + chunkSizeFactor * 0.2 + typeWeight * 0.1;
        
        results.push({
          file: relativePath,
          lineStart: construct.lineStart,
          lineEnd: construct.lineEnd,
          content: chunk,
          similarity,
          score: finalScore,
          constructType: construct.type,
          constructName: construct.name || 'anonymous'
        });
      }
    } else {
      if (filters.constructType) {
         console.log(chalk.yellow(`No constructs of type '${filters.constructType}' found in ${relativePath}, processing whole file chunks instead.`));
      }
      console.log(chalk.blue(`Processing ${relativePath} using general chunks...`));
      const chunks = splitIntoChunks(content);
      for (const [chunk, lineStart, lineEnd] of chunks) {
        if (chunk.length < 50) continue;
        console.log(chalk.grey(`  Processing general chunk lines ${lineStart}-${lineEnd} (length ${chunk.length})`));

        const embedding = await getEmbedding(chunk, openai);
        if (!Array.isArray(embedding) || !Array.isArray(queryEmbedding)) {
          console.warn(chalk.yellow(`  Skipping general chunk lines ${lineStart}-${lineEnd}: Invalid embedding received.`));
          continue;
        }
        
        const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
        console.log(chalk.grey(`  Similarity for general chunk lines ${lineStart}-${lineEnd}: ${similarity.toFixed(4)}`));

        results.push({
          file: relativePath,
          lineStart,
          lineEnd,
          content: chunk,
          similarity,
          score: similarity
        });
      }
    }
  }
  
  return results;
}

/**
 * Extract specific code constructs (functions, classes, variables) from a parsed Tree-Sitter tree.
 * 
 * @param {Parser.Tree} tree - Parsed Tree-Sitter tree for a file.
 * @param {string} filterType - The simplified type of construct to filter for ('function', 'class', 'variable') or empty/null to extract all supported types.
 * @returns {Array<Object>} - Array of extracted constructs, each with: `type` (string), `name` (string), `startIndex` (number), `endIndex` (number), `lineStart` (number), `lineEnd` (number).
 */
function extractConstructs(tree, filterType) {
  const constructs = [];

  // Define mappings from filterType to actual Tree-sitter node types
  const typeMapping = {
    function: ['function_declaration', 'arrow_function', 'function_definition', 'method_definition'],
    class: ['class_declaration', 'class_definition'],
    variable: ['variable_declarator', 'lexical_declaration'] // Might need refinement for specific languages
  };

  // Determine the list of actual Tree-sitter node types to look for
  let targetNodeTypes = [];
  if (filterType && typeMapping[filterType]) {
    targetNodeTypes = typeMapping[filterType];
    console.log(chalk.grey(`extractConstructs: Targeting specific node types: ${targetNodeTypes.join(', ')}`));
  } else {
    // If no filter or unknown filter, target all known types
    targetNodeTypes = Object.values(typeMapping).flat();
    if (filterType) {
        console.log(chalk.yellow(`extractConstructs: Unknown filterType '${filterType}'. Targeting all default node types.`));
    } else {
        console.log(chalk.grey(`extractConstructs: No filterType provided. Targeting all default node types.`));
    }
  }
  const targetNodeTypeSet = new Set(targetNodeTypes);

  function traverse(node) {
    if (targetNodeTypeSet.has(node.type)) {
      let simplifiedType = '';
      // Categorize the found node type
      if (typeMapping.function.includes(node.type)) {
        simplifiedType = 'function';
      } else if (typeMapping.class.includes(node.type)) {
        simplifiedType = 'class';
      } else if (typeMapping.variable.includes(node.type)) {
        simplifiedType = 'variable';
      }

      if (simplifiedType) { 
          let nameNode = null; // Initialize nameNode
          let name = 'anonymous';

          // Updated name-finding logic
          if ((node.type === 'function_declaration' || node.type === 'class_declaration' || node.type === 'method_definition') && node.childForFieldName('name')) {
              nameNode = node.childForFieldName('name');
              name = nameNode.text;
          } else if (node.type === 'class_definition' && node.childForFieldName('name')) { // Specific check for Python class
              nameNode = node.childForFieldName('name');
              name = nameNode.text;
          } else if (node.type === 'variable_declarator' && node.childForFieldName('name')) {
              nameNode = node.childForFieldName('name');
              name = nameNode.text;
          } else if (node.type === 'lexical_declaration') {
              const declarator = node.children.find(child => child.type === 'variable_declarator');
              if (declarator && declarator.childForFieldName('name')) {
                  nameNode = declarator.childForFieldName('name');
                  name = nameNode.text;
              }
          } else {
              // Fallback: Try finding the first identifier child if specific logic fails
              nameNode = node.children.find(child => child.type === 'identifier');
              if (nameNode) name = nameNode.text;
          }
          
          constructs.push({
            type: simplifiedType,
            name: name, // Use the found name
            startIndex: node.startIndex,
            endIndex: node.endIndex,
            lineStart: node.startPosition.row + 1,
            lineEnd: node.endPosition.row + 1
          });
      }
    }
    node.namedChildren.forEach(child => traverse(child));
  }
  
  traverse(tree.rootNode);
  console.log(chalk.grey(`extractConstructs: Finished traversal. Found ${constructs.length} matching constructs.`));
  return constructs;
}

/**
 * Get embedding for a text snippet using the OpenAI API (v3).
 * Includes basic input validation and error handling.
 * 
 * @param {string} text - Text content to embed.
 * @param {OpenAIApi} openai - Initialized OpenAI client (v3 API).
 * @returns {Promise<number[]>} - Embedding vector (array of numbers), or an array of zeros on error.
 */
async function getEmbedding(text, openai) {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid input text');
    }
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text.trim()
    });
    const embedding = response.data.data[0].embedding;
    if (!Array.isArray(embedding) || embedding.length === 0 || embedding.every(val => val === 0)) {
      throw new Error('Invalid embedding response');
    }
    return embedding;
  } catch (error) {
    console.error(chalk.red(`Error getting embedding: ${error.message}`));
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
  if (!Array.isArray(vec1) || !Array.isArray(vec2) || vec1.length !== vec2.length || vec1.every(val => val === 0) || vec2.every(val => val === 0)) {
    throw new Error('Vectors must be valid arrays of the same dimension');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (norm1 * norm2);
}

/**
 * Split file content into reasonably sized chunks of code
 * @param {string} content - File content
 * @returns {Array} - Array of [chunk, lineStart, lineEnd] tuples
 */
function splitIntoChunks(content) {
  const lines = content.split('\n');
  const chunks = [];
  const chunkSize = 30;
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n');
    chunks.push([chunk, i + 1, Math.min(i + chunkSize, lines.length)]);
  }
  
  return chunks;
}

/**
 * Perform simple keyword-based search.
 * Can optionally filter by construct type using Tree-sitter.
 * 
 * @param {string[]} files - List of absolute file paths.
 * @param {string} query - Search query (keywords).
 * @param {number} limit - Maximum number of results.
 * @param {string} baseDir - Base directory for relative paths.
 * @param {Object} [filters={}] - Additional filters for search.
 * @param {string} [filters.constructType] - Type of code construct to filter for ('function', 'class', 'variable').
 * @returns {Promise<Object[]>} - A promise resolving to an array of ranked search result objects based on keyword matches.
 */
async function performSimpleSearch(files, query, limit, baseDir, filters = {}) {
  const results = [];
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const parser = new Parser();
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(baseDir, file);
      const ext = path.extname(file).toLowerCase();
      
      let language;
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        language = JavaScript;
      } else if (ext === '.py') {
        language = Python;
      }
      
      let constructs = [];
      if (filters.constructType && language) {
        parser.setLanguage(language);
        const tree = parser.parse(content);
        constructs = extractConstructs(tree, filters.constructType);
      }
      
      if (constructs.length > 0) {
        for (const construct of constructs) {
          const chunk = content.slice(construct.startIndex, construct.endIndex).toLowerCase();
          if (chunk.length < 50) continue;
          let matchScore = 0;
          for (const keyword of keywords) {
            if (chunk.includes(keyword)) matchScore += 1;
          }
          if (matchScore > 0) {
            results.push({
              file: relativePath,
              lineStart: construct.lineStart,
              lineEnd: construct.lineEnd,
              content: content.slice(construct.startIndex, construct.endIndex),
              similarity: matchScore / keywords.length,
              score: matchScore / keywords.length,
              constructType: construct.type,
              constructName: construct.name || 'anonymous'
            });
          }
        }
      } else {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase();
          if (line.length < 10) continue;
          let matchScore = 0;
          for (const keyword of keywords) {
            if (line.includes(keyword)) matchScore += 1;
          }
          if (matchScore > 0) {
            results.push({
              file: relativePath,
              lineStart: i + 1,
              lineEnd: i + 1,
              content: lines[i],
              similarity: matchScore / keywords.length,
              score: matchScore / keywords.length
            });
          }
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  return results
    .sort((a, b) => b.score - a.score)
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
      
      const startLine = Math.max(0, result.lineStart - contextLines - 1);
      const endLine = Math.min(lines.length - 1, result.lineEnd + contextLines - 1);
      
      const contextContent = lines.slice(startLine, endLine + 1).join('\n');
      
      result.lineStart = startLine + 1;
      result.lineEnd = endLine + 1;
      result.content = contextContent;
      result.highlightStart = result.lineStart;
      result.highlightEnd = result.lineEnd;
    } catch (error) {
      continue;
    }
  }
  
  return results;
}

/**
 * Generate formatted terminal output for search results.
 * Includes syntax highlighting and indicates results with low semantic similarity.
 * 
 * @param {Object} searchResults - The results object returned by `searchCodebase`.
 * @param {string} searchResults.query - The original search query.
 * @param {Array<Object>} searchResults.results - The array of result objects (must include `similarity` if semantic search).
 * @param {number} searchResults.resultCount - The total number of results.
 * @param {boolean} searchResults.semanticSearch - Whether semantic search was used.
 * @param {string} [format='text'] - Output format ('text', 'json', 'html'). Currently only 'text' is fully implemented here for console output.
 * @returns {string} - Formatted output string (currently only for 'text' format).
 */
function formatSearchResults(searchResults, format = 'text') {
  const { query, results, resultCount, semanticSearch } = searchResults;
  const SIMILARITY_THRESHOLD = 0.7; // Define threshold for formatting
  
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
        output += chalk.yellow('No potential matches found.'); // Adjusted message
        return output;
      }
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        output += chalk.blue(`[${i + 1}] ${result.file}:${result.lineStart}-${result.lineEnd}`);
        output += ` (score: ${result.score.toFixed(2)})`;
        
        // Add indicator if below threshold (only for semantic search results)
        if (semanticSearch && result.similarity !== undefined && result.similarity < SIMILARITY_THRESHOLD) {
          output += chalk.gray(` (Similarity ${result.similarity.toFixed(2)} < ${SIMILARITY_THRESHOLD})`);
        }
        
        if (result.constructType) {
          const color = result.constructType === 'function' ? chalk.cyan : result.constructType === 'class' ? chalk.magenta : chalk.green;
          output += color(` [${result.constructType}: ${result.constructName}]`);
        }
        output += '\n';
        
        const lines = result.content.split('\n');
        for (let j = 0; j < lines.length; j++) {
          const lineNum = result.lineStart + j;
          const lineNumStr = ` ${lineNum}`.padStart(5, ' ');
          // Highlight based on original match lines, not context lines added later
          // We need to adjust addContextToResults or store original match lines if precise highlighting is needed
          // For now, highlighting the whole fetched context block
          const isHighlighted = true; // Simplified for now
          const lineContent = isHighlighted ? chalk.yellow(lines[j]) : lines[j];
          output += chalk.gray(`${lineNumStr} | `) + lineContent + '\n';
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
      const isHighlighted = lineNum >= (result.highlightStart || result.lineStart) && lineNum <= (result.highlightEnd || result.lineEnd);
      
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
    
    const constructInfo = result.constructType ? `<span class="construct-type ${result.constructType}">[${result.constructType}: ${result.constructName}]</span>` : '';
    
    resultsHtml += `
      <div class="result">
        <div class="result-header">
          <h3>${result.file}</h3>
          <span class="lines">Lines ${result.lineStart}-${result.lineEnd}</span>
          <span class="score">Score: ${result.score.toFixed(2)}</span>
          ${constructInfo}
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
    
    .lines, .score, .construct-type {
      font-size: 14px;
      margin-left: 15px;
    }
    
    .score {
      font-weight: 600;
      color: #0077cc;
    }
    
    .construct-type {
      padding: 2px 6px;
      border-radius: 4px;
      color: white;
    }
    
    .construct-type.function {
      background-color: #00b7ff;
    }
    
    .construct-type.class {
      background-color: #ff00ff;
    }
    
    .construct-type.variable {
      background-color: #00cc00;
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
      
      .lines, .score, .construct-type {
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