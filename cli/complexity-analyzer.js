/**
 * CodeInsight AI - Complexity Analyzer
 * 
 * This file contains utilities for analyzing code complexity metrics
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

/**
 * Calculate complexity metrics for files in a repository
 * @param {Object} options - Configuration options
 * @param {string} options.directory - Directory to analyze
 * @param {string} options.output - Output format (json, html, or csv)
 * @param {number} options.threshold - Complexity threshold for highlighting
 * @param {string} options.language - Filter by programming language
 * @param {string} options.filter - Pattern to filter files (glob syntax)
 * @param {string} options.exclude - Pattern to exclude files (glob syntax)
 * @param {boolean} options.details - Whether to show detailed breakdown by function/method
 * @returns {Promise<Object>} - Complexity analysis results
 */
async function analyzeComplexity(options) {
  const {
    directory = '.',
    output = 'html',
    threshold = 10,
    language,
    filter,
    exclude,
    details = false
  } = options;

  // Find all files to analyze
  const files = await findFilesToAnalyze(directory, language, filter, exclude);

  // Calculate complexity for each file
  const results = {};
  let totalComplexity = 0;
  let totalFiles = 0;
  let highComplexityFiles = 0;
  
  for (const file of files) {
    const relativePath = path.relative(directory, file);
    const fileComplexity = await calculateFileComplexity(file, details);
    
    if (fileComplexity) {
      results[relativePath] = fileComplexity;
      totalComplexity += fileComplexity.cyclomaticComplexity;
      totalFiles++;
      
      if (fileComplexity.cyclomaticComplexity > threshold) {
        highComplexityFiles++;
      }
    }
  }

  // Sort results by complexity (highest first)
  const sortedResults = Object.entries(results)
    .sort((a, b) => b[1].cyclomaticComplexity - a[1].cyclomaticComplexity);

  // Calculate summary metrics
  const summary = {
    totalFiles,
    totalComplexity,
    averageComplexity: totalFiles > 0 ? totalComplexity / totalFiles : 0,
    highComplexityFiles,
    highComplexityPercentage: totalFiles > 0 ? (highComplexityFiles / totalFiles) * 100 : 0,
    threshold
  };

  // Generate output based on the requested format
  let formattedOutput;
  switch (output) {
    case 'json':
      formattedOutput = generateJsonOutput(sortedResults, summary);
      break;
    case 'csv':
      formattedOutput = generateCsvOutput(sortedResults, summary);
      break;
    case 'html':
    default:
      formattedOutput = generateHtmlOutput(sortedResults, summary, threshold);
      break;
  }

  return {
    results: Object.fromEntries(sortedResults),
    summary,
    formattedOutput
  };
}

/**
 * Find all files to analyze in the repository
 * @param {string} directory - Directory to analyze
 * @param {string} language - Filter by programming language
 * @param {string} filterPattern - Pattern to filter files (glob syntax)
 * @param {string} excludePattern - Pattern to exclude files (glob syntax)
 * @returns {Promise<string[]>} - List of file paths to analyze
 */
async function findFilesToAnalyze(directory, language, filterPattern, excludePattern) {
  return new Promise((resolve, reject) => {
    // Set up the file pattern based on language
    let pattern;
    if (filterPattern) {
      pattern = filterPattern;
    } else if (language) {
      pattern = getLanguagePattern(language);
    } else {
      pattern = '**/*.{js,jsx,ts,tsx,py,java,go,rb,php,c,cpp,cs}';
    }

    const options = {
      cwd: directory,
      ignore: excludePattern ? excludePattern.split(',') : [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**'
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
 * Get the glob pattern for a specific language
 * @param {string} language - The programming language
 * @returns {string} - Glob pattern for the language
 */
function getLanguagePattern(language) {
  const patterns = {
    javascript: '**/*.{js,jsx}',
    typescript: '**/*.{ts,tsx}',
    python: '**/*.py',
    java: '**/*.java',
    go: '**/*.go',
    ruby: '**/*.rb',
    php: '**/*.php',
    c: '**/*.c',
    cpp: '**/*.{cpp,cc,cxx}',
    csharp: '**/*.cs'
  };

  return patterns[language.toLowerCase()] || '**/*.{js,jsx,ts,tsx,py,java,go,rb,php,c,cpp,cs}';
}

/**
 * Calculate complexity metrics for a file
 * @param {string} filePath - Path to the file
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Promise<Object|null>} - Complexity metrics for the file
 */
async function calculateFileComplexity(filePath, includeDetails) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();
    
    // Choose the appropriate analyzer based on file extension
    let complexity;
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      complexity = analyzeJavaScriptComplexity(content, includeDetails);
    } else if (ext === '.py') {
      complexity = analyzePythonComplexity(content, includeDetails);
    } else if (ext === '.java') {
      complexity = analyzeJavaComplexity(content, includeDetails);
    } else if (['.c', '.cpp', '.cc', '.cxx'].includes(ext)) {
      complexity = analyzeCCppComplexity(content, includeDetails);
    } else if (ext === '.go') {
      complexity = analyzeGoComplexity(content, includeDetails);
    } else if (ext === '.rb') {
      complexity = analyzeRubyComplexity(content, includeDetails);
    } else if (ext === '.php') {
      complexity = analyzePhpComplexity(content, includeDetails);
    } else if (ext === '.cs') {
      complexity = analyzeCSharpComplexity(content, includeDetails);
    } else {
      // Unsupported file type
      return null;
    }
    
    // Add line counts
    const lineCount = content.split('\n').length;
    const nonEmptyLineCount = content.split('\n').filter(line => line.trim().length > 0).length;
    
    return {
      ...complexity,
      lineCount,
      nonEmptyLineCount,
      sizeCategory: getSizeCategory(nonEmptyLineCount),
      complexityDensity: complexity.cyclomaticComplexity / Math.max(1, nonEmptyLineCount) * 100
    };
  } catch (error) {
    console.error(chalk.red(`Error analyzing complexity of ${filePath}: ${error.message}`));
    return null;
  }
}

/**
 * Determine the size category of a file based on line count
 * @param {number} lineCount - Number of non-empty lines
 * @returns {string} - Size category (Small, Medium, Large, Very Large)
 */
function getSizeCategory(lineCount) {
  if (lineCount < 100) return 'Small';
  if (lineCount < 500) return 'Medium';
  if (lineCount < 1000) return 'Large';
  return 'Very Large';
}

/**
 * Analyze complexity of JavaScript/TypeScript code
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzeJavaScriptComplexity(content, includeDetails) {
  // This is a basic implementation that counts complexity indicators
  // A real implementation would use an AST parser for more accurate results
  
  // Count decision points that contribute to cyclomatic complexity
  const ifMatch = content.match(/\bif\s*\(/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s*\(/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const whileMatch = content.match(/\bwhile\s*\(/g);
  const whileCount = whileMatch ? whileMatch.length : 0;
  
  const doWhileMatch = content.match(/\bdo\s*\{/g);
  const doWhileCount = doWhileMatch ? doWhileMatch.length : 0;
  
  const switchMatch = content.match(/\bswitch\s*\(/g);
  const switchCount = switchMatch ? switchMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+[^:]+:/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const catchMatch = content.match(/\bcatch\s*\(/g);
  const catchCount = catchMatch ? catchMatch.length : 0;
  
  const ternaryMatch = content.match(/\?.*:/g);
  const ternaryCount = ternaryMatch ? ternaryMatch.length : 0;
  
  const logicalAndMatch = content.match(/&&/g);
  const logicalAndCount = logicalAndMatch ? logicalAndMatch.length : 0;
  
  const logicalOrMatch = content.match(/\|\|/g);
  const logicalOrCount = logicalOrMatch ? logicalOrMatch.length : 0;
  
  // Count function declarations
  const functionMatch = content.match(/\bfunction\s+\w+\s*\(/g);
  const functionCount = functionMatch ? functionMatch.length : 0;
  
  const arrowFunctionMatch = content.match(/\([^)]*\)\s*=>/g);
  const arrowFunctionCount = arrowFunctionMatch ? arrowFunctionMatch.length : 0;
  
  const methodMatch = content.match(/\w+\s*\([^)]*\)\s*\{/g);
  const methodCount = methodMatch ? methodMatch.length : 0;
  
  const totalFunctionCount = functionCount + arrowFunctionCount + methodCount;
  
  // Calculate cognitive complexity based on nesting levels
  let cognitiveComplexity = 0;
  let nestingLevel = 0;
  let maxNestingLevel = 0;
  
  const lines = content.split('\n');
  for (const line of lines) {
    // Increment nesting level for blocks that start
    if (line.match(/\{\s*$/)) {
      nestingLevel++;
      if (nestingLevel > maxNestingLevel) {
        maxNestingLevel = nestingLevel;
      }
    }
    
    // Decrement nesting level for blocks that end
    if (line.match(/^\s*\}/)) {
      nestingLevel = Math.max(0, nestingLevel - 1);
    }
    
    // Add complexity for decision points based on nesting level
    if (line.match(/\bif\s*\(/) || 
        line.match(/\bfor\s*\(/) || 
        line.match(/\bwhile\s*\(/) || 
        line.match(/\bswitch\s*\(/) || 
        line.match(/\bcatch\s*\(/) || 
        line.match(/\?.*:/)) {
      // Higher nesting means higher cognitive complexity
      cognitiveComplexity += 1 + nestingLevel;
    }
  }
  
  // Calculate cyclomatic complexity: 1 + decision points
  const cyclomaticComplexity = 1 + ifCount + forCount + whileCount + doWhileCount + 
                              caseCount + catchCount + ternaryCount;
  
  // Analyze complexity per function if details requested
  let functionDetails = [];
  if (includeDetails) {
    // This is a simplified approach; a real implementation would parse the AST
    // to get accurate function boundaries and complexity
    const functionMatches = [...content.matchAll(/\b(function\s+(\w+)|(\w+)\s*=\s*function|\b(class)\s+(\w+)|(\w+)\s*\([^)]*\)\s*\{)/g)];
    
    for (const match of functionMatches) {
      const startIdx = match.index;
      const functionName = match[2] || match[3] || match[5] || match[6] || 'anonymous';
      
      // Find the function body (very simplified approach)
      let braceCount = 0;
      let endIdx = startIdx;
      
      for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
      
      const functionBody = content.substring(startIdx, endIdx + 1);
      const functionComplexity = analyzeJavaScriptComplexity(functionBody, false);
      
      functionDetails.push({
        name: functionName,
        cyclomaticComplexity: functionComplexity.cyclomaticComplexity,
        cognitiveComplexity: functionComplexity.cognitiveComplexity,
        lineCount: functionBody.split('\n').length
      });
    }
  }
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity,
    maxNestingLevel,
    totalFunctionCount,
    breakdownByType: {
      ifStatements: ifCount,
      forLoops: forCount,
      whileLoops: whileCount,
      doWhileLoops: doWhileCount,
      switchStatements: switchCount,
      caseStatements: caseCount,
      catchBlocks: catchCount,
      ternaryOperators: ternaryCount,
      logicalAnds: logicalAndCount,
      logicalOrs: logicalOrCount
    },
    functionDetails: includeDetails ? functionDetails : undefined
  };
}

/**
 * Analyze complexity of Python code
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzePythonComplexity(content, includeDetails) {
  // Basic implementation similar to the JavaScript one
  // For a real implementation, use a Python-specific parser
  
  const ifMatch = content.match(/\bif\s+/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const elifMatch = content.match(/\belif\s+/g);
  const elifCount = elifMatch ? elifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s+/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const whileMatch = content.match(/\bwhile\s+/g);
  const whileCount = whileMatch ? whileMatch.length : 0;
  
  const exceptMatch = content.match(/\bexcept\s+/g);
  const exceptCount = exceptMatch ? exceptMatch.length : 0;
  
  const comprehensionMatch = content.match(/\[.*for.*in.*\]/g);
  const comprehensionCount = comprehensionMatch ? comprehensionMatch.length : 0;
  
  const ternaryMatch = content.match(/if.*else.*/g);
  const ternaryCount = ternaryMatch ? ternaryMatch.length : 0;
  
  const andMatch = content.match(/\band\b/g);
  const andCount = andMatch ? andMatch.length : 0;
  
  const orMatch = content.match(/\bor\b/g);
  const orCount = orMatch ? orMatch.length : 0;
  
  // Count function/method declarations
  const functionMatch = content.match(/\bdef\s+\w+\s*\(/g);
  const functionCount = functionMatch ? functionMatch.length : 0;
  
  const classMatch = content.match(/\bclass\s+\w+/g);
  const classCount = classMatch ? classMatch.length : 0;
  
  // Calculate cognitive complexity
  let cognitiveComplexity = 0;
  let nestingLevel = 0;
  let maxNestingLevel = 0;
  
  const lines = content.split('\n');
  for (const line of lines) {
    // Python uses indentation for nesting, but we'll use a simplified approach
    if (line.match(/\b(if|for|while|def|class)\b.*:$/)) {
      nestingLevel++;
      if (nestingLevel > maxNestingLevel) {
        maxNestingLevel = nestingLevel;
      }
    }
    
    // Assume a line with less indentation decreases nesting level
    const indentation = line.match(/^\s*/)[0].length;
    if (indentation === 0 && nestingLevel > 0) {
      nestingLevel--;
    }
    
    // Add complexity for decision points based on nesting level
    if (line.match(/\bif\s+/) || 
        line.match(/\belif\s+/) || 
        line.match(/\bfor\s+/) || 
        line.match(/\bwhile\s+/) || 
        line.match(/\bexcept\s+/)) {
      cognitiveComplexity += 1 + nestingLevel;
    }
  }
  
  // Calculate cyclomatic complexity: 1 + decision points
  const cyclomaticComplexity = 1 + ifCount + elifCount + forCount + whileCount + 
                              exceptCount + comprehensionCount + ternaryCount;
  
  let functionDetails = [];
  if (includeDetails) {
    // Simplified approach for function details
    const functionMatches = [...content.matchAll(/\bdef\s+(\w+)\s*\([^)]*\):/g)];
    
    for (const match of functionMatches) {
      const functionName = match[1];
      const startLine = content.substring(0, match.index).split('\n').length;
      
      // Find where function ends (simplified)
      let endLine = startLine;
      let currentIndent = null;
      
      for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        const indent = line.match(/^\s*/)[0].length;
        
        if (currentIndent === null && line.trim()) {
          currentIndent = indent;
        } else if (line.trim() && indent <= currentIndent) {
          endLine = i - 1;
          break;
        }
        
        if (i === lines.length - 1) {
          endLine = i;
        }
      }
      
      const functionBody = lines.slice(startLine - 1, endLine + 1).join('\n');
      const functionComplexity = analyzePythonComplexity(functionBody, false);
      
      functionDetails.push({
        name: functionName,
        cyclomaticComplexity: functionComplexity.cyclomaticComplexity,
        cognitiveComplexity: functionComplexity.cognitiveComplexity,
        lineCount: endLine - startLine + 1
      });
    }
  }
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity,
    maxNestingLevel,
    totalFunctionCount: functionCount,
    totalClassCount: classCount,
    breakdownByType: {
      ifStatements: ifCount,
      elifStatements: elifCount,
      forLoops: forCount,
      whileLoops: whileCount,
      exceptBlocks: exceptCount,
      listComprehensions: comprehensionCount,
      ternaryOperators: ternaryCount,
      andOperators: andCount,
      orOperators: orCount
    },
    functionDetails: includeDetails ? functionDetails : undefined
  };
}

/**
 * Analyze complexity of Java code (placeholder implementation)
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzeJavaComplexity(content, includeDetails) {
  // Placeholder implementation with basic metrics
  // A real implementation would use a Java parser
  const ifMatch = content.match(/\bif\s*\(/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s*\(/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const whileMatch = content.match(/\bwhile\s*\(/g);
  const whileCount = whileMatch ? whileMatch.length : 0;
  
  const doWhileMatch = content.match(/\bdo\s*\{/g);
  const doWhileCount = doWhileMatch ? doWhileMatch.length : 0;
  
  const switchMatch = content.match(/\bswitch\s*\(/g);
  const switchCount = switchMatch ? switchMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+[^:]+:/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const catchMatch = content.match(/\bcatch\s*\(/g);
  const catchCount = catchMatch ? catchMatch.length : 0;
  
  const cyclomaticComplexity = 1 + ifCount + forCount + whileCount + doWhileCount + 
                              caseCount + catchCount;
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity: cyclomaticComplexity * 1.2, // Simplified estimation
    maxNestingLevel: 0, // Placeholder
    totalMethodCount: 0, // Placeholder
    totalClassCount: 0, // Placeholder
    breakdownByType: {
      ifStatements: ifCount,
      forLoops: forCount,
      whileLoops: whileCount,
      doWhileLoops: doWhileCount,
      switchStatements: switchCount,
      caseStatements: caseCount,
      catchBlocks: catchCount
    },
    functionDetails: includeDetails ? [] : undefined
  };
}

/**
 * Analyze complexity of C/C++ code (placeholder implementation)
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzeCCppComplexity(content, includeDetails) {
  // Placeholder implementation with basic metrics
  // A real implementation would use a C/C++ parser
  const ifMatch = content.match(/\bif\s*\(/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s*\(/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const whileMatch = content.match(/\bwhile\s*\(/g);
  const whileCount = whileMatch ? whileMatch.length : 0;
  
  const doWhileMatch = content.match(/\bdo\s*\{/g);
  const doWhileCount = doWhileMatch ? doWhileMatch.length : 0;
  
  const switchMatch = content.match(/\bswitch\s*\(/g);
  const switchCount = switchMatch ? switchMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+[^:]+:/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const cyclomaticComplexity = 1 + ifCount + forCount + whileCount + doWhileCount + 
                              caseCount;
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity: cyclomaticComplexity * 1.3, // Simplified estimation
    maxNestingLevel: 0, // Placeholder
    totalFunctionCount: 0, // Placeholder
    breakdownByType: {
      ifStatements: ifCount,
      forLoops: forCount,
      whileLoops: whileCount,
      doWhileLoops: doWhileCount,
      switchStatements: switchCount,
      caseStatements: caseCount
    },
    functionDetails: includeDetails ? [] : undefined
  };
}

/**
 * Analyze complexity of Go code (placeholder implementation)
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzeGoComplexity(content, includeDetails) {
  // Placeholder implementation with basic metrics
  const ifMatch = content.match(/\bif\s+/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s+/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const switchMatch = content.match(/\bswitch\s+/g);
  const switchCount = switchMatch ? switchMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const cyclomaticComplexity = 1 + ifCount + forCount + caseCount;
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity: cyclomaticComplexity * 1.1, // Simplified estimation
    maxNestingLevel: 0, // Placeholder
    totalFunctionCount: 0, // Placeholder
    breakdownByType: {
      ifStatements: ifCount,
      forLoops: forCount,
      switchStatements: switchCount,
      caseStatements: caseCount
    },
    functionDetails: includeDetails ? [] : undefined
  };
}

/**
 * Analyze complexity of Ruby code (placeholder implementation)
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzeRubyComplexity(content, includeDetails) {
  // Placeholder implementation with basic metrics
  const ifMatch = content.match(/\bif\s+/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const unlessMatch = content.match(/\bunless\s+/g);
  const unlessCount = unlessMatch ? unlessMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const whenMatch = content.match(/\bwhen\s+/g);
  const whenCount = whenMatch ? whenMatch.length : 0;
  
  const cyclomaticComplexity = 1 + ifCount + unlessCount + whenCount;
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity: cyclomaticComplexity * 1.2, // Simplified estimation
    maxNestingLevel: 0, // Placeholder
    totalMethodCount: 0, // Placeholder
    totalClassCount: 0, // Placeholder
    breakdownByType: {
      ifStatements: ifCount,
      unlessStatements: unlessCount,
      caseStatements: caseCount,
      whenClauses: whenCount
    },
    functionDetails: includeDetails ? [] : undefined
  };
}

/**
 * Analyze complexity of PHP code (placeholder implementation)
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzePhpComplexity(content, includeDetails) {
  // Placeholder implementation with basic metrics
  const ifMatch = content.match(/\bif\s*\(/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s*\(/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const foreachMatch = content.match(/\bforeach\s*\(/g);
  const foreachCount = foreachMatch ? foreachMatch.length : 0;
  
  const whileMatch = content.match(/\bwhile\s*\(/g);
  const whileCount = whileMatch ? whileMatch.length : 0;
  
  const switchMatch = content.match(/\bswitch\s*\(/g);
  const switchCount = switchMatch ? switchMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const cyclomaticComplexity = 1 + ifCount + forCount + foreachCount + whileCount + caseCount;
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity: cyclomaticComplexity * 1.2, // Simplified estimation
    maxNestingLevel: 0, // Placeholder
    totalFunctionCount: 0, // Placeholder
    totalClassCount: 0, // Placeholder
    breakdownByType: {
      ifStatements: ifCount,
      forLoops: forCount,
      foreachLoops: foreachCount,
      whileLoops: whileCount,
      switchStatements: switchCount,
      caseStatements: caseCount
    },
    functionDetails: includeDetails ? [] : undefined
  };
}

/**
 * Analyze complexity of C# code (placeholder implementation)
 * @param {string} content - File content
 * @param {boolean} includeDetails - Whether to include function-level details
 * @returns {Object} - Complexity metrics
 */
function analyzeCSharpComplexity(content, includeDetails) {
  // Placeholder implementation with basic metrics
  const ifMatch = content.match(/\bif\s*\(/g);
  const ifCount = ifMatch ? ifMatch.length : 0;
  
  const forMatch = content.match(/\bfor\s*\(/g);
  const forCount = forMatch ? forMatch.length : 0;
  
  const foreachMatch = content.match(/\bforeach\s*\(/g);
  const foreachCount = foreachMatch ? foreachMatch.length : 0;
  
  const whileMatch = content.match(/\bwhile\s*\(/g);
  const whileCount = whileMatch ? whileMatch.length : 0;
  
  const switchMatch = content.match(/\bswitch\s*\(/g);
  const switchCount = switchMatch ? switchMatch.length : 0;
  
  const caseMatch = content.match(/\bcase\s+/g);
  const caseCount = caseMatch ? caseMatch.length : 0;
  
  const catchMatch = content.match(/\bcatch\s*\(/g);
  const catchCount = catchMatch ? catchMatch.length : 0;
  
  const cyclomaticComplexity = 1 + ifCount + forCount + foreachCount + whileCount + 
                              caseCount + catchCount;
  
  return {
    cyclomaticComplexity,
    cognitiveComplexity: cyclomaticComplexity * 1.2, // Simplified estimation
    maxNestingLevel: 0, // Placeholder
    totalMethodCount: 0, // Placeholder
    totalClassCount: 0, // Placeholder
    breakdownByType: {
      ifStatements: ifCount,
      forLoops: forCount,
      foreachLoops: foreachCount,
      whileLoops: whileCount,
      switchStatements: switchCount,
      caseStatements: caseCount,
      catchBlocks: catchCount
    },
    functionDetails: includeDetails ? [] : undefined
  };
}

/**
 * Generate JSON output for complexity analysis
 * @param {Array} sortedResults - Sorted array of [file, complexity] pairs
 * @param {Object} summary - Summary metrics
 * @returns {string} - JSON string
 */
function generateJsonOutput(sortedResults, summary) {
  const result = {
    summary,
    fileComplexity: Object.fromEntries(sortedResults)
  };
  
  return JSON.stringify(result, null, 2);
}

/**
 * Generate CSV output for complexity analysis
 * @param {Array} sortedResults - Sorted array of [file, complexity] pairs
 * @param {Object} summary - Summary metrics
 * @returns {string} - CSV string
 */
function generateCsvOutput(sortedResults, summary) {
  // Header row
  let csv = 'File,Cyclomatic Complexity,Cognitive Complexity,Line Count,Non-Empty Lines,Size Category,Complexity Density\n';
  
  // Data rows
  for (const [file, complexity] of sortedResults) {
    csv += `"${file}",${complexity.cyclomaticComplexity},${complexity.cognitiveComplexity},${complexity.lineCount},${complexity.nonEmptyLineCount},"${complexity.sizeCategory}",${complexity.complexityDensity.toFixed(2)}\n`;
  }
  
  // Summary section
  csv += '\nSummary:\n';
  csv += `Total Files,${summary.totalFiles}\n`;
  csv += `Total Complexity,${summary.totalComplexity}\n`;
  csv += `Average Complexity,${summary.averageComplexity.toFixed(2)}\n`;
  csv += `High Complexity Files (>${summary.threshold}),${summary.highComplexityFiles}\n`;
  csv += `High Complexity Percentage,${summary.highComplexityPercentage.toFixed(2)}%\n`;
  
  return csv;
}

/**
 * Generate HTML output for complexity analysis
 * @param {Array} sortedResults - Sorted array of [file, complexity] pairs
 * @param {Object} summary - Summary metrics
 * @param {number} threshold - Complexity threshold for highlighting
 * @returns {string} - HTML string
 */
function generateHtmlOutput(sortedResults, summary, threshold) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Complexity Analysis - CodeInsight AI</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      border-radius: 8px;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0077cc;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      flex: 1;
      min-width: 200px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin-top: 0;
      font-size: 16px;
      color: #555;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #0077cc;
    }
    .chart-container {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .chart-box {
      flex: 1;
      padding: 10px;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #0077cc;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .high {
      background-color: #ffcccc;
    }
    .medium {
      background-color: #fff2cc;
    }
    .progress {
      height: 10px;
      background-color: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background-color: #0077cc;
    }
    .progress-bar.high {
      background-color: #dc3545;
    }
    .progress-bar.medium {
      background-color: #ffc107;
    }
    .search {
      margin-bottom: 20px;
    }
    .search input {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .filters select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Code Complexity Analysis</h1>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total Files</h3>
        <div class="summary-value">${summary.totalFiles}</div>
      </div>
      <div class="summary-card">
        <h3>Average Complexity</h3>
        <div class="summary-value">${summary.averageComplexity.toFixed(1)}</div>
      </div>
      <div class="summary-card">
        <h3>High Complexity Files</h3>
        <div class="summary-value">${summary.highComplexityFiles} (${summary.highComplexityPercentage.toFixed(1)}%)</div>
      </div>
      <div class="summary-card">
        <h3>Total Complexity</h3>
        <div class="summary-value">${summary.totalComplexity}</div>
      </div>
    </div>
    
    <div class="chart-container">
      <div class="chart-box">
        <h3>Complexity Distribution</h3>
        <canvas id="complexityChart"></canvas>
      </div>
      <div class="chart-box">
        <h3>Top 10 Most Complex Files</h3>
        <canvas id="topFilesChart"></canvas>
      </div>
    </div>
    
    <h2>Complexity by File</h2>
    
    <div class="search">
      <input type="text" id="fileSearch" placeholder="Search files..." onkeyup="filterTable()">
    </div>
    
    <div class="filters">
      <select id="sizeFilter" onchange="filterTable()">
        <option value="all">All Sizes</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
        <option value="Very Large">Very Large</option>
      </select>
      
      <select id="complexityFilter" onchange="filterTable()">
        <option value="all">All Complexity</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
    
    <table id="complexityTable">
      <thead>
        <tr>
          <th onclick="sortTable(0)">File</th>
          <th onclick="sortTable(1)">Cyclomatic Complexity</th>
          <th onclick="sortTable(2)">Cognitive Complexity</th>
          <th onclick="sortTable(3)">Size</th>
          <th onclick="sortTable(4)">Complexity Density</th>
        </tr>
      </thead>
      <tbody>
        ${sortedResults.map(([file, complexity]) => {
          const complexityClass = getComplexityClass(complexity.cyclomaticComplexity, threshold);
          return `
          <tr class="${complexityClass}" data-size="${complexity.sizeCategory}" data-complexity="${complexityClass}">
            <td>${file}</td>
            <td>${complexity.cyclomaticComplexity}
              <div class="progress">
                <div class="progress-bar ${complexityClass}" style="width: ${Math.min(100, complexity.cyclomaticComplexity * 3)}%"></div>
              </div>
            </td>
            <td>${complexity.cognitiveComplexity.toFixed(1)}</td>
            <td>${complexity.nonEmptyLineCount} lines (${complexity.sizeCategory})</td>
            <td>${complexity.complexityDensity.toFixed(2)}%</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <script>
    // Prepare data for the charts
    const complexityData = [
      ${sortedResults.filter(([_, c]) => c.cyclomaticComplexity < 5).length},
      ${sortedResults.filter(([_, c]) => c.cyclomaticComplexity >= 5 && c.cyclomaticComplexity < 10).length},
      ${sortedResults.filter(([_, c]) => c.cyclomaticComplexity >= 10 && c.cyclomaticComplexity < 20).length},
      ${sortedResults.filter(([_, c]) => c.cyclomaticComplexity >= 20 && c.cyclomaticComplexity < 30).length},
      ${sortedResults.filter(([_, c]) => c.cyclomaticComplexity >= 30).length}
    ];
    
    // Top 10 files
    const topFiles = ${JSON.stringify(sortedResults.slice(0, 10).map(([file, complexity]) => {
      return { name: file.split('/').pop(), complexity: complexity.cyclomaticComplexity };
    }))};
    
    // Create the charts
    document.addEventListener('DOMContentLoaded', function() {
      // Complexity distribution
      const ctxDist = document.getElementById('complexityChart').getContext('2d');
      new Chart(ctxDist, {
        type: 'bar',
        data: {
          labels: ['1-4', '5-9', '10-19', '20-29', '30+'],
          datasets: [{
            label: 'Number of Files',
            data: complexityData,
            backgroundColor: [
              '#4caf50',
              '#8bc34a',
              '#ffc107',
              '#ff9800',
              '#f44336'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Files by Cyclomatic Complexity'
            }
          }
        }
      });
      
      // Top files chart
      const ctxTop = document.getElementById('topFilesChart').getContext('2d');
      new Chart(ctxTop, {
        type: 'horizontalBar',
        data: {
          labels: topFiles.map(f => f.name),
          datasets: [{
            label: 'Cyclomatic Complexity',
            data: topFiles.map(f => f.complexity),
            backgroundColor: topFiles.map(f => getColorForComplexity(f.complexity, ${threshold}))
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    });
    
    // Utility functions
    function getComplexityClass(value, threshold) {
      if (value >= threshold) return 'high';
      if (value >= threshold / 2) return 'medium';
      return 'low';
    }
    
    function getColorForComplexity(value, threshold) {
      if (value >= threshold) return '#f44336';
      if (value >= threshold / 2) return '#ffc107';
      return '#4caf50';
    }
    
    // Sort table
    function sortTable(n) {
      var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
      table = document.getElementById("complexityTable");
      switching = true;
      dir = "asc";
      
      while (switching) {
        switching = false;
        rows = table.rows;
        
        for (i = 1; i < (rows.length - 1); i++) {
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("TD")[n];
          y = rows[i + 1].getElementsByTagName("TD")[n];
          
          // For numeric columns, convert to numbers
          if (n > 0) {
            const xValue = parseFloat(x.textContent);
            const yValue = parseFloat(y.textContent);
            
            if (dir == "asc") {
              if (xValue > yValue) {
                shouldSwitch = true;
                break;
              }
            } else if (dir == "desc") {
              if (xValue < yValue) {
                shouldSwitch = true;
                break;
              }
            }
          } else {
            if (dir == "asc") {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            } else if (dir == "desc") {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            }
          }
        }
        
        if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          switchcount++;
        } else {
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
    }
    
    // Filter table
    function filterTable() {
      const searchValue = document.getElementById("fileSearch").value.toLowerCase();
      const sizeFilter = document.getElementById("sizeFilter").value;
      const complexityFilter = document.getElementById("complexityFilter").value;
      
      const rows = document.getElementById("complexityTable").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      
      for (let i = 0; i < rows.length; i++) {
        const fileName = rows[i].getElementsByTagName("td")[0].textContent.toLowerCase();
        const size = rows[i].getAttribute("data-size");
        const complexity = rows[i].getAttribute("data-complexity");
        
        const matchesSearch = fileName.includes(searchValue);
        const matchesSize = sizeFilter === "all" || size === sizeFilter;
        const matchesComplexity = complexityFilter === "all" || complexity === complexityFilter;
        
        if (matchesSearch && matchesSize && matchesComplexity) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    }
  </script>
</body>
</html>`;
}

module.exports = {
  analyzeComplexity
};