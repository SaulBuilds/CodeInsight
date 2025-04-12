import DocLayout from "@/components/layout/DocLayout";

export default function ReportIssuePage() {
  return (
    <DocLayout
      title="Report an Issue"
      description="Learn how to report issues with VibeInsights AI and contribute to its improvement"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">How to Report Issues</h2>
        <p>
          If you encounter a bug, have a feature request, or want to suggest an improvement to VibeInsights AI,
          we welcome your feedback. This page explains how to report issues effectively.
        </p>

        <div className="mt-8">
          <h2 id="github-issues">GitHub Issues</h2>
          <p>
            The primary way to report issues is through GitHub Issues on the VibeInsights AI repository:
          </p>
          
          <div className="mt-4 flex justify-center">
            <a 
              href="https://github.com/SaulBuilds/vibeinsights/issues/new/choose" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Create a GitHub Issue
            </a>
          </div>
          
          <p className="mt-6">
            When creating an issue, you'll be presented with several templates:
          </p>
          
          <ul>
            <li><strong>Bug Report</strong> - For reporting errors, unexpected behavior, or crashes</li>
            <li><strong>Feature Request</strong> - For suggesting new features or enhancements</li>
            <li><strong>Documentation Issue</strong> - For reporting issues with the documentation</li>
            <li><strong>Performance Issue</strong> - For reporting performance problems</li>
          </ul>
          
          <p className="mt-4">
            Choose the appropriate template and follow the instructions to provide all necessary information.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="effective-reports">Writing Effective Bug Reports</h2>
          <p>
            A good bug report includes the following information:
          </p>
          
          <div className="mt-4 p-6 border border-border rounded-lg">
            <h3 className="mt-0 mb-4">Essential Information</h3>
            
            <ul className="mb-0">
              <li>
                <strong>VibeInsights AI Version:</strong>
                <pre><code>vibeinsights --version</code></pre>
              </li>
              <li>
                <strong>Operating System:</strong> Include your OS name and version
              </li>
              <li>
                <strong>Node.js Version:</strong>
                <pre><code>node --version</code></pre>
              </li>
              <li>
                <strong>Steps to Reproduce:</strong> Detailed steps that anyone can follow to reproduce the issue
              </li>
              <li>
                <strong>Expected Behavior:</strong> What you expected to happen
              </li>
              <li>
                <strong>Actual Behavior:</strong> What actually happened (include error messages, screenshots if applicable)
              </li>
              <li>
                <strong>Sample Code/Repository:</strong> If possible, provide a minimal repository that demonstrates the issue
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            <h3>Example Bug Report</h3>
            <div className="p-6 border border-border rounded-lg bg-muted/20">
              <h4 className="mt-0">Error when analyzing TypeScript interfaces with generics</h4>
              
              <p><strong>VibeInsights AI Version:</strong> 2.3.1</p>
              <p><strong>Operating System:</strong> macOS 14.0.1</p>
              <p><strong>Node.js Version:</strong> 18.16.0</p>
              
              <p><strong>Steps to Reproduce:</strong></p>
              <ol>
                <li>Create a TypeScript file with generic interfaces:
                <pre><code>interface Container&lt;T&gt; {
  value: T;
  id: string;
}

interface UserData&lt;U&gt; extends Container&lt;U&gt; {
  username: string;
}</code></pre>
                </li>
                <li>Run complexity analysis:
                <pre><code>vibeinsights complexity --directory ./path/to/file</code></pre>
                </li>
              </ol>
              
              <p><strong>Expected Behavior:</strong></p>
              <p>The complexity analysis should complete successfully</p>
              
              <p><strong>Actual Behavior:</strong></p>
              <p>The command fails with the following error:</p>
              <pre><code>Error: Unable to parse TypeScript file: Unexpected token '&lt;' at position 18</code></pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="feature-requests">Suggesting Features</h2>
          <p>
            When suggesting new features, include:
          </p>
          
          <ul>
            <li><strong>Clear Description:</strong> What the feature should do</li>
            <li><strong>Use Case:</strong> Why this feature would be useful</li>
            <li><strong>Potential Implementation:</strong> If you have ideas on how it could be implemented</li>
            <li><strong>Alternatives:</strong> Any workarounds or alternatives you've considered</li>
          </ul>
          
          <div className="mt-6">
            <h3>Example Feature Request</h3>
            <div className="p-6 border border-border rounded-lg bg-muted/20">
              <h4 className="mt-0">Add support for automatic API documentation generation</h4>
              
              <p><strong>Feature Description:</strong></p>
              <p>
                Add a new documentation type for API endpoint documentation that automatically detects
                API endpoints in the codebase and generates comprehensive documentation including:
              </p>
              <ul>
                <li>Endpoint URL and HTTP method</li>
                <li>Request parameters and body structure</li>
                <li>Response format and status codes</li>
                <li>Authentication requirements</li>
                <li>Examples of requests and responses</li>
              </ul>
              
              <p><strong>Use Case:</strong></p>
              <p>
                This would be extremely useful for developers working with APIs, especially when
                taking over existing projects with limited documentation. It would help team members
                understand the API surface quickly without having to dig through the code.
              </p>
              
              <p><strong>Potential Implementation:</strong></p>
              <p>
                The implementation could leverage existing code extraction and analysis capabilities,
                with specific patterns to identify API routes in common frameworks (Express, Fastify,
                NestJS, etc.). It could then use OpenAI to generate descriptive documentation based
                on the route handlers, middleware, and any existing comments.
              </p>
              
              <p><strong>Alternatives Considered:</strong></p>
              <p>
                Currently using manual documentation or tools like Swagger, but these require explicit
                annotations which are often missing in existing codebases.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="contributing" className="mt-0">Contributing to VibeInsights AI</h2>
          <p>
            We welcome contributions to VibeInsights AI! If you'd like to contribute code, documentation,
            or other improvements:
          </p>
          
          <ol className="mb-0">
            <li>Fork the repository on GitHub</li>
            <li>Create a new branch for your changes</li>
            <li>Make your changes following the coding standards</li>
            <li>Write tests for your changes</li>
            <li>Submit a pull request with a clear description of the changes</li>
          </ol>
          
          <p className="mt-4 mb-0">
            For more detailed information, see the
            <a href="https://github.com/SaulBuilds/vibeinsights/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
              Contributing Guide
            </a>
            in the GitHub repository.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="communication-channels">Other Communication Channels</h2>
          <p>
            In addition to GitHub Issues, you can reach out to the VibeInsights AI team through:
          </p>
          
          <ul>
            <li>
              <strong>Twitter:</strong>
              <a href="https://x.com/saul_loveman" target="_blank" rel="noopener noreferrer">@saul_loveman</a>
            </li>
            <li>
              <strong>npm:</strong>
              <a href="https://www.npmjs.com/package/vibeinsights-ai" target="_blank" rel="noopener noreferrer">vibeinsights-ai package page</a>
            </li>
            <li>
              <strong>Email:</strong> support@vibeinsights.ai
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="security-issues">Reporting Security Issues</h2>
          <p>
            If you discover a security vulnerability, please do NOT report it through public GitHub issues.
            Instead, send an email to security@vibeinsights.ai with details about the vulnerability.
          </p>
          
          <p className="mt-4">
            We take security issues seriously and will respond promptly to fix verified security issues.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Resources</h2>
          <ul>
            <li>
              <a href="https://github.com/SaulBuilds/vibeinsights" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
            </li>
            <li>
              <a href="https://github.com/SaulBuilds/vibeinsights/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                Contributing Guide
              </a>
            </li>
            <li>
              <a href="https://github.com/SaulBuilds/vibeinsights/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer">
                Code of Conduct
              </a>
            </li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}