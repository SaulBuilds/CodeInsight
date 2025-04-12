import DocLayout from "@/components/layout/DocLayout";

export default function InstallationPage() {
  return (
    <DocLayout
      title="Installation"
      description="Get started with VibeInsights AI by installing it on your system"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="requirements">System Requirements</h2>
        <p>
          Before installing VibeInsights AI, ensure your system meets the following requirements:
        </p>
        <ul>
          <li>Node.js version 14.0.0 or higher</li>
          <li>npm or yarn package manager</li>
          <li>Git (required for repository operations)</li>
        </ul>

        <div className="mt-8">
          <h2 id="npm-installation">Installation via npm</h2>
          <p>
            The recommended way to install VibeInsights AI is through npm. This will install the CLI tool globally on your system, making it available from any terminal.
          </p>
          <pre><code>npm install -g vibeinsights-ai</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This will install the latest stable version of VibeInsights AI and make it available as a global command.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="yarn-installation">Installation via yarn</h2>
          <p>
            If you prefer using yarn, you can install VibeInsights AI with the following command:
          </p>
          <pre><code>yarn global add vibeinsights-ai</code></pre>
        </div>

        <div className="mt-8">
          <h2 id="direct-usage">Using without Installation</h2>
          <p>
            If you prefer not to install the package globally, you can use npx to run VibeInsights AI directly:
          </p>
          <pre><code>npx vibeinsights-ai [command] [options]</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This will download and execute the latest version of VibeInsights AI for the current session only.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="verify-installation">Verifying Installation</h2>
          <p>
            To verify that VibeInsights AI has been installed correctly, run the following command:
          </p>
          <pre><code>vibeinsights --version</code></pre>
          <p>
            This should display the current version of VibeInsights AI. You can also check the available commands by running:
          </p>
          <pre><code>vibeinsights --help</code></pre>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="api-keys" className="mt-0">Setting Up API Keys</h2>
          <p>
            VibeInsights AI integrates with OpenAI's API for generating documentation and performing semantic search. You'll need to provide your OpenAI API key to use these features.
          </p>
          <h3>Option 1: Environment Variables</h3>
          <p>
            Set the <code>OPENAI_API_KEY</code> environment variable in your shell:
          </p>
          <pre><code># On Unix/Linux/macOS
export OPENAI_API_KEY="your-api-key"

# On Windows (CMD)
set OPENAI_API_KEY=your-api-key

# On Windows (PowerShell)
$env:OPENAI_API_KEY="your-api-key"</code></pre>

          <h3>Option 2: Command Line Argument</h3>
          <p>
            Provide the API key directly with the <code>--api-key</code> option when running commands that require it:
          </p>
          <pre><code>vibeinsights generate-docs --api-key="your-api-key" ...</code></pre>

          <h3>Option 3: Interactive Prompt</h3>
          <p>
            If you don't provide an API key, VibeInsights AI will prompt you to enter it when needed.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="github-oauth">GitHub OAuth Setup (Optional)</h2>
          <p>
            To use the GitHub integration features, you need to set up GitHub OAuth credentials:
          </p>
          <ol>
            <li>Create a GitHub OAuth app at <a href="https://github.com/settings/developers" target="_blank" rel="noreferrer">https://github.com/settings/developers</a></li>
            <li>Set the callback URL to <code>http://localhost:3000/callback</code></li>
            <li>Set the <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> environment variables with the credentials from your OAuth app</li>
          </ol>
        </div>

        <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
          <h3 className="text-yellow-500 font-medium mt-0">Troubleshooting Installation</h3>
          <p className="mb-2">If you encounter any issues during installation:</p>
          <ul className="mt-0">
            <li>Make sure your Node.js version is 14.0.0 or higher (<code>node --version</code>)</li>
            <li>Try installing with the <code>--force</code> flag: <code>npm install -g vibeinsights-ai --force</code></li>
            <li>If you get permission errors, you might need to use <code>sudo</code> on Unix-based systems or run your terminal as Administrator on Windows</li>
            <li>Clear npm cache with <code>npm cache clean --force</code> and try installing again</li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="next-steps">Next Steps</h2>
          <p>
            Now that you have VibeInsights AI installed, head over to the <a href="/docs/quick-start">Quick Start Guide</a> to learn how to use the tool and explore its features.
          </p>
        </div>
      </div>
    </DocLayout>
  );
}