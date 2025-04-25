const { searchCodebase } = require('../src/analyzers/search');
// const { expect } = require('chai'); // Using Jest expect now

// Mock fs.readFileSync to avoid actual file reads during tests if needed
// jest.mock('fs'); 

describe('searchCodebase (Filtering Tests)', () => {
  // Common options for keyword search tests
  const baseOptions = {
    directory: '../test-repo', // Correct path relative to cli/tests/
    useEmbeddings: false, // Focus on keyword search for filtering tests
    apiKey: null // No API key needed for keyword search
  };

  it('filters by function construct type using keyword search', async () => {
    const result = await searchCodebase({
      ...baseOptions,
      query: 'handleError', // More specific query
      filterType: 'function',
      fileExt: ['js'],
    });
    // Check that we found at least one result
    expect(result.results.length).toBeGreaterThan(0);
    // Check that *all* results are functions
    expect(result.results.every(r => r.constructType === 'function')).toBe(true);
    // Check specifically for handleError
    expect(result.results.some(r => r.constructName === 'handleError')).toBe(true);
    // Check that the class Database was NOT found
    expect(result.results.some(r => r.constructName === 'Database')).toBe(false);
  });

  it('filters by class construct type using keyword search', async () => {
    const result = await searchCodebase({
        ...baseOptions,
        query: 'Processor', // More specific query
        filterType: 'class',
        fileExt: ['py'],
    });
    expect(result.results.length).toBeGreaterThan(0);
    // Check that *all* results are classes
    expect(result.results.every(r => r.constructType === 'class')).toBe(true);
    // Check specifically for Processor
    expect(result.results.some(r => r.constructName === 'Processor')).toBe(true);
    // Check that the function process_data was NOT found (if keyword was generic enough)
    // Add more checks if needed
  });

  it('filters by file extension (js) using keyword search', async () => {
    const result = await searchCodebase({
      ...baseOptions,
      query: 'connect', // Query likely only in JS file
      fileExt: ['js'], 
    });
    expect(result.results.length).toBeGreaterThan(0);
    // Check that all results are JS files
    expect(result.results.every(r => r.file.endsWith('.js'))).toBe(true);
    // Check that no Python files were included
    expect(result.results.some(r => r.file.endsWith('.py'))).toBe(false);
  });

  it('filters by file extension (py) using keyword search', async () => {
    const result = await searchCodebase({
        ...baseOptions,
        query: 'process_data', // Query likely only in Py file
        fileExt: ['py'],
    });
    expect(result.results.length).toBeGreaterThan(0);
    // Check that all results are Py files
    expect(result.results.every(r => r.file.endsWith('.py'))).toBe(true);
    // Check that no JS files were included
    expect(result.results.some(r => r.file.endsWith('.js'))).toBe(false);
  });
}); 