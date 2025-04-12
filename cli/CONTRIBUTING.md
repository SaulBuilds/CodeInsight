# Contributing to Vibe Insights AI

We're thrilled that you're interested in contributing to Vibe Insights AI! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Bug reports help us make Vibe Insights AI better for everyone. When you submit a bug report, please include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Environment details (OS, Node.js version, etc.)
5. Any relevant logs or error messages

### Suggesting Features

We welcome feature suggestions! When submitting a feature request:

1. Check the existing issues first to avoid duplicates
2. Provide a clear description of the feature
3. Explain how this feature would benefit users
4. If possible, outline how it might be implemented

### Pull Requests

Here's our process for submitting code changes:

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes, following our coding standards
4. Add tests for your changes
5. Update documentation as needed
6. Submit a pull request

#### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring
- `test/` for adding or updating tests

Example: `feature/add-python-analyzer`

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables (see `.env.example`)
4. Run tests to ensure everything is set up correctly: `npm test`

## Coding Standards

### Code Style

We use ESLint and Prettier to maintain consistent code style. Run these before submitting:

```bash
npm run lint
npm run format
```

### Documentation

- Document all public functions, classes, and modules with JSDoc
- Keep documentation up-to-date when making changes
- Include examples in documentation when helpful

### Testing

- Write tests for all new features and bug fixes
- Maintain or improve test coverage
- Test edge cases and error scenarios

## Project Structure

```
cli/
├── src/                  # Source code
│   ├── analyzers/        # Code analysis tools
│   ├── api/              # External API integrations
│   ├── commands/         # CLI command implementations
│   └── utils/            # Shared utilities
├── tests/                # Test files
├── index.js              # Main entry point
└── package.json          # Project configuration
```

### Key Modules

- **analyzers/**: Contains tools for analyzing different aspects of codebases
- **api/**: Integrations with external services like GitHub and OpenAI
- **commands/**: Implementation of CLI commands
- **utils/**: Shared utilities used across the application

## Git Workflow

1. Create a branch for your changes
2. Make small, focused commits with clear messages
3. Keep your branch updated with the main branch
4. Squash trivial commits before submitting your PR

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(search): add semantic search capability`

## Review Process

All submissions require review before being merged:

1. Automated tests must pass
2. Code must follow project standards
3. At least one maintainer must approve changes
4. Documentation must be updated

## Getting Help

If you need help with contributing:

- Open a discussion on GitHub
- Join our community Discord (coming soon)
- Check existing documentation and issues

Thank you for contributing to Vibe Insights AI!