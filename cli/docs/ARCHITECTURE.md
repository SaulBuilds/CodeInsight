# Vibe Insights AI Architecture

This document explains the internal architecture of the Vibe Insights AI CLI tool to help developers understand the codebase structure and relationships between components.

## High-Level Architecture

The Vibe Insights AI CLI is structured as a Node.js application with a modular architecture:

```
┌─────────────────────┐
│    CLI Interface    │
│    (Commander)      │
└─────────┬───────────┘
          │
┌─────────▼───────────┐      ┌───────────────────┐
│                     │      │                   │
│  Command Handlers   ├──────►   File System     │
│                     │      │   Operations      │
└─────────┬───────────┘      └───────────────────┘
          │
┌─────────▼───────────┐      ┌───────────────────┐
│                     │      │                   │
│    Core Analyzers   ├──────►  Display Utilities│
│                     │      │                   │
└─────────┬───────────┘      └───────────────────┘
          │
┌─────────▼───────────┐
│                     │
│   External APIs     │
│ (GitHub, OpenAI)    │
│                     │
└─────────────────────┘
```

## Directory Structure

The codebase follows a modular structure:

- `src/`: Main source code
  - `commands/`: CLI command implementations
  - `analyzers/`: Code analysis modules
  - `api/`: External API integrations
  - `utils/`: Shared utility functions
- `tests/`: Test files for all modules
- `docs/`: Internal documentation

## Core Components

### CLI Interface (`src/index.js`)

The main entry point that sets up the Commander.js CLI interface, defines commands, and handles routing to the appropriate functionality.

Key responsibilities:
- Parse command-line arguments
- Set up command structure and help text
- Route to appropriate command handler
- Handle global options
- Configure error handling

### Command Handlers (`src/commands/index.js`)

Implements the actual functionality for each CLI command, integrating various analyzers and utilities.

Key responsibilities:
- Implement interactive workflows
- Handle command-specific options
- Coordinate between analyzers and output formatting
- Manage user interactions via inquirer
- Connect to GitHub API when needed

### Analyzers

Specialized modules for different types of code analysis:

1. **Complexity Analyzer** (`src/analyzers/complexity-analyzer.js`)
   - Calculates cyclomatic complexity, nesting depth, and other metrics
   - Generates complexity reports in various formats
   - Supports different programming languages

2. **Dependency Analyzer** (`src/analyzers/dep-analyzer.js`)
   - Extracts import/require statements
   - Builds dependency graphs
   - Detects circular dependencies
   - Visualizes dependencies

3. **Code Search** (`src/analyzers/search.js`)
   - Performs semantic search using OpenAI embeddings
   - Implements keyword-based search as fallback
   - Integrates Tree-sitter for parsing code into Abstract Syntax Trees (ASTs), enabling filtering by code construct type (functions, classes, etc.) during search.
   - Handles context retrieval around matches

4. **Tech Stack Detector** (`src/analyzers/tech-detector.js`)
   - Identifies programming languages, frameworks, and libraries
   - Detects build tools and configuration
   - Checks for outdated dependencies
   - Generates recommendations

### API Integrations

Modules for interacting with external services:

1. **GitHub API** (`src/api/github-auth.js`)
   - Handles OAuth authentication flow
   - Manages token storage and refresh
   - Provides repository listing/access
   - Enables cloning repositories

2. **OpenAI Integration** (`src/api/openai-utils.js`)
   - Manages API key handling
   - Implements prompts for various documentation types
   - Handles rate limiting and errors
   - Formats AI responses

### Utilities

Shared functions used across the application:

1. **Display Utilities** (`src/utils/display.js`)
   - Handles terminal output formatting
   - Implements ASCII art logo
   - Manages color coding and terminal formatting
   - Provides progress indicators and spinners

2. **File Utilities** (`src/utils/file.js`)
   - Manages file operations
   - Handles repository content extraction
   - Implements file filtering and path resolution
   - Manages temporary file handling

3. **Constants** (`src/utils/constants.js`)
   - Centralizes configuration values
   - Defines paths for data storage
   - Manages version information
   - Stores API configuration

## Data Flow

1. User invokes a CLI command
2. Command is parsed by Commander.js
3. Appropriate command handler is called
4. Command handler coordinates between analyzers/APIs
5. Results are formatted and displayed
6. Data is stored in user config directory if needed

## Authentication Flows

### GitHub OAuth Flow

1. User runs a command that requires GitHub access
2. CLI checks for stored token in `~/.vibeinsights/github-token.json`
3. If no token exists, a local server is started on port 3000
4. User is redirected to GitHub OAuth page
5. After authentication, GitHub redirects to local server
6. Authorization code is exchanged for access token
7. Token is stored locally for future use

### OpenAI API Key Management

1. CLI checks for API key in environment variables
2. If not found, checks for stored key
3. If still not found, prompts user for key
4. Validates key before use
5. Optionally stores key for future use

## Extension Points

The CLI is designed to be extensible in these areas:

1. **Analyzers**: New analyzers can be added to `src/analyzers/`
2. **Documentation Types**: New AI documentation types can be added to `src/api/openai-utils.js`
3. **Output Formats**: New formats can be implemented in each analyzer

## Performance Considerations

- Large repositories: The CLI uses streaming and chunking for handling large codebases
- API rate limits: Implements retries, throttling, and caching
- Memory usage: Processes files incrementally to manage memory usage