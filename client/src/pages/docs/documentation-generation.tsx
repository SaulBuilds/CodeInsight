import DocLayout from "@/components/layout/DocLayout";

export default function DocumentationGenerationPage() {
  return (
    <DocLayout
      title="Documentation Generation"
      description="Generate comprehensive documentation from code using VibeInsights AI and OpenAI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          One of the most powerful features of VibeInsights AI is its ability to generate high-quality documentation
          from source code using OpenAI's language models. This functionality can save you hours of documentation
          work and provide valuable insights into codebases.
        </p>

        <div className="mt-8">
          <h2 id="documentation-types">Documentation Types</h2>
          <p>
            VibeInsights AI supports several types of documentation generation:
          </p>

          <div className="mt-6 space-y-6">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Architecture Documentation</h3>
              <p className="mb-2">
                Comprehensive analysis of the overall system architecture, design patterns, and code organization.
              </p>
              <pre><code>vibeinsights generate-docs --type architecture</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Ideal for understanding the high-level structure of a codebase.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">User Stories</h3>
              <p className="mb-2">
                Reverse-engineered user stories based on the functionality evident in the code.
              </p>
              <pre><code>vibeinsights generate-docs --type user_stories</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Helpful for product teams to understand the existing feature set from a user perspective.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Code Story</h3>
              <p className="mb-2">
                Narrative explanation of how code functions, breaking down complex logic into understandable stories.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Excellent for onboarding new developers and explaining complex algorithms.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Custom Analysis</h3>
              <p className="mb-2">
                Create documentation based on a specific prompt or question about the codebase.
              </p>
              <pre><code>vibeinsights generate-docs --type custom --prompt "Explain the authentication system and identify potential security issues"</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                Flexible approach for targeted documentation needs.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 id="basic-usage">Basic Usage</h2>
          <p>
            To generate documentation, you need to have either:
          </p>
          <ul>
            <li>A previously saved repository (via <code>extract --save</code>)</li>
            <li>A file containing extracted code</li>
            <li>A directory containing the repository</li>
          </ul>

          <h3 className="mt-6">Using a Repository ID</h3>
          <p>
            If you've previously extracted and saved a repository:
          </p>
          <pre><code>vibeinsights generate-docs 1 --type architecture</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Where "1" is the repository ID from <code>list-repos</code> command.
          </p>

          <h3 className="mt-6">Using a File</h3>
          <p>
            If you have a file containing extracted code:
          </p>
          <pre><code>vibeinsights generate-docs --source ./extracted-code.txt --type user_stories</code></pre>

          <h3 className="mt-6">Using a Directory</h3>
          <p>
            You can also specify a directory to extract and analyze in one command:
          </p>
          <pre><code>vibeinsights generate-docs --directory ./my-project --type architecture</code></pre>
        </div>

        <div className="mt-10">
          <h2 id="options">Options</h2>
          <ul>
            <li><code>--type</code>: Type of documentation to generate (architecture, user_stories, code_story, custom)</li>
            <li><code>--source</code>: Path to file containing extracted code</li>
            <li><code>--directory</code>: Path to repository directory</li>
            <li><code>--prompt</code>: Custom prompt for documentation generation (required for type=custom)</li>
            <li><code>--output</code>: Output format (markdown, json, html) or filename</li>
            <li><code>--api-key</code>: OpenAI API key (will use OPENAI_API_KEY environment variable if not provided)</li>
            <li><code>--save</code>: Save the generated documentation to the database</li>
          </ul>
        </div>

        <div className="mt-10">
          <h2 id="code-story">Code Story Feature</h2>
          <p>
            The Code Story feature is particularly useful for explaining complex code structures in a narrative format.
            It breaks down the code into a storytelling structure that's easy for humans to understand.
          </p>

          <h3 className="mt-6">Complexity Levels</h3>
          <p>
            When generating code stories, you can specify the level of detail:
          </p>
          <pre><code>vibeinsights generate-docs --type code_story --complexity detailed</code></pre>

          <p>Available complexity levels:</p>
          <ul>
            <li><code>simple</code>: High-level overview, suitable for non-technical stakeholders</li>
            <li><code>moderate</code>: Balanced explanation with some technical details (default)</li>
            <li><code>detailed</code>: In-depth technical explanation with implementation details</li>
          </ul>
        </div>

        <div className="mt-10 p-6 bg-primary/5 rounded-lg">
          <h2 id="best-practices" className="mt-0">Best Practices</h2>
          <ul>
            <li><strong>Scope appropriately:</strong> For large repositories, focus on a specific directory or component rather than the entire codebase</li>
            <li><strong>Use API keys carefully:</strong> Set your API key via environment variables for security</li>
            <li><strong>Try different documentation types:</strong> Different types provide complementary insights</li>
            <li><strong>Save important documentation:</strong> Use <code>--save</code> to store documentation for future reference</li>
            <li><strong>Fine-tune with custom prompts:</strong> For the custom documentation type, experiment with detailed prompts to get the most relevant information</li>
          </ul>
        </div>

        <div className="mt-10">
          <h2 id="managing-docs">Managing Documentation</h2>
          <p>
            VibeInsights AI provides commands to manage generated documentation:
          </p>

          <h3 className="mt-6">Listing Documents</h3>
          <pre><code>vibeinsights list-docs 1</code></pre>
          <p>
            Lists all documentation generated for repository ID 1.
          </p>

          <h3 className="mt-6">Viewing Documents</h3>
          <pre><code>vibeinsights view-doc 1</code></pre>
          <p>
            Displays document with ID 1 in the terminal.
          </p>
          <pre><code>vibeinsights view-doc 1 --format markdown</code></pre>
          <p>
            Saves document with ID 1 as a markdown file.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="examples">Examples</h2>

          <h3 className="mt-6">Generate Architectural Documentation</h3>
          <pre><code>vibeinsights generate-docs --directory ./my-app --type architecture --save</code></pre>
          <p>
            This generates comprehensive architectural documentation for the repository in the ./my-app directory
            and saves it to the database.
          </p>

          <h3 className="mt-6">Generate User Stories</h3>
          <pre><code>vibeinsights generate-docs 1 --type user_stories --output user-stories.md</code></pre>
          <p>
            This generates user stories for repository ID 1 and saves them to a markdown file.
          </p>

          <h3 className="mt-6">Custom Security Analysis</h3>
          <pre><code>vibeinsights generate-docs --directory ./my-app --type custom \
  --prompt "Analyze the codebase for potential security vulnerabilities, focusing on authentication, data validation, and API endpoints" \
  --output security-analysis.md</code></pre>
          <p>
            This generates a custom security analysis focusing on potential vulnerabilities.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/openai-api">OpenAI API Configuration</a> - How to set up and optimize your OpenAI integration</li>
            <li><a href="/docs/code-story">Code Story</a> - Detailed guide to the narrative code explanation feature</li>
            <li><a href="/docs/user-stories">User Stories</a> - How to use automatically generated user stories</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}