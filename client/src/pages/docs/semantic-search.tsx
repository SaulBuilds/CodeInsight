import DocLayout from "@/components/layout/DocLayout";

export default function SemanticSearchPage() {
  return (
    <DocLayout
      title="Semantic Search"
      description="Search your codebase using natural language with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI's semantic search feature lets you search your codebase using natural language queries.
          Unlike traditional text-based search, semantic search understands the meaning and context of your query,
          allowing you to find relevant code even when it doesn't contain the exact keywords you're searching for.
        </p>

        <div className="mt-8">
          <h2 id="basic-usage">Basic Usage</h2>
          <p>
            To search your codebase with a natural language query, use the <code>search</code> command:
          </p>
          <pre><code>vibeinsights search "how does user authentication work" --directory ./path/to/repo</code></pre>
          
          <p className="mt-4">
            This will analyze your query, scan the repository, and return the most semantically relevant code snippets,
            even if they don't explicitly mention "user authentication".
          </p>
        </div>

        <div className="mt-8">
          <h2 id="how-it-works">How It Works</h2>
          <p>
            Semantic search works by:
          </p>
          
          <ol>
            <li>Converting your natural language query into a semantic embedding using OpenAI's models</li>
            <li>Scanning and chunking code files in your repository</li>
            <li>Converting code chunks into semantic embeddings</li>
            <li>Finding code chunks whose embeddings are most similar to your query embedding</li>
            <li>Ranking and presenting the most relevant results</li>
          </ol>
          
          <p className="mt-4">
            This approach finds code that is conceptually related to your query, even when the terminology differs.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="search-options">Search Options</h2>
          <p>
            Customize your search with these options:
          </p>
          
          <h3 className="mt-6">Repository Directory</h3>
          <p>
            Specify which repository to search:
          </p>
          <pre><code>vibeinsights search "error handling patterns" --directory ./my-project</code></pre>
          
          <h3 className="mt-6">Limiting Results</h3>
          <p>
            Control the number of results returned:
          </p>
          <pre><code>vibeinsights search "database connection logic" --limit 5</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Default is 10 results.
          </p>
          
          <h3 className="mt-6">Language Filtering</h3>
          <p>
            Search only files in a specific programming language:
          </p>
          <pre><code>vibeinsights search "async function patterns" --language javascript</code></pre>
          
          <h3 className="mt-6">File Pattern Filtering</h3>
          <p>
            Search only files matching specific patterns:
          </p>
          <pre><code>vibeinsights search "API endpoints" --filter "src/api/**/*.js"</code></pre>
          
          <h3 className="mt-6">File Exclusion</h3>
          <p>
            Exclude files matching specific patterns:
          </p>
          <pre><code>vibeinsights search "test patterns" --exclude "**/*.test.js,**/*.spec.js"</code></pre>
          
          <h3 className="mt-6">Output Format</h3>
          <p>
            Specify the output format:
          </p>
          <pre><code>vibeinsights search "middleware implementation" --output json</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: terminal (default), json, markdown
          </p>
          
          <h3 className="mt-6">Context Size</h3>
          <p>
            Control how much context is shown around matching code:
          </p>
          <pre><code>vibeinsights search "password hashing" --context 10</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Shows 10 lines before and after the matching code (default is 5).
          </p>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="effective-queries" className="mt-0">Writing Effective Queries</h2>
          <p>
            To get the best results from semantic search, follow these tips:
          </p>
          
          <ul className="mt-4">
            <li>
              <strong>Be specific:</strong> "How does the login authentication flow work?" is better than "authentication"
            </li>
            <li>
              <strong>Use natural language:</strong> Write questions or descriptions as you would explain them to a colleague
            </li>
            <li>
              <strong>Include context:</strong> "How are API errors handled in the Express middleware?" provides more context than "error handling"
            </li>
            <li>
              <strong>Specify concepts:</strong> "Find code implementing the Observer pattern" can find pattern implementations even if they're not explicitly named
            </li>
            <li>
              <strong>Ask about functionality:</strong> "How does the application validate user input?" can find validation logic across the codebase
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="example-queries">Example Queries</h2>
          <p>
            Here are some example queries to illustrate the power of semantic search:
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Functional Questions</h3>
              <pre><code>vibeinsights search "How does the application handle file uploads?"</code></pre>
              <pre><code>vibeinsights search "What's the process for user registration?"</code></pre>
              <pre><code>vibeinsights search "How are database transactions managed?"</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Security Questions</h3>
              <pre><code>vibeinsights search "How are passwords stored and verified?"</code></pre>
              <pre><code>vibeinsights search "What authentication mechanisms are used?"</code></pre>
              <pre><code>vibeinsights search "How does the app prevent SQL injection?"</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Architecture Questions</h3>
              <pre><code>vibeinsights search "What design patterns are used in the codebase?"</code></pre>
              <pre><code>vibeinsights search "How is the application's state managed?"</code></pre>
              <pre><code>vibeinsights search "What is the data flow between components?"</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Bug Hunting</h3>
              <pre><code>vibeinsights search "Where might race conditions occur?"</code></pre>
              <pre><code>vibeinsights search "How are edge cases handled in the payment processing?"</code></pre>
              <pre><code>vibeinsights search "Find potential memory leaks"</code></pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="technical-requirements">Technical Requirements</h2>
          <p>
            To use semantic search, you need:
          </p>
          
          <ul>
            <li>An OpenAI API key (set via environment variable OPENAI_API_KEY or --api-key option)</li>
            <li>Internet connectivity (for API calls to OpenAI)</li>
            <li>Sufficient permissions to read the repository files</li>
          </ul>
          
          <div className="mt-4 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
            <h3 className="mt-0 text-yellow-500">API Cost Considerations</h3>
            <p className="mb-0">
              Semantic search uses OpenAI's embedding models, which incur API costs. To minimize costs:
            </p>
            <ul className="mb-0">
              <li>Use file filtering to limit the scope of search</li>
              <li>Cache embeddings for frequently accessed repositories</li>
              <li>Use the --limit option to reduce the number of results</li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="examples">Example Usage Scenarios</h2>
          
          <h3 className="mt-6">Onboarding New Developers</h3>
          <p>
            Help new team members understand your codebase:
          </p>
          <pre><code>vibeinsights search "How does the authentication system work?" --directory ./my-project</code></pre>
          
          <h3 className="mt-6">Finding Implementation Details</h3>
          <p>
            Quickly locate specific functionality:
          </p>
          <pre><code>vibeinsights search "How are PDF reports generated?" --directory ./my-project</code></pre>
          
          <h3 className="mt-6">Security Reviews</h3>
          <p>
            Identify security-related code for review:
          </p>
          <pre><code>vibeinsights search "Where is user input sanitized before database operations?" --directory ./my-project</code></pre>
          
          <h3 className="mt-6">Bug Investigation</h3>
          <p>
            Find code related to reported issues:
          </p>
          <pre><code>vibeinsights search "How are timeout errors handled in API requests?" --directory ./my-project</code></pre>
        </div>

        <div className="mt-8">
          <h2 id="advanced-usage">Advanced Usage</h2>
          
          <h3 className="mt-6">Using with GitHub Integration</h3>
          <p>
            Combine semantic search with GitHub integration for a streamlined workflow:
          </p>
          <pre><code>vibeinsights github
# Select repository interactively
# Choose "Search code semantically" from the options</code></pre>
          
          <h3 className="mt-6">Search with Output to Markdown</h3>
          <p>
            Generate markdown documentation of your search results:
          </p>
          <pre><code>vibeinsights search "API endpoint implementation patterns" --output markdown > api-patterns.md</code></pre>
          
          <h3 className="mt-6">Focused Search</h3>
          <p>
            Combine multiple filtering options for precise results:
          </p>
          <pre><code>vibeinsights search "React component lifecycle handling" --language javascript --filter "src/components/**/*.jsx" --exclude "**/*.test.jsx"</code></pre>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/openai-api">OpenAI API Configuration</a> - Set up and optimize your OpenAI integration</li>
            <li><a href="/docs/GitHub">GitHub Integration</a> - Use semantic search with GitHub repositories</li>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Generate comprehensive documentation based on search results</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}