import DocLayout from "@/components/layout/DocLayout";

export default function ConfigurationPage() {
  return (
    <DocLayout
      title="Configuration"
      description="Configure VibeInsights AI to match your project's specific needs"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI offers several configuration options to customize its behavior according to your
          project's specific needs. This page explains the various configuration methods and options available.
        </p>

        <div className="mt-8">
          <h2 id="configuration-file">Configuration File</h2>
          <p>
            The primary way to configure VibeInsights AI is through a configuration file named <code>.vibeinsightsrc</code>.
            This file can be placed in your home directory to apply settings globally, or in a project directory
            for project-specific settings.
          </p>
          
          <h3 className="mt-6">Locations (in order of precedence):</h3>
          <ol>
            <li>Project directory: <code>./vibeinsightsrc</code> or <code>./vibeinsightsrc.json</code></li>
            <li>Home directory: <code>~/.vibeinsightsrc</code> or <code>~/.vibeinsightsrc.json</code></li>
          </ol>
          
          <h3 className="mt-6">Format</h3>
          <p>
            The configuration file uses JSON format. Here's an example:
          </p>
          <pre><code>{`{
  "openai": {
    "apiKey": null,  // null means it will be loaded from OPENAI_API_KEY environment variable
    "model": "gpt-4o",
    "temperature": 0.3,
    "maxTokens": 4000
  },
  "extraction": {
    "excludePatterns": [".git", "node_modules", "dist", "build", "*.min.js"],
    "maxFileSize": 500000
  },
  "default": {
    "outputFormat": "terminal"
  },
  "github": {
    "clientId": null,  // null means it will be loaded from GITHUB_CLIENT_ID environment variable
    "clientSecret": null  // null means it will be loaded from GITHUB_CLIENT_SECRET environment variable
  }
}`}</code></pre>
          
          <p className="text-sm text-muted-foreground mt-2">
            You can customize any of these values to match your preferences.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="environment-variables">Environment Variables</h2>
          <p>
            Many settings can be configured through environment variables, which take precedence over
            the configuration file:
          </p>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Environment Variable</th>
                  <th className="text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>OPENAI_API_KEY</code></td>
                  <td>Your OpenAI API key for AI-powered features</td>
                </tr>
                <tr>
                  <td><code>OPENAI_API_MODEL</code></td>
                  <td>The OpenAI model to use (default: gpt-4o)</td>
                </tr>
                <tr>
                  <td><code>VIBEINSIGHTS_OUTPUT_FORMAT</code></td>
                  <td>Default output format: terminal, json, markdown, or html</td>
                </tr>
                <tr>
                  <td><code>VIBEINSIGHTS_STORAGE_DIR</code></td>
                  <td>Directory to store generated documents and analysis results</td>
                </tr>
                <tr>
                  <td><code>GITHUB_CLIENT_ID</code></td>
                  <td>GitHub OAuth client ID for GitHub integration</td>
                </tr>
                <tr>
                  <td><code>GITHUB_CLIENT_SECRET</code></td>
                  <td>GitHub OAuth client secret for GitHub integration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="command-line-options">Command Line Options</h2>
          <p>
            Command-line options have the highest precedence and override both environment variables and
            configuration file settings. The general pattern is:
          </p>
          
          <pre><code>vibeinsights [command] [--option value] [--flag]</code></pre>
          
          <h3 className="mt-6">Common Options</h3>
          <p>
            These options are available in most commands:
          </p>
          
          <div className="mt-4 overflow-x-auto">
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
                  <td>The repository directory to analyze</td>
                </tr>
                <tr>
                  <td><code>--output, -o</code></td>
                  <td>Output format or file</td>
                </tr>
                <tr>
                  <td><code>--exclude, -x</code></td>
                  <td>Patterns to exclude (comma-separated)</td>
                </tr>
                <tr>
                  <td><code>--api-key, -k</code></td>
                  <td>OpenAI API key</td>
                </tr>
                <tr>
                  <td><code>--model, -m</code></td>
                  <td>OpenAI model to use</td>
                </tr>
                <tr>
                  <td><code>--temperature, -t</code></td>
                  <td>Temperature setting for OpenAI (0.0-1.0)</td>
                </tr>
                <tr>
                  <td><code>--max-tokens</code></td>
                  <td>Maximum tokens for OpenAI response</td>
                </tr>
                <tr>
                  <td><code>--verbose, -v</code></td>
                  <td>Enable verbose output</td>
                </tr>
                <tr>
                  <td><code>--quiet, -q</code></td>
                  <td>Suppress non-essential output</td>
                </tr>
                <tr>
                  <td><code>--help, -h</code></td>
                  <td>Show help information</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="mt-6">Command-Specific Options</h3>
          <p>
            Different commands have specific options. Use <code>vibeinsights [command] --help</code> to view them:
          </p>
          <pre><code>vibeinsights generate-docs --help</code></pre>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="configuration-examples" className="mt-0">Configuration Examples</h2>
          
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="mt-0 mb-2">Project-Specific Configuration</h3>
              <p className="mb-2">
                Create a <code>.vibeinsightsrc</code> file in your project directory:
              </p>
              <pre><code>{`{
  "extraction": {
    "excludePatterns": [
      ".git", 
      "node_modules", 
      "dist", 
      "build", 
      "*.min.js", 
      "test/**",
      "**/*.test.js", 
      "coverage/**"
    ],
    "maxFileSize": 250000
  },
  "default": {
    "outputFormat": "markdown"
  }
}`}</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This configuration excludes test files and limits the maximum file size to 250KB.
              </p>
            </div>
            
            <div>
              <h3 className="mt-0 mb-2">Global Configuration</h3>
              <p className="mb-2">
                Create a <code>~/.vibeinsightsrc</code> file in your home directory:
              </p>
              <pre><code>{`{
  "openai": {
    "temperature": 0.2,
    "maxTokens": 8000
  },
  "default": {
    "outputFormat": "terminal"
  }
}`}</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This sets global preferences for OpenAI temperature and maximum tokens.
              </p>
            </div>
            
            <div>
              <h3 className="mt-0 mb-2">Environment Variables Setup</h3>
              <p className="mb-2">
                Add these lines to your <code>~/.bashrc</code> or <code>~/.zshrc</code>:
              </p>
              <pre><code>export OPENAI_API_KEY="your-api-key"
export GITHUB_CLIENT_ID="your-github-client-id"
export GITHUB_CLIENT_SECRET="your-github-client-secret"
export VIBEINSIGHTS_OUTPUT_FORMAT="markdown"</code></pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="storage-configuration">Storage Configuration</h2>
          <p>
            VibeInsights AI stores various data, including:
          </p>
          
          <ul>
            <li>Extracted repository code</li>
            <li>Generated documentation</li>
            <li>GitHub authentication tokens</li>
            <li>OpenAI API keys (if saved)</li>
          </ul>
          
          <p className="mt-4">
            By default, this data is stored in <code>~/.vibeinsights/</code>. You can customize the storage
            location using the <code>VIBEINSIGHTS_STORAGE_DIR</code> environment variable:
          </p>
          
          <pre><code>export VIBEINSIGHTS_STORAGE_DIR="/path/to/custom/storage"</code></pre>
          
          <h3 className="mt-6">Cleaning Storage</h3>
          <p>
            To remove all stored data and start fresh:
          </p>
          <pre><code>vibeinsights clean-storage</code></pre>
          
          <p className="text-sm text-muted-foreground mt-2">
            This removes all saved repositories, documents, and authentication tokens.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="plugins-config">Plugin Configuration</h2>
          <p>
            If you're using plugins (see <a href="/docs/extending">Extending VibeInsights AI</a>), you can configure
            them in the <code>.vibeinsightsrc</code> file:
          </p>
          
          <pre><code>{`{
  "plugins": {
    "my-custom-plugin": {
      "enabled": true,
      "option1": "value1",
      "option2": "value2"
    },
    "another-plugin": {
      "enabled": false
    }
  }
}`}</code></pre>
          
          <p className="text-sm text-muted-foreground mt-2">
            Each plugin can have its own configuration section with custom options.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/extending">Extending VibeInsights AI</a> - Learn how to create plugins and extensions</li>
            <li><a href="/docs/plugins">Plugins</a> - Discover available plugins to enhance functionality</li>
            <li><a href="/docs/openai-api">OpenAI API Configuration</a> - Detailed OpenAI integration settings</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}