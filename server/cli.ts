import * as fs from 'fs';
import * as path from 'path';

/**
 * Extract all code files from a repository and combine them into a single string
 */
export async function scrapeRepository(options: {
  directory: string;
  exclude?: string[];
  maxSize?: number;
}): Promise<{ content: string; stats: RepositoryStats }> {
  const { directory, exclude = ['.git', 'node_modules'], maxSize } = options;
  let combinedContent = '';
  
  // Statistics
  const stats: RepositoryStats = {
    totalFiles: 0,
    includedFiles: 0,
    excludedFiles: 0,
    totalSizeBytes: 0,
    includedSizeBytes: 0,
    fileTypes: {},
  };
  
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory not found: ${directory}`);
  }
  
  // Recursively traverse the directory
  function traverseDirectory(dirPath: string): void {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      // Skip excluded paths
      if (isExcluded(fullPath, exclude)) {
        if (stat.isFile()) {
          stats.excludedFiles++;
        }
        continue;
      }
      
      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (stat.isFile()) {
        stats.totalFiles++;
        stats.totalSizeBytes += stat.size;
        
        // Skip files larger than maxSize if specified
        if (maxSize && stat.size > maxSize) {
          stats.excludedFiles++;
          continue;
        }
        
        // Skip binary files
        if (!isTextFile(fullPath)) {
          stats.excludedFiles++;
          continue;
        }
        
        // Track file type statistics
        const extension = path.extname(fullPath).toLowerCase();
        if (!stats.fileTypes[extension]) {
          stats.fileTypes[extension] = 0;
        }
        stats.fileTypes[extension]++;
        
        // Add file to combined content
        try {
          const relativePath = path.relative(directory, fullPath);
          const content = fs.readFileSync(fullPath, 'utf8');
          
          combinedContent += `// ${relativePath}\n`;
          combinedContent += `// ------------------------------------------------\n`;
          combinedContent += content;
          combinedContent += '\n\n';
          
          stats.includedFiles++;
          stats.includedSizeBytes += stat.size;
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  }
  
  traverseDirectory(directory);
  
  return {
    content: combinedContent,
    stats,
  };
}

/**
 * Save content to a file
 */
export function saveToFile(filePath: string, content: string): string {
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

/**
 * Check if a file path should be excluded
 */
function isExcluded(filePath: string, exclude: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Exclude if any part of the path matches an exclusion pattern
  return exclude.some(pattern => normalizedPath.includes(pattern));
}

/**
 * Check if a file is a text file (not binary)
 */
function isTextFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath);
    // If a null character (0) is present, assume it's binary
    return !content.includes(0);
  } catch (err) {
    return false;
  }
}

// Types for repository statistics
export interface RepositoryStats {
  totalFiles: number;
  includedFiles: number;
  excludedFiles: number;
  totalSizeBytes: number;
  includedSizeBytes: number;
  fileTypes: Record<string, number>;
}

export default {
  scrapeRepository,
  saveToFile,
};
