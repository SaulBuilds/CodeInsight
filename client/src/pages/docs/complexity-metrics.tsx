import DocLayout from "@/components/layout/DocLayout";

export default function ComplexityMetricsPage() {
  return (
    <DocLayout
      title="Complexity Metrics"
      description="Analyze code complexity to identify potential issues with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI's complexity analysis tool helps you identify complex and potentially problematic areas
          in your codebase. By measuring various complexity metrics, you can pinpoint files and functions that might
          benefit from refactoring or additional documentation.
        </p>

        <div className="mt-8">
          <h2 id="basic-usage">Basic Usage</h2>
          <p>
            To analyze code complexity in a repository, use the <code>complexity</code> command:
          </p>
          <pre><code>vibeinsights complexity --directory ./path/to/repo</code></pre>
          
          <p className="mt-4">
            This scans all files in the repository, calculates complexity metrics, and displays the results
            with the most complex files listed first.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="complexity-metrics">Complexity Metrics</h2>
          <p>
            VibeInsights AI analyzes several metrics to evaluate code complexity:
          </p>

          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Cyclomatic Complexity</h3>
              <p>
                Measures the number of linearly independent paths through a program's source code.
                Higher numbers indicate more complex code that is harder to test and maintain.
              </p>
              <ul className="mt-2">
                <li>1-5: Simple, low risk</li>
                <li>6-10: Moderately complex, moderate risk</li>
                <li>11-20: Complex, high risk</li>
                <li>21+: Very complex, very high risk</li>
              </ul>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Cognitive Complexity</h3>
              <p>
                Measures how difficult code is to understand for humans. It considers factors like
                nesting, control flow structures, and logical operators.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Halstead Complexity Measures</h3>
              <p>
                A set of metrics that calculate program difficulty, effort required to understand,
                and estimated number of bugs based on the number of operators and operands.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Maintainability Index</h3>
              <p>
                A composite metric that evaluates how maintainable the code is, combining cyclomatic
                complexity, lines of code, and Halstead volume.
              </p>
              <ul className="mt-2">
                <li>85-100: Highly maintainable</li>
                <li>65-85: Moderately maintainable</li>
                <li>0-65: Difficult to maintain</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="output-formats">Output Formats</h2>
          <p>
            VibeInsights AI supports multiple output formats for complexity analysis:
          </p>

          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Terminal Output</h3>
              <p>
                Default colored output in the terminal, sorting files by complexity.
              </p>
              <pre><code>vibeinsights complexity --directory ./my-project</code></pre>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">JSON Format</h3>
              <p>
                Structured data format for programmatic processing.
              </p>
              <pre><code>vibeinsights complexity --directory ./my-project --output json</code></pre>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">CSV Format</h3>
              <p>
                Comma-separated values for importing into spreadsheets.
              </p>
              <pre><code>vibeinsights complexity --directory ./my-project --output csv</code></pre>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">HTML Report</h3>
              <p>
                Interactive HTML report with detailed complexity visualization.
              </p>
              <pre><code>vibeinsights complexity --directory ./my-project --output html</code></pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="advanced-options">Advanced Options</h2>
          <p>
            Customize the complexity analysis with these options:
          </p>

          <h3 className="mt-6">Language Filtering</h3>
          <p>
            Focus on files of a specific programming language:
          </p>
          <pre><code>vibeinsights complexity --directory ./my-project --language javascript</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Supported languages: javascript, typescript, python, java, cpp, go, ruby, php, csharp
          </p>

          <h3 className="mt-6">File Filtering</h3>
          <p>
            Analyze only files matching specific patterns:
          </p>
          <pre><code>vibeinsights complexity --directory ./my-project --filter "src/**/*.js"</code></pre>

          <h3 className="mt-6">File Exclusion</h3>
          <p>
            Exclude files matching specific patterns:
          </p>
          <pre><code>vibeinsights complexity --directory ./my-project --exclude "**/*.test.js,**/*.spec.js"</code></pre>

          <h3 className="mt-6">Complexity Threshold</h3>
          <p>
            Highlight files above a specific complexity threshold:
          </p>
          <pre><code>vibeinsights complexity --directory ./my-project --threshold 15</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Files with cyclomatic complexity above 15 will be highlighted as high-risk.
          </p>

          <h3 className="mt-6">Detailed Function Analysis</h3>
          <p>
            Show complexity breakdown by function/method:
          </p>
          <pre><code>vibeinsights complexity --directory ./my-project --details</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This provides a more granular view of complexity at the function level.
          </p>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="interpreting-results" className="mt-0">Interpreting Results</h2>
          <p>
            When analyzing complexity results, consider these guidelines:
          </p>

          <ul className="mt-4">
            <li>
              <strong>Focus on outliers:</strong> Files with significantly higher complexity than the project average
              should be prioritized for refactoring
            </li>
            <li>
              <strong>Look for patterns:</strong> If multiple files in the same module have high complexity, 
              consider architectural changes
            </li>
            <li>
              <strong>Consider file size:</strong> Large, complex files are prime candidates for breaking down into smaller modules
            </li>
            <li>
              <strong>Function-level analysis:</strong> Use the <code>--details</code> option to identify specific functions that
              need attention
            </li>
            <li>
              <strong>Balance improvement efforts:</strong> Focus on high-risk areas first, especially those that change frequently
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="examples">Examples</h2>

          <h3 className="mt-6">Basic Complexity Report</h3>
          <pre><code>vibeinsights complexity --directory ./my-project</code></pre>
          <p>
            Generates a terminal output listing files by complexity.
          </p>

          <h3 className="mt-6">Detailed HTML Report</h3>
          <pre><code>vibeinsights complexity --directory ./my-project --output html --details</code></pre>
          <p>
            Creates an interactive HTML report with function-level complexity breakdown.
          </p>

          <h3 className="mt-6">JavaScript-Only Analysis</h3>
          <pre><code>vibeinsights complexity --directory ./my-project --language javascript --threshold 10</code></pre>
          <p>
            Analyzes only JavaScript files, highlighting those with complexity above 10.
          </p>

          <h3 className="mt-6">Core Module Analysis</h3>
          <pre><code>vibeinsights complexity --directory ./my-project --filter "src/core/**/*" --output json</code></pre>
          <p>
            Analyzes only files in the core module, outputting results as JSON.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="technical-details">Technical Details</h2>
          <p>
            The complexity analyzer works by:
          </p>

          <ol>
            <li>Scanning the repository for relevant files based on language and filters</li>
            <li>Parsing each file to create an abstract syntax tree (AST)</li>
            <li>Analyzing the AST to calculate complexity metrics</li>
            <li>For function-level analysis, identifying individual functions/methods in the code</li>
            <li>Calculating metrics for each function when detailed analysis is requested</li>
            <li>Generating the requested output format with results</li>
          </ol>

          <p className="mt-4">
            The analysis is language-specific, with different parsers and metrics for each supported language.
            The tool uses specialized static analysis libraries for each language to ensure accurate results.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/dependency-analysis">Dependency Analysis</a> - Combine with complexity metrics for comprehensive codebase insights</li>
            <li><a href="/docs/code-story">Code Story</a> - Generate narrative explanations for complex code sections</li>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Create detailed documentation for complex components</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}