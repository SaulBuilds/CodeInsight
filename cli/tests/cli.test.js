/**
 * Vibe Insights AI CLI Tests
 * 
 * These tests verify that the CLI functions correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mockStdin = require('mock-stdin');
const { stdout, stderr } = require('stdout-stderr');
const mockFs = require('mock-fs');

// Path to the CLI
const CLI_PATH = path.join(__dirname, '..', 'index.js');

// Test helpers
function runCommand(args = '') {
  return execSync(`node ${CLI_PATH} ${args}`, { encoding: 'utf8' });
}

// Mock files for testing
const MOCK_FILE_STRUCTURE = {
  'test-repo': {
    'file1.js': 'console.log("Hello world");',
    'file2.js': 'function test() { return true; }',
    'subfolder': {
      'file3.js': 'const data = { test: "value" };'
    },
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
      dependencies: {
        'express': '^4.17.1',
        'react': '^17.0.2'
      }
    }, null, 2),
    '.git': {
      // Mock .git directory structure
      'HEAD': 'ref: refs/heads/main'
    },
    'node_modules': {
      // Mock node_modules directory
      'example-lib': {
        'package.json': JSON.stringify({
          name: 'example-lib',
          version: '2.0.0'
        })
      }
    }
  }
};

describe('Vibe Insights CLI', () => {
  // Redirect stdout and stderr for testing
  beforeEach(() => {
    stdout.start();
    stderr.start();
  });

  afterEach(() => {
    stdout.stop();
    stderr.stop();
    if (mockFs.restore) {
      mockFs.restore();
    }
  });

  describe('Basic CLI functionality', () => {
    test('CLI shows version information', () => {
      const output = runCommand('--version');
      expect(output).toMatch(/\d+\.\d+\.\d+/);
    });

    test('CLI shows help information', () => {
      const output = runCommand('--help');
      expect(output).toContain('Usage:');
      expect(output).toContain('Commands:');
      expect(output).toContain('Options:');
      // Check command presence
      expect(output).toContain('extract');
      expect(output).toContain('github');
      expect(output).toContain('complexity');
    });

    test('CLI has correct name in help output', () => {
      const output = runCommand('--help');
      expect(output).toContain('vibe');
      expect(output).not.toContain('codeinsight');
    });
  });

  describe('Code extraction functionality', () => {
    beforeEach(() => {
      mockFs(MOCK_FILE_STRUCTURE);
    });

    afterEach(() => {
      mockFs.restore();
    });

    test('Extract command works with directory option', () => {
      const output = runCommand('extract -d test-repo');
      expect(output).toContain('Extracting code from repository');
      expect(output).toContain('Extracted code from');
      expect(output).toContain('files');
    });

    test('Extract command respects exclude patterns', () => {
      const output = runCommand('extract -d test-repo -x node_modules,.git');
      expect(output).toContain('Extracting code from repository');
      expect(output).toContain('Extracted code from');
      // Should not contain node_modules files
      expect(output).not.toContain('example-lib');
    });
  });

  describe('Tech stack detection', () => {
    beforeEach(() => {
      mockFs(MOCK_FILE_STRUCTURE);
    });

    afterEach(() => {
      mockFs.restore();
    });

    test('Detect-stack command identifies packages from package.json', () => {
      const output = runCommand('detect-stack -d test-repo');
      expect(output).toContain('Analyzing tech stack');
      expect(output).toContain('Tech stack analysis complete');
      // Should detect JavaScript
      expect(output).toContain('JavaScript');
      // Should detect packages
      expect(output).toContain('express');
      expect(output).toContain('react');
    });
  });

  // Add more test groups for other commands
});