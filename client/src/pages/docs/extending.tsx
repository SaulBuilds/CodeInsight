import DocLayout from "@/components/layout/DocLayout";

export default function ExtendingPage() {
  return (
    <DocLayout
      title="Extending VibeInsights AI"
      description="Learn how to customize and extend VibeInsights AI with your own functionality"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI is designed to be extensible, allowing you to customize its behavior and add new functionality
          through plugins and hooks. This page explains how to extend VibeInsights AI to meet your specific needs.
        </p>

        <div className="mt-8">
          <h2 id="extension-points">Extension Points</h2>
          <p>
            There are several ways to extend VibeInsights AI:
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Plugins</h3>
              <p>
                Create standalone modules that add new commands or enhance existing functionality.
                Plugins are the most common and powerful way to extend VibeInsights AI.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Custom Hooks</h3>
              <p>
                Register callback functions that execute at specific points in the application lifecycle,
                allowing you to modify behavior without creating a full plugin.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Custom Prompts</h3>
              <p>
                Create and share specialized prompts for documentation generation, extending the
                built-in types like architecture, user_stories, and code_story.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Output Formatters</h3>
              <p>
                Develop custom formatters to transform VibeInsights AI's output into specialized formats
                beyond the built-in terminal, JSON, markdown, and HTML options.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="creating-plugins">Creating Plugins</h2>
          <p>
            Plugins are the most comprehensive way to extend VibeInsights AI. A plugin is a Node.js module
            that exports certain functions and metadata.
          </p>
          
          <h3 className="mt-6">Plugin Structure</h3>
          <p>
            A typical plugin has this structure:
          </p>
          
          <pre><code>{`// vibeinsights-plugin-example.js
module.exports = {
  // Plugin metadata
  name: 'example-plugin',
  version: '1.0.0',
  description: 'An example VibeInsights AI plugin',
  
  // Plugin initialization
  initialize: function(context) {
    // Access the VibeInsights AI API through context
    console.log('Example plugin initialized');
    
    // Register commands, hooks, etc.
    context.registerCommand('example', this.exampleCommand);
  },
  
  // Command implementation
  exampleCommand: function(args, options) {
    console.log('Example command executed with args:', args);
    console.log('Options:', options);
    
    // Command implementation...
    return 'Example command completed';
  }
};`}</code></pre>
          
          <h3 className="mt-6">Installation</h3>
          <p>
            Install a plugin using npm:
          </p>
          <pre><code>npm install -g vibeinsights-plugin-example</code></pre>
          
          <p className="mt-4">
            Or by placing it in the plugins directory:
          </p>
          <pre><code>~/.vibeinsights/plugins/</code></pre>
          
          <h3 className="mt-6">Using the Plugin API</h3>
          <p>
            The <code>context</code> object passed to your plugin's <code>initialize</code> function
            provides access to various VibeInsights AI APIs:
          </p>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">API</th>
                  <th className="text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>context.registerCommand(name, handler)</code></td>
                  <td>Register a new command that can be executed from the CLI</td>
                </tr>
                <tr>
                  <td><code>context.registerHook(event, handler)</code></td>
                  <td>Register a hook that executes at a specific lifecycle event</td>
                </tr>
                <tr>
                  <td><code>context.registerPromptType(name, template)</code></td>
                  <td>Register a custom prompt template for documentation generation</td>
                </tr>
                <tr>
                  <td><code>context.registerOutputFormatter(name, formatter)</code></td>
                  <td>Register a custom output formatter</td>
                </tr>
                <tr>
                  <td><code>context.getConfig()</code></td>
                  <td>Access the current configuration</td>
                </tr>
                <tr>
                  <td><code>context.getStorage()</code></td>
                  <td>Access the storage API for persistence</td>
                </tr>
                <tr>
                  <td><code>context.getOpenAI()</code></td>
                  <td>Access the OpenAI client for AI functionality</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="custom-hooks">Using Hooks</h2>
          <p>
            Hooks allow you to inject code at specific points in the VibeInsights AI lifecycle without
            creating a full plugin.
          </p>
          
          <h3 className="mt-6">Available Hooks</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Hook</th>
                  <th className="text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>pre-command</code></td>
                  <td>Executed before any command runs</td>
                </tr>
                <tr>
                  <td><code>post-command</code></td>
                  <td>Executed after any command completes</td>
                </tr>
                <tr>
                  <td><code>pre-extraction</code></td>
                  <td>Before code extraction begins</td>
                </tr>
                <tr>
                  <td><code>post-extraction</code></td>
                  <td>After code has been extracted</td>
                </tr>
                <tr>
                  <td><code>pre-documentation</code></td>
                  <td>Before documentation generation</td>
                </tr>
                <tr>
                  <td><code>post-documentation</code></td>
                  <td>After documentation has been generated</td>
                </tr>
                <tr>
                  <td><code>pre-analysis</code></td>
                  <td>Before code analysis (complexity, dependencies)</td>
                </tr>
                <tr>
                  <td><code>post-analysis</code></td>
                  <td>After code analysis completes</td>
                </tr>
                <tr>
                  <td><code>error</code></td>
                  <td>When an error occurs</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="mt-6">Registering Hooks</h3>
          <p>
            You can register hooks in a plugin:
          </p>
          
          <pre><code>{`// In your plugin's initialize function
context.registerHook('pre-extraction', function(data) {
  console.log('About to extract code from:', data.directory);
  
  // You can modify the data
  data.excludePatterns.push('*.log');
  
  return data; // Return modified data
});

context.registerHook('post-documentation', function(result) {
  console.log('Documentation generated:', result.type);
  
  // You could save to an external system, send notifications, etc.
  
  return result; // Return possibly modified result
});`}</code></pre>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="example-plugin" className="mt-0">Example Plugin: Custom Output Format</h2>
          <p>
            This example plugin adds a new output format that converts documentation to AsciiDoc format:
          </p>
          
          <pre><code>{`// vibeinsights-plugin-asciidoc.js
module.exports = {
  name: 'asciidoc-formatter',
  version: '1.0.0',
  description: 'Adds AsciiDoc output format for VibeInsights AI',
  
  initialize: function(context) {
    // Register a custom output formatter
    context.registerOutputFormatter('asciidoc', this.formatAsciidoc);
    
    console.log('AsciiDoc formatter plugin initialized');
  },
  
  formatAsciidoc: function(content, metadata) {
    // Convert the content to AsciiDoc format
    let output = '';
    
    // Add document title
    output += '= ' + metadata.title + '\\n\\n';
    
    // Add metadata
    output += ':author: VibeInsights AI\\n';
    output += ':revdate: ' + new Date().toISOString().split('T')[0] + '\\n';
    output += ':toc: left\\n';
    output += ':icons: font\\n\\n';
    
    // Add description
    if (metadata.description) {
      output += metadata.description + '\\n\\n';
    }
    
    // Process the content (simplified example)
    // In a real plugin, you would convert markdown or HTML to AsciiDoc
    const asciidocContent = content
      .replace(/^# (.+)$/gm, '== $1')
      .replace(/^## (.+)$/gm, '=== $1')
      .replace(/^### (.+)$/gm, '==== $1')
      .replace(/\\*\\*(.+?)\\*\\*/g, '*$1*')
      .replace(/\\*(.+?)\\*/g, '_$1_')
      .replace(/\`(.+?)\`/g, '`$1`');
    
    output += asciidocContent;
    
    return output;
  }
};`}</code></pre>
          
          <p className="mt-4">
            After installing this plugin, you could use the new format:
          </p>
          <pre><code>vibeinsights generate-docs --type architecture --output asciidoc > architecture.adoc</code></pre>
        </div>

        <div className="mt-8">
          <h2 id="custom-prompts">Custom Prompt Templates</h2>
          <p>
            You can create custom prompt templates for the <code>generate-docs</code> command, allowing
            specialized documentation types.
          </p>
          
          <h3 className="mt-6">Registering a Custom Prompt</h3>
          <pre><code>{`context.registerPromptType('security-audit', {
  systemPrompt: \`You are a cybersecurity expert analyzing code for security vulnerabilities.
Focus on identifying potential security issues such as:
- Injection vulnerabilities (SQL, NoSQL, command injection)
- Authentication and authorization flaws
- Data exposure risks
- XSS and CSRF vulnerabilities
- Insecure deserialization
- Using components with known vulnerabilities
- Missing security headers or configurations

Format your analysis with clear headings, severity ratings, and recommendations for each issue found.\`,
  userPromptTemplate: \`Perform a comprehensive security audit on the following codebase:

{{code}}

Focus on identifying security vulnerabilities, categorize them by severity (Critical, High, Medium, Low),
and provide specific recommendations for fixing each issue.\`
});`}</code></pre>
          
          <p className="mt-4">
            Users could then generate security-focused documentation:
          </p>
          <pre><code>vibeinsights generate-docs --type security-audit --directory ./my-project</code></pre>
        </div>

        <div className="mt-8">
          <h2 id="advanced-plugins">Advanced Plugin Techniques</h2>
          
          <h3 className="mt-6">Storing Plugin Data</h3>
          <p>
            Plugins can use the storage API to persist data:
          </p>
          <pre><code>{`initialize: function(context) {
  this.storage = context.getStorage().getPluginStorage(this.name);
  
  // Later, in your commands or hooks
  this.storage.setItem('key', 'value');
  const value = this.storage.getItem('key');
}`}</code></pre>
          
          <h3 className="mt-6">Using External Libraries</h3>
          <p>
            Plugins can use any npm package:
          </p>
          <pre><code>{`const axios = require('axios');

module.exports = {
  // ... plugin metadata
  
  someCommand: async function(args, options) {
    const response = await axios.get('https://api.example.com/data');
    // Process data...
  }
};`}</code></pre>
          
          <h3 className="mt-6">Creating Interactive Commands</h3>
          <p>
            Plugins can create interactive commands using inquirer:
          </p>
          <pre><code>{`const inquirer = require('inquirer');

module.exports = {
  // ... plugin metadata
  
  interactiveCommand: async function(args, options) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['Option 1', 'Option 2', 'Option 3']
      }
    ]);
    
    // Process based on answers...
  }
};`}</code></pre>
        </div>

        <div className="mt-10">
          <h2 id="distributing">Distributing Your Extensions</h2>
          <p>
            Once you've created a plugin, you can distribute it in several ways:
          </p>
          
          <ul>
            <li>
              <strong>Publish to npm:</strong> The most common method
              <pre><code>npm publish</code></pre>
            </li>
            <li>
              <strong>Share as a Git repository:</strong> Users can install directly from Git
              <pre><code>npm install -g git+https://github.com/username/vibeinsights-plugin-example.git</code></pre>
            </li>
            <li>
              <strong>Local installation:</strong> Users can place the plugin file in their plugins directory
              <pre><code>~/.vibeinsights/plugins/</code></pre>
            </li>
          </ul>
          
          <p className="mt-4">
            When publishing to npm, name your package with the prefix <code>vibeinsights-plugin-</code> to
            make it easily discoverable.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/plugins">Plugins</a> - Discover available plugins</li>
            <li><a href="/docs/configuration">Configuration</a> - Learn how to configure plugins</li>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Understand the documentation system you can extend</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}