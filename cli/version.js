/**
 * Repository Scraper CLI - Version information
 */

// Version using semantic versioning (major.minor.patch)
const VERSION = '1.0.0';

// Release date in YYYY-MM-DD format
const RELEASE_DATE = '2025-04-12';

// Version information for display
const VERSION_INFO = {
  version: VERSION,
  releaseDate: RELEASE_DATE,
  name: 'RepoScraper CLI',
  description: 'A comprehensive CLI tool for AI researchers that analyzes repositories, generates documentation, and integrates with OpenAI API',
  author: 'RepoScraper Team',
  license: 'MIT',
  engines: {
    node: '>=14.0.0'
  }
};

module.exports = {
  VERSION,
  RELEASE_DATE,
  VERSION_INFO
};