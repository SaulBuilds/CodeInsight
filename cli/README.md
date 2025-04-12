# RepoScraper CLI

A comprehensive CLI tool for AI researchers that analyzes repositories, generates documentation, and integrates with OpenAI API.

## Features

- **Repository Analysis**: Scan and extract code from repositories with customizable filters
- **OpenAI Integration**: Generate AI-powered documentation using GPT-4o
- **Multiple Documentation Types**:
  - Architectural Overview
  - User Stories
  - Custom Analysis (using your own prompts)
- **Interactive Terminal UI**: Colorful and informative command-line interface
- **Markdown Export**: Export documentation to markdown files

## Installation

```bash
npm install -g repo-scraper-cli
```

## Usage

### Analyze a Repository

```bash
repo-scraper analyze [directory] [options]
```

Options:
- `-o, --output <filename>` - Output file name (default: "repo_analysis.txt")
- `-x, --exclude <patterns>` - Patterns to exclude (e.g., "node_modules dist")
- `-s, --max-size <size>` - Maximum file size in bytes to include
- `--save` - Save analysis to the server for future reference

### Generate Documentation

```bash
repo-scraper generate-docs <repository_id> [options]
```

Options:
- `--type <type>` - Type of documentation to generate (architecture, user_stories, custom)
- `--prompt <prompt>` - Custom prompt for documentation generation
- `--api-key <key>` - OpenAI API key (optional, will use environment variable if not provided)

### List Repositories

```bash
repo-scraper list-repos
```

### List Documentation for a Repository

```bash
repo-scraper list-docs <repository_id>
```

### View a Document

```bash
repo-scraper view-doc <document_id> [options]
```

Options:
- `--format <format>` - Output format (terminal, markdown)

### Verify OpenAI API Key

```bash
repo-scraper verify-key <api_key>
```

## Environment Variables

- `API_URL` - Base URL for API calls (default: "http://localhost:5000/api")
- `OPENAI_API_KEY` - Your OpenAI API key

## Example

```bash
# Analyze the current directory
repo-scraper analyze .

# Generate architectural documentation
repo-scraper generate-docs 1 --type architecture

# View a document in the terminal
repo-scraper view-doc 1
```

## License

MIT