import DocLayout from "@/components/layout/DocLayout";

export default function OpenAIApiPage() {
  return (
    <DocLayout
      title="OpenAI API Configuration"
      description="Configure and optimize your OpenAI API integration with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI leverages OpenAI's powerful language models to analyze code, generate documentation,
          and provide semantic search capabilities. This page explains how to configure and optimize your
          OpenAI API integration.
        </p>

        <div className="mt-8">
          <h2 id="api-key-setup">API Key Setup</h2>
          <p>
            To use VibeInsights AI's OpenAI-powered features, you need an OpenAI API key. 
            There are several ways to provide your API key:
          </p>

          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Environment Variable (Recommended)</h3>
              <p>
                Set the <code>OPENAI_API_KEY</code> environment variable in your shell:
              </p>
              <pre><code># On Unix/Linux/macOS
export OPENAI_API_KEY="your-api-key"

# On Windows (CMD)
set OPENAI_API_KEY=your-api-key

# On Windows (PowerShell)
$env:OPENAI_API_KEY="your-api-key"</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This is the most secure method as it keeps your API key out of command history and logs.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Command Line Option</h3>
              <p>
                Provide the API key directly with the <code>--api-key</code> option:
              </p>
              <pre><code>vibeinsights generate-docs --api-key="your-api-key" ...</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This option overrides the environment variable if both are provided.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Interactive Prompt</h3>
              <p>
                If no API key is provided via environment variable or command line option, 
                VibeInsights AI will prompt you to enter it interactively:
              </p>
              <pre><code>$ vibeinsights generate-docs ...
OpenAI API key not found. Please enter your API key: _</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                You can choose to save this key for future sessions during the interactive prompt.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="api-key-storage">API Key Storage</h2>
          <p>
            When you choose to save your API key during an interactive prompt, VibeInsights AI stores it securely in your home directory:
          </p>

          <pre><code>~/.vibeinsights/openai-api-key.json</code></pre>

          <p>
            This file uses basic encryption to avoid storing the key in plaintext. For better security, 
            consider using environment variables or a secure credential manager instead of this storage option.
          </p>

          <h3 className="mt-6">Clearing Stored API Keys</h3>
          <p>
            To remove a stored API key, use the <code>logout-openai</code> command:
          </p>
          <pre><code>vibeinsights logout-openai</code></pre>
          <p>
            This will delete the stored API key file.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="api-usage">Features Using OpenAI API</h2>
          <p>
            The following VibeInsights AI features use the OpenAI API:
          </p>

          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Documentation Generation</h3>
              <p>
                Uses OpenAI's language models to generate various types of documentation:
              </p>
              <ul className="mb-0">
                <li>Architecture documentation (<code>--type architecture</code>)</li>
                <li>User stories (<code>--type user_stories</code>)</li>
                <li>Code stories (<code>--type code_story</code>)</li>
                <li>Custom documentation (<code>--type custom</code>)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                These features use gpt-4o, which provides the best balance of quality and cost.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Semantic Search</h3>
              <p>
                Uses OpenAI's embedding models to enable natural language search of your codebase.
              </p>
              <pre><code>vibeinsights search "how does authentication work"</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This feature uses the text-embedding model, which is more cost-effective for search operations.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Custom Analysis</h3>
              <p>
                Uses OpenAI to analyze code based on custom prompts:
              </p>
              <pre><code>vibeinsights generate-docs --type custom --prompt "Identify potential security vulnerabilities"</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This flexible approach allows for specialized analysis based on your specific needs.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="cost-optimization" className="mt-0">Cost Optimization</h2>
          <p>
            Using OpenAI's API incurs costs based on token usage. Here are some tips to optimize costs:
          </p>

          <ul className="mt-4">
            <li>
              <strong>Limit scope:</strong> Focus on specific directories or files instead of analyzing entire repositories
              <pre><code>vibeinsights generate-docs --directory ./src/core</code></pre>
            </li>
            <li>
              <strong>Filter files:</strong> Use <code>--exclude</code> to skip test files, generated code, etc.
              <pre><code>vibeinsights extract --exclude "**/*.test.js,**/*.generated.js,dist/**"</code></pre>
            </li>
            <li>
              <strong>Use appropriate models:</strong> VibeInsights AI automatically selects cost-effective models for each task
            </li>
            <li>
              <strong>Cache results:</strong> Use the <code>--save</code> option to store results for future reference
              <pre><code>vibeinsights generate-docs --save ...</code></pre>
            </li>
            <li>
              <strong>Batch processing:</strong> For large repositories, process code in smaller batches to avoid hitting token limits
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="troubleshooting">Troubleshooting</h2>

          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Authentication Errors</h3>
              <p>
                If you see an error like <code>Error: Authentication failed: Invalid API key provided</code>:
              </p>
              <ul>
                <li>Verify that your API key is correct and hasn't expired</li>
                <li>Check that your API key has sufficient credits</li>
                <li>Try providing the API key explicitly with <code>--api-key</code></li>
                <li>Clear any stored keys with <code>vibeinsights logout-openai</code> and try again</li>
              </ul>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Token Limit Errors</h3>
              <p>
                If you encounter <code>Error: This model's maximum context length is 8192 tokens...</code>:
              </p>
              <ul>
                <li>Reduce the scope of your analysis to fewer files</li>
                <li>Use <code>--exclude</code> to skip less important files</li>
                <li>Set <code>--max-size</code> to limit file sizes</li>
                <li>Focus on specific directories instead of the entire repository</li>
              </ul>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Rate Limit Errors</h3>
              <p>
                If you see <code>Error: Rate limit exceeded...</code>:
              </p>
              <ul>
                <li>VibeInsights AI will automatically retry with exponential backoff</li>
                <li>For frequent usage, consider upgrading your OpenAI plan</li>
                <li>Batch your operations to avoid sending too many requests at once</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="advanced-configuration">Advanced Configuration</h2>
          <p>
            For advanced users, VibeInsights AI provides additional configuration options for the OpenAI API:
          </p>

          <h3 className="mt-6">Model Selection</h3>
          <p>
            Override the default model selection (normally not recommended):
          </p>
          <pre><code>vibeinsights generate-docs --model "gpt-4o"</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Valid model options include gpt-4o, gpt-3.5-turbo, and other OpenAI models. VibeInsights AI defaults to gpt-4o.
          </p>

          <h3 className="mt-6">Temperature Control</h3>
          <p>
            Adjust the creativity/determinism of the output:
          </p>
          <pre><code>vibeinsights generate-docs --temperature 0.2</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Lower values (0.0-0.5) are more deterministic, higher values (0.6-1.0) are more creative. Default is 0.3.
          </p>

          <h3 className="mt-6">Maximum Tokens</h3>
          <p>
            Control the maximum output length:
          </p>
          <pre><code>vibeinsights generate-docs --max-tokens 4000</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Default varies by command. Higher values may result in more comprehensive output but cost more.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Learn about the different types of documentation you can generate</li>
            <li><a href="/docs/semantic-search">Semantic Search</a> - See how to use natural language to search your codebase</li>
            <li><a href="/docs/code-story">Code Story</a> - Explore the narrative code explanation feature</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}