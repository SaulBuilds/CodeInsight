# CodeInsight AI

A comprehensive CLI tool for AI researchers that analyzes repositories, generates documentation, and integrates with OpenAI API.

## Features

- **Repository Analysis**: Extract and analyze code from a directory
- **OpenAI Integration**: Generate AI-powered documentation about repository architecture
- **Multiple Documentation Types**: Generate architecture docs, user stories, or custom analysis
- **Markdown Output**: All documentation is generated in markdown format for easy viewing and sharing
- **Terminal Rendering**: View documentation directly in your terminal with proper formatting

## Installation

### Global Installation

```bash
npm install -g codeinsight-ai
```

### Local Installation

```bash
npm install codeinsight-ai
```

## Usage

### Analyze Repository

Extract and analyze code from a repository:

```bash
codeinsight analyze [directory] --output analysis.md --exclude dist,build
```

Options:
- `--output, -o`: Output file name (default: "repo_analysis.txt")
- `--exclude, -x`: Additional exclusion pattern(s) (e.g., "dist,build")
- `--max-size, -s`: Maximum file size in bytes to include
- `--save`: Save analysis to server for future reference

### Generate Documentation

Generate documentation from repository code using OpenAI:

```bash
codeinsight generate-docs <repository_id> --type architecture
```

Options:
- `--type`: Type of documentation to generate (architecture, user_stories, custom)
- `--prompt`: Custom prompt for documentation generation (required if type=custom)
- `--api-key`: OpenAI API key (will use OPENAI_API_KEY environment variable if not provided)

### List Repositories

List all analyzed repositories:

```bash
codeinsight list-repos
```

### List Documentation

List all documentation generated for a repository:

```bash
codeinsight list-docs <repository_id>
```

### View Document

View a specific document in the terminal or save as markdown:

```bash
codeinsight view-doc <document_id> --format terminal
```

Options:
- `--format`: Output format: "terminal" or "markdown" (default: "terminal")

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key

## License

MIT