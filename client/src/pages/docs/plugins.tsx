import DocLayout from "@/components/layout/DocLayout";

export default function PluginsPage() {
  return (
    <DocLayout
      title="Plugins"
      description="Extend VibeInsights AI functionality with community plugins"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI can be extended with plugins that add new functionality, commands, output formats,
          and integrations. This page lists available plugins and explains how to install and use them.
        </p>

        <div className="mt-8">
          <h2 id="installing-plugins">Installing Plugins</h2>
          <p>
            Most VibeInsights AI plugins are published on npm and can be installed using npm or yarn:
          </p>
          
          <pre><code>npm install -g vibe-plugin-name</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Replace "vibe-plugin-name" with the actual plugin name.
          </p>
          
          <p className="mt-4">
            After installation, restart VibeInsights AI or run any command to activate the plugin.
          </p>
          
          <h3 className="mt-6">Manual Installation</h3>
          <p>
            Alternatively, you can manually install plugins by placing them in the plugins directory:
          </p>
          
          <pre><code>~/.vibeinsights/plugins/</code></pre>
          
          <p className="mt-4">
            Create this directory if it doesn't exist, then place the plugin JavaScript file there.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="managing-plugins">Managing Plugins</h2>
          <p>
            VibeInsights AI provides commands to manage your installed plugins:
          </p>
          
          <h3 className="mt-6">List Installed Plugins</h3>
          <pre><code>vibe list-plugins</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This shows all installed plugins with their versions and descriptions.
          </p>
          
          <h3 className="mt-6">Enable/Disable Plugins</h3>
          <p>
            You can enable or disable plugins without uninstalling them:
          </p>
          <pre><code>vibe disable-plugin plugin-name</code></pre>
          <pre><code>vibe enable-plugin plugin-name</code></pre>
          
          <h3 className="mt-6">Configure Plugins</h3>
          <p>
            Configure plugins in your <code>.vibeinsightsrc</code> file:
          </p>
          <pre><code>{`{
  "plugins": {
    "plugin-name": {
      "enabled": true,
      "option1": "value1",
      "option2": "value2"
    }
  }
}`}</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            See each plugin's documentation for available options.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="official-plugins">Official Plugins</h2>
          <p>
            These plugins are developed and maintained by the VibeInsights AI team:
          </p>
          
          <div className="mt-4 space-y-6">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">vibe-plugin-jira</h3>
              <p className="mb-2">
                Integrates with Jira to create issues, epics, and user stories based on VibeInsights AI analysis.
              </p>
              <pre><code>npm install -g vibe-plugin-jira</code></pre>
              <p className="mt-2">
                <strong>Key features:</strong>
              </p>
              <ul className="mb-0">
                <li>Create Jira issues from user stories</li>
                <li>Link code documentation to Jira epics</li>
                <li>Convert code complexity reports to technical debt tickets</li>
                <li>Synchronize code changes with existing issues</li>
              </ul>
              <p className="mt-4 mb-0">
                <a href="https://github.com/saulbuilds/vibeinsights-plugin-jira" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">vibe-plugin-confluence</h3>
              <p className="mb-2">
                Exports generated documentation to Confluence pages with proper formatting.
              </p>
              <pre><code>npm install -g vibe-plugin-confluence</code></pre>
              <p className="mt-2">
                <strong>Key features:</strong>
              </p>
              <ul className="mb-0">
                <li>Export architecture documentation to Confluence</li>
                <li>Create documentation spaces with proper hierarchy</li>
                <li>Include dependency graphs and complexity analyses</li>
                <li>Maintain version history and page relationships</li>
              </ul>
              <p className="mt-4 mb-0">
                <a href="https://github.com/saulbuilds/vibeinsights-plugin-confluence" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">vibe-plugin-slack</h3>
              <p className="mb-2">
                Integrates with Slack for notifications and sharing analysis results.
              </p>
              <pre><code>npm install -g vibe-plugin-slack</code></pre>
              <p className="mt-2">
                <strong>Key features:</strong>
              </p>
              <ul className="mb-0">
                <li>Send documentation to Slack channels</li>
                <li>Create Slack threads for discussion of analysis results</li>
                <li>Notify team members when analysis completes</li>
                <li>Interactive Slack commands to trigger VibeInsights AI operations</li>
              </ul>
              <p className="mt-4 mb-0">
                <a href="https://github.com/saulbuilds/vibeinsights-plugin-slack" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="community-plugins">Community Plugins</h2>
          <p>
            These plugins are developed by the community and extend VibeInsights AI in various ways:
          </p>
          
          <div className="mt-4 space-y-6">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">vibe-plugin-gitlab</h3>
              <p className="mb-2">
                Adds GitLab integration similar to the built-in GitHub integration.
              </p>
              <pre><code>npm install -g vibe-plugin-gitlab</code></pre>
              <p className="mt-2">
                <strong>Key features:</strong>
              </p>
              <ul className="mb-0">
                <li>Authentication with GitLab</li>
                <li>Repository selection and analysis</li>
                <li>Creation of GitLab documentation wikis</li>
                <li>Integration with GitLab CI/CD pipelines</li>
              </ul>
              <p className="mt-4 mb-0">
                <a href="https://github.com/community-author/vibeinsights-plugin-gitlab" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">vibe-plugin-notion</h3>
              <p className="mb-2">
                Exports generated documentation to Notion pages with proper formatting.
              </p>
              <pre><code>npm install -g vibe-plugin-notion</code></pre>
              <p className="mt-2">
                <strong>Key features:</strong>
              </p>
              <ul className="mb-0">
                <li>Export to Notion pages and databases</li>
                <li>Maintain document hierarchy and relationships</li>
                <li>Convert code blocks with syntax highlighting</li>
                <li>Create Notion templates for different documentation types</li>
              </ul>
              <p className="mt-4 mb-0">
                <a href="https://github.com/community-author/vibeinsights-plugin-notion" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">vibe-plugin-graphql</h3>
              <p className="mb-2">
                Specialized analysis for GraphQL schemas and resolvers.
              </p>
              <pre><code>npm install -g vibe-plugin-graphql</code></pre>
              <p className="mt-2">
                <strong>Key features:</strong>
              </p>
              <ul className="mb-0">
                <li>Generate GraphQL schema documentation</li>
                <li>Analyze resolver complexity and performance</li>
                <li>Visualize GraphQL type relationships</li>
                <li>Detect potential GraphQL security issues</li>
              </ul>
              <p className="mt-4 mb-0">
                <a href="https://github.com/community-author/vibeinsights-plugin-graphql" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="developing-plugins" className="mt-0">Developing Your Own Plugins</h2>
          <p>
            If you want to create your own plugin, check out the <a href="/docs/extending">Extending VibeInsights AI</a> guide for detailed instructions.
          </p>
          
          <p className="mt-4">
            The basic steps are:
          </p>
          
          <ol className="mb-0">
            <li>Create a Node.js module that exports the required plugin interface</li>
            <li>Implement your custom functionality using the VibeInsights AI APIs</li>
            <li>Test your plugin locally</li>
            <li>Publish to npm with the prefix <code>vibe-plugin-</code></li>
          </ol>
        </div>

        <div className="mt-8">
          <h2 id="plugin-usage-examples">Plugin Usage Examples</h2>
          
          <h3 className="mt-6">Exporting to Confluence</h3>
          <p>
            With the Confluence plugin installed:
          </p>
          <pre><code>vibe generate-docs --type architecture --directory ./my-project --output confluence</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This will prompt for your Confluence credentials and space details.
          </p>
          
          <h3 className="mt-6">Creating Jira Issues</h3>
          <p>
            With the Jira plugin installed:
          </p>
          <pre><code>vibe generate-docs --type user_stories --directory ./my-project --output jira --jira-project "PROJ"</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This creates Jira issues from the generated user stories.
          </p>
          
          <h3 className="mt-6">Analyzing GraphQL Schema</h3>
          <p>
            With the GraphQL plugin installed:
          </p>
          <pre><code>{`vibe graphql-analyze --schema ./schema.graphql --output html > schema-analysis.html`}</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This analyzes your GraphQL schema and generates a detailed report.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/extending">Extending VibeInsights AI</a> - Learn how to develop your own plugins</li>
            <li><a href="/docs/configuration">Configuration</a> - Configure plugins and their behavior</li>
            <li><a href="/docs/openai-api">OpenAI API Configuration</a> - Configure the AI integration used by many plugins</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}