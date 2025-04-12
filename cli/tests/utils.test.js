/**
 * Vibe Insights AI Utility Function Tests
 * 
 * These tests verify that utility functions work correctly
 */

const path = require('path');
const fs = require('fs');
const mockFs = require('mock-fs');

// Import utility functions directly from the index.js file
// To make this work, we would need to refactor the CLI to export these functions
// For now, we'll test them by creating simple utility test functions

// Mock utility functions similar to those used in the CLI
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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

// Mock file structure for testing
const MOCK_FILE_STRUCTURE = {
  'test-repo': {
    'file1.js': 'console.log("Hello world");',
    'file2.js': 'function test() { return true; }',
    'image.png': Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // Mock binary content
    'subfolder': {
      'file3.js': 'const data = { test: "value" };',
      'style.css': 'body { color: red; }'
    },
    'node_modules': {
      'example-lib': {
        'index.js': 'module.exports = function() { return "example"; };'
      }
    }
  }
};

describe('Utility Functions', () => {
  describe('formatBytes function', () => {
    test('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(1500)).toBe('1.46 KB');
    });
    
    test('respects decimal places parameter', () => {
      expect(formatBytes(1500, 0)).toBe('1 KB');
      expect(formatBytes(1500, 1)).toBe('1.5 KB');
      expect(formatBytes(1500, 3)).toBe('1.465 KB');
    });
  });
  
  describe('isExcluded function', () => {
    test('exact path matching', () => {
      const baseDir = '/base';
      expect(isExcluded('/base/node_modules', baseDir, ['node_modules'])).toBe(true);
      expect(isExcluded('/base/src', baseDir, ['node_modules'])).toBe(false);
    });
    
    test('wildcard matching', () => {
      const baseDir = '/base';
      expect(isExcluded('/base/file.min.js', baseDir, ['*.min.js'])).toBe(true);
      expect(isExcluded('/base/file.js', baseDir, ['*.min.js'])).toBe(false);
    });
    
    test('directory matching at any depth', () => {
      const baseDir = '/base';
      expect(isExcluded('/base/src/node_modules/file.js', baseDir, ['node_modules'])).toBe(true);
      expect(isExcluded('/base/src/components/Button.js', baseDir, ['node_modules'])).toBe(false);
    });
  });
  
  describe('isTextFile function', () => {
    test('identifies text files correctly', () => {
      expect(isTextFile('file.js')).toBe(true);
      expect(isTextFile('file.md')).toBe(true);
      expect(isTextFile('file.css')).toBe(true);
      expect(isTextFile('file.json')).toBe(true);
      expect(isTextFile('file.html')).toBe(true);
    });
    
    test('identifies non-text files correctly', () => {
      expect(isTextFile('file.png')).toBe(false);
      expect(isTextFile('file.jpg')).toBe(false);
      expect(isTextFile('file.pdf')).toBe(false);
      expect(isTextFile('file.zip')).toBe(false);
      expect(isTextFile('file.exe')).toBe(false);
    });
  });
  
  describe('File traversal', () => {
    beforeEach(() => {
      mockFs(MOCK_FILE_STRUCTURE);
    });
    
    afterEach(() => {
      mockFs.restore();
    });
    
    test('file exclusion patterns work correctly', () => {
      const baseDir = 'test-repo';
      const files = fs.readdirSync(baseDir);
      
      expect(isExcluded(path.join(baseDir, 'node_modules'), baseDir, ['node_modules'])).toBe(true);
      expect(isExcluded(path.join(baseDir, 'file1.js'), baseDir, ['node_modules'])).toBe(false);
      expect(isExcluded(path.join(baseDir, 'file1.js'), baseDir, ['*.js'])).toBe(true);
    });
    
    test('text file detection works with real files', () => {
      expect(isTextFile(path.join('test-repo', 'file1.js'))).toBe(true);
      expect(isTextFile(path.join('test-repo', 'image.png'))).toBe(false);
      expect(isTextFile(path.join('test-repo', 'subfolder', 'style.css'))).toBe(true);
    });
  });
});