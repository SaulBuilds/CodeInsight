import DocLayout from "@/components/layout/DocLayout";

export default function QuickStartPage() {
  return (
    <DocLayout
      title="Quick Start Guide"
      description="Learn how to use VibeInsights AI to analyze repositories and generate documentation"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="introduction">Introduction</h2>
        <p>
          This quick start guide will help you get up and running with VibeInsights AI. We'll cover the basic workflow for analyzing repositories, extracting code, and generating documentation.
        </p>

        <div className="mt-8">
          <h2 id="basic-commands">Basic Commands</h2>
          <p>
            VibeInsights AI provides several commands for different analysis tasks. Here are the most common commands you'll use:
          </p>

          <div className="mt-6 space-y-6">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">GitHub Integration</h3>
              <p className="mb-2">Connect to GitHub and analyze repositories:</p>
              <pre><code>vibeinsights github</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This interactive command will authenticate with GitHub, let you select a repository, and guide you through the analysis options.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Extract Code</h3>
              <p className="mb-2">Extract and analyze code from a local repository:</p>
              <pre><code>vibe extract --directory ./path/to/repo --output extracted-code.txt</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This extracts all code files from the specified directory, excluding binary files and common excluded directories like node_modules.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Generate Documentation</h3>
              <p className="mb-2">Generate comprehensive documentation from code:</p>
              <pre><code>vibe generate-docs --source extracted-code.txt --type architecture</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Uses OpenAI to analyze the code and generate various types of documentation.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Analyze Dependencies</h3>
              <p className="mb-2">Map dependencies between files:</p>
              <pre><code>vibe analyze-deps --directory ./path/to/repo --output dot</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Analyzes imports and exports to create a visualization of file dependencies.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Analyze Complexity</h3>
              <p className="mb-2">Calculate code complexity metrics:</p>
              <pre><code>vibe complexity --directory ./path/to/repo --output html</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Measures cyclomatic complexity and other metrics to identify potential issues.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Semantic Search</h3>
              <p className="mb-2">Search codebase using natural language:</p>
              <pre><code>vibe search "how does user authentication work" --directory ./path/to/repo</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Uses OpenAI embeddings to find code that semantically matches your query.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 id="typical-workflow">Typical Workflow</h2>
          <p>
            Here's a common workflow for using VibeInsights AI:
          </p>

          <ol className="mt-4">
            <li>
              <strong>Connect to GitHub (optional):</strong>
              <pre><code>vibe github</code></pre>
              <p>Follow the interactive prompts to select and clone a repository.</p>
            </li>
            <li>
              <strong>Alternatively, analyze a local repository:</strong>
              <pre><code>vibe extract --directory ./path/to/local/repo</code></pre>
            </li>
            <li>
              <strong>Generate architectural documentation:</strong>
              <pre><code>vibe generate-docs --type architecture --directory ./path/to/repo</code></pre>
            </li>
            <li>
              <strong>Analyze dependencies to understand the codebase structure:</strong>
              <pre><code>vibe analyze-deps --directory ./path/to/repo --output html</code></pre>
            </li>
            <li>
              <strong>Identify complex areas that might need refactoring:</strong>
              <pre><code>vibe complexity --directory ./path/to/repo --threshold 15</code></pre>
            </li>
            <li>
              <strong>Generate code stories for complex portions:</strong>
              <pre><code>vibe generate-docs --type code-story --source complex-file.js</code></pre>
            </li>
          </ol>
        </div>

        <div className="mt-10 p-6 bg-primary/5 rounded-lg">
          <h2 id="options" className="mt-0">Common Options</h2>
          <p>
            Most VibeInsights AI commands support these options:
          </p>

          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Option</th>
                <th className="text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>--directory, -d</code></td>
                <td>Path to the repository directory (default: current directory)</td>
              </tr>
              <tr>
                <td><code>--output, -o</code></td>
                <td>Output format or file (varies by command)</td>
              </tr>
              <tr>
                <td><code>--exclude, -x</code></td>
                <td>Patterns to exclude (comma-separated)</td>
              </tr>
              <tr>
                <td><code>--api-key, -k</code></td>
                <td>OpenAI API key (overrides environment variable)</td>
              </tr>
              <tr>
                <td><code>--help</code></td>
                <td>Show help for a command</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Next Steps</h2>
          <p>
            After getting familiar with the basic commands, you can explore more advanced features:
          </p>

          <ul>
            <li>Explore the <a href="/docs/GitHub">GitHub Integration</a> for seamless repository analysis</li>
            <li>Learn about <a href="/docs/dependency-analysis">Dependency Analysis</a> to visualize code relationships</li>
            <li>Discover <a href="/docs/semantic-search">Semantic Search</a> capabilities for natural language code queries</li>
            <li>See how to generate <a href="/docs/code-story">Code Stories</a> that explain complex code structures</li>
          </ul>

          <p>
            For a complete reference of all available commands and options, see the <a href="/cli-reference">CLI Reference</a> documentation.
          </p>
        </div>
      </div>
    </DocLayout>
  );
}