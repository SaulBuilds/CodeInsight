import DocLayout from "@/components/layout/DocLayout";

export default function DependencyAnalysisPage() {
  return (
    <DocLayout
      title="Dependency Analysis"
      description="Analyze and visualize code dependencies with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI's dependency analysis tool helps you understand the relationships between files in your codebase.
          It analyzes imports, exports, and includes to create a dependency graph that visualizes how your code components
          are connected.
        </p>
        
        <div className="mt-8">
          <h2 id="basic-usage">Basic Usage</h2>
          <p>
            To analyze dependencies in a repository, use the <code>analyze-deps</code> command:
          </p>
          <pre><code>vibeinsights analyze-deps --directory ./path/to/repo</code></pre>
          
          <p className="mt-4">
            This will analyze all files in the repository and create a visual representation of their dependencies.
            By default, the output is displayed in the terminal, but you can specify different output formats.
          </p>
        </div>
        
        <div className="mt-8">
          <h2 id="output-formats">Output Formats</h2>
          <p>
            VibeInsights AI supports several output formats for dependency analysis:
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">DOT Format</h3>
              <p className="mb-2">
                Outputs a DOT language file that can be visualized with Graphviz or other graph visualization tools.
              </p>
              <pre><code>vibeinsights analyze-deps --directory ./my-project --output dot</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This creates a file named <code>dependencies.dot</code> that you can convert to an image using Graphviz.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">JSON Format</h3>
              <p className="mb-2">
                Outputs the dependency information as structured JSON data.
              </p>
              <pre><code>vibeinsights analyze-deps --directory ./my-project --output json</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Useful for programmatic processing or integration with other tools.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">HTML Format</h3>
              <p className="mb-2">
                Creates an interactive HTML visualization using D3.js.
              </p>
              <pre><code>vibeinsights analyze-deps --directory ./my-project --output html</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Opens in your browser for an interactive, zoomable dependency graph.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 id="advanced-options">Advanced Options</h2>
          <p>
            The dependency analyzer supports several options to customize the analysis:
          </p>
          
          <h3 className="mt-6">Filtering Files</h3>
          <p>
            You can specify which files to include in the analysis:
          </p>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --filter "src/**/*.js,src/**/*.jsx"</code></pre>
          
          <h3 className="mt-6">Excluding Files</h3>
          <p>
            Similarly, you can exclude certain files or patterns:
          </p>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --exclude "**/*.test.js,**/*.spec.js"</code></pre>
          
          <h3 className="mt-6">Depth Control</h3>
          <p>
            Control the maximum depth of the dependency graph (useful for large codebases):
          </p>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --depth 3</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This limits the graph to show dependencies up to 3 levels deep.
          </p>
          
          <h3 className="mt-6">Highlighting Circular Dependencies</h3>
          <p>
            Circular dependencies can lead to maintenance issues and bugs. Highlight them in the output:
          </p>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --highlight-circular</code></pre>
          
          <h3 className="mt-6">Including External Dependencies</h3>
          <p>
            By default, the analyzer focuses on internal dependencies. Include external dependencies with:
          </p>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --show-external</code></pre>
        </div>
        
        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="interpreting-results" className="mt-0">Interpreting Results</h2>
          <p>
            The dependency graph provides important insights about your codebase:
          </p>
          
          <ul className="mt-4">
            <li>
              <strong>Highly connected nodes:</strong> Files with many incoming or outgoing dependencies might be candidates for refactoring or modularization
            </li>
            <li>
              <strong>Circular dependencies:</strong> Highlighted in red (when using <code>--highlight-circular</code>), these can lead to issues and should be resolved
            </li>
            <li>
              <strong>Isolated clusters:</strong> Groups of files that are tightly connected internally but loosely connected to the rest of the codebase
            </li>
            <li>
              <strong>Central nodes:</strong> Files that serve as hubs in the dependency network, often representing core utilities or shared components
            </li>
          </ul>
        </div>
        
        <div className="mt-8">
          <h2 id="examples">Examples</h2>
          
          <h3 className="mt-6">Basic HTML Visualization</h3>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --output html</code></pre>
          <p>
            Creates an interactive HTML visualization of all dependencies in the project.
          </p>
          
          <h3 className="mt-6">Focused Analysis of Core Modules</h3>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --filter "src/core/**/*.js" --output html</code></pre>
          <p>
            Analyzes dependencies only within the core modules.
          </p>
          
          <h3 className="mt-6">Finding Circular Dependencies</h3>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --highlight-circular --output dot</code></pre>
          <p>
            Generates a DOT file that highlights circular dependencies in red.
          </p>
          
          <h3 className="mt-6">Comprehensive Analysis</h3>
          <pre><code>vibeinsights analyze-deps --directory ./my-project --output html --show-external --highlight-circular</code></pre>
          <p>
            Creates a comprehensive HTML visualization that includes external dependencies and highlights circular dependencies.
          </p>
        </div>
        
        <div className="mt-8">
          <h2 id="using-with-graphviz">Using with Graphviz</h2>
          <p>
            When generating DOT format output, you can convert it to various image formats using Graphviz:
          </p>
          
          <pre><code># Generate the DOT file
vibeinsights analyze-deps --directory ./my-project --output dot

# Convert to PNG using Graphviz (if installed)
dot -Tpng dependencies.dot -o dependencies.png

# Convert to SVG (for web viewing)
dot -Tsvg dependencies.dot -o dependencies.svg</code></pre>
          
          <p className="text-sm text-muted-foreground mt-2">
            SVG format is recommended for complex graphs as it allows zooming without loss of quality.
          </p>
        </div>
        
        <div className="mt-8">
          <h2 id="technical-details">Technical Details</h2>
          <p>
            The dependency analyzer works by:
          </p>
          
          <ol>
            <li>Scanning the repository for all relevant files (based on filters)</li>
            <li>Parsing each file to identify imports, requires, and includes</li>
            <li>Resolving import paths to actual file paths within the repository</li>
            <li>Building a directed graph of dependencies</li>
            <li>Detecting circular dependencies through graph traversal</li>
            <li>Generating the requested output format</li>
          </ol>
          
          <p>
            The analyzer supports various import styles across different programming languages:
          </p>
          
          <ul>
            <li>JavaScript/TypeScript: ES6 imports, CommonJS requires</li>
            <li>Python: import statements, from-import statements</li>
            <li>Java: import statements</li>
            <li>Go: import statements</li>
            <li>Ruby: require statements</li>
            <li>PHP: include/require statements</li>
          </ul>
        </div>
        
        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/complexity-metrics">Complexity Metrics</a> - Combine with dependency analysis for comprehensive codebase insights</li>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Generate documentation based on your dependency analysis</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}