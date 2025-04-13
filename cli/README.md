# Vibe Insights AI

A comprehensive CLI tool for AI researchers that analyzes repositories, generates documentation, and integrates with OpenAI API to provide intelligent code insights.

<p align="center">
  <img src="https://raw.githubusercontent.com/SaulBuilds/vibeinsights/main/assets/logo.png" alt="Vibe Insights AI Logo" width="200">
</p>

[![npm version](https://img.shields.io/npm/v/vibeinsights-ai.svg)](https://www.npmjs.com/package/vibeinsights-ai)
[![license](https://img.shields.io/npm/l/vibeinsights-ai.svg)](https://github.com/SaulBuilds/vibeinsights/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dt/vibeinsights-ai.svg)](https://www.npmjs.com/package/vibeinsights-ai)

## Features

- **GitHub Integration**: Authenticate with GitHub to analyze any public or private repository
- **Local Analysis**: Analyze repositories on your local machine
- **Code Extraction**: Extract and process codebases with intelligent filtering
- **OpenAI Integration**: Generate AI-powered documentation using advanced LLMs
- **Multiple Documentation Types**: 
  - Architectural Documentation
  - User Stories
  - Code Story (Narrative Explanations)
  - Custom Analysis with your own prompts
- **Code Complexity Analysis**: Identify complex code with detailed metrics
- **Dependency Analysis**: Visualize dependencies between files
- **Semantic Code Search**: Find code concepts using natural language
- **Tech Stack Detection**: Automatically identify languages, frameworks and libraries
- **Terminal Rendering**: View documentation directly in your terminal with proper formatting
- **Export Options**: Generate output in various formats (Markdown, HTML, JSON, CSV, DOT)

## Installation

### Global Installation (Recommended)

```bash
npm install -g vibeinsights-ai
```

### Local Installation

```bash
npm install vibeinsights-ai
```

### Running with npx

```bash
npx vibeinsights-ai
```

## Quick Start

Run the interactive mode for a guided experience:

```bash
vibeinsights
```

Or use specific commands for direct access to features:

```bash
# Analyze complexity metrics for a codebase
vibeinsights complexity ./my-project

# Extract code from a repository
vibeinsights extract ./my-project

# Generate documentation using OpenAI
vibeinsights generate-docs repo_id

# Search code using natural language
vibeinsights search ./my-project
```

## Complete Command Reference

### Interactive Mode

Start interactive mode to guide you through the process:

```bash
vibeinsights interactive
```

### Extract Code

Extract and analyze code from a repository:

```bash
vibeinsights extract [directory] --output analysis.md --exclude dist,build
```

Options:
- `--output, -o`: Output file name
- `--exclude, -x`: Additional exclusion pattern(s) (e.g., "dist,build")
- `--max-size, -s`: Maximum file size in bytes to include

### Generate Documentation

Generate documentation from repository code using OpenAI:

```bash
# Generate architectural documentation
vibeinsights generate-docs <repository_id> --type architecture

# Generate narrative code story with moderate complexity
vibeinsights generate-docs <repository_id> --type code_story --complexity moderate

# Generate user stories
vibeinsights generate-docs <repository_id> --type user_stories

# Generate custom analysis
vibeinsights generate-docs <repository_id> --type custom --prompt "Your custom prompt here"
```

Options:
- `--type`: Type of documentation to generate (architecture, user_stories, code_story, custom)
- `--complexity`: Complexity level for code stories (simple, moderate, detailed) - only used with type=code_story
- `--prompt`: Custom prompt for documentation generation (required if type=custom)
- `--api-key`: OpenAI API key (will use OPENAI_API_KEY environment variable if not provided)

### List Repositories

List all analyzed repositories:

```bash
vibeinsights list-repos
```

### List Documentation

List all documentation generated for a repository:

```bash
vibeinsights list-docs <repository_id>
```

### View Document

View a specific document in the terminal or save as markdown:

```bash
vibeinsights view-doc <document_id> --format terminal
```

Options:
- `--format`: Output format: "terminal" or "raw" (default: "terminal")

### Analyze Code Complexity

Analyze code complexity metrics:

```bash
vibeinsights complexity <directory> --output json --threshold 15
```

Options:
- `--output`: Output format (json, html, or csv)
- `--threshold`: Complexity threshold for highlighting
- `--language`: Filter by programming language
- `--filter`: Pattern to filter files (glob syntax)
- `--exclude`: Pattern to exclude files (glob syntax)
- `--details`: Whether to show detailed breakdown by function/method

### Analyze Dependencies

Analyze dependencies between files in a codebase:

```bash
vibeinsights analyze-deps <directory> --output dot --depth 10
```

Options:
- `--output`: Output format (dot, json, or html)
- `--depth`: Maximum depth for dependency analysis
- `--filter`: Pattern to filter files (glob syntax)
- `--exclude`: Pattern to exclude files (glob syntax)
- `--highlight-circular`: Whether to highlight circular dependencies
- `--show-external`: Whether to include external dependencies

### Search Code

Search for code patterns or concepts in a repository:

```bash
vibe search <directory> --query "database connection handling" --limit 10
```

Options:
- `--query`: Search query
- `--limit`: Maximum number of results
- `--context`: Lines of context to show
- `--api-key`: OpenAI API key for semantic search
- `--use-embeddings`: Whether to use semantic search with embeddings

### Detect Tech Stack

Detect technology stack used in a repository:

```bash
vibe detect-stack <directory> --output text --scan-deps
```

Options:
- `--output`: Output format (text, json, or md)
- `--scan-deps`: Whether to perform deep dependency scanning
- `--check-outdated`: Whether to check for outdated dependencies

### GitHub Authentication

```bash
# Login to GitHub with default settings
vibe login

# Login using web redirect flow
vibe login --web-redirect

# Login using custom GitHub app credentials 
vibe login --use-custom-app

# Force re-authentication (ignore existing token)
vibe login --force

# Logout of GitHub
vibe logout
```

## Advanced Features

### Code Story Feature

The Code Story feature transforms complex code structures into narrative explanations using OpenAI's language models. It helps developers and researchers understand intricate code by creating engaging stories that explain:

- **Design Decisions**: Why code is structured a certain way
- **Logic Flow**: How data and control flow through the system
- **Complex Algorithms**: Detailed explanations using metaphors and analogies
- **Architecture Patterns**: The reasoning behind architectural choices

Choose from three complexity levels:
- **Simple**: Beginner-friendly explanations focusing on high-level concepts
- **Moderate**: Balanced technical details with narrative storytelling
- **Detailed**: In-depth explanations for experienced developers

Example usage:
```bash
vibe generate-docs repo_id --type code_story --complexity simple
```

### Semantic Code Search

Find code patterns or concepts using natural language queries. This feature leverages OpenAI embeddings to understand semantic meaning:

```bash
vibe search ./my-project --query "error handling for API requests" --use-embeddings
```

### Tech Stack Detection

Automatically identify the languages, frameworks, libraries, and build tools used in a project:

```bash
vibe detect-stack ./my-project --output md --scan-deps --check-outdated
```

This command generates a report that includes:
- Primary programming languages
- Frameworks in use
- Libraries and dependencies
- Build tools and configuration
- Outdated packages that need updating
- Recommendations for improvements

## Environment Variables

### OpenAI Integration
- `OPENAI_API_KEY`: Your OpenAI API key for generating documentation

### GitHub OAuth - For End Users
- `GITHUB_CLIENT_ID`: Your GitHub OAuth app client ID (when using --use-custom-app)
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth app client secret (when using --use-custom-app)

### GitHub OAuth - For VibeInsights Developers
- `VIBE_DEFAULT_GITHUB_CLIENT_ID`: Default client ID for built-in authentication flow
- `VIBE_DEFAULT_GITHUB_CLIENT_SECRET`: Default client secret for built-in authentication flow

## Configuration

Vibe Insights AI stores configuration and generated content in:

```
~/.vibeinsights/
```

This includes:
- `repositories/`: Cloned and analyzed repositories
- `documents/`: Generated documentation
- `github-token.json`: Stored GitHub auth token

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Connect

- [GitHub](https://github.com/SaulBuilds/vibeinsights)
- [Twitter](https://x.com/saul_loveman)
- [npm](https://www.npmjs.com/package/vibeinsights-ai)