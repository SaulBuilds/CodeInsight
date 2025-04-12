import DocLayout from "@/components/layout/DocLayout";

export default function GitHubIntegrationPage() {
  return (
    <DocLayout
      title="GitHub Integration" 
      description="Connect VibeInsights AI with GitHub to analyze your repositories"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="github-overview">Overview</h2>
        <p>
          VibeInsights AI provides seamless integration with GitHub, allowing you to access, analyze, and generate 
          documentation for any repositories that you have access to on GitHub. This integration uses OAuth to securely 
          authenticate with your GitHub account without needing to store your credentials.
        </p>

        <h2 id="getting-started">Getting Started</h2>
        <p>
          To use the GitHub integration, simply run the following command:
        </p>
        <pre><code>vibeinsights github</code></pre>
        <p>
          This will start an interactive flow that guides you through:
        </p>
        <ol>
          <li>Authenticating with GitHub (opens browser for OAuth)</li>
          <li>Selecting a repository from your GitHub account</li>
          <li>Choosing which analysis or documentation to generate</li>
          <li>Configuring options for the selected operation</li>
        </ol>

        <h2 id="authentication">Authentication Process</h2>
        <p>
          When you first run the <code>github</code> command, VibeInsights will:
        </p>
        <ol>
          <li>Check for existing authentication tokens in <code>~/.vibeinsights/github-token.json</code></li>
          <li>If no valid token exists, launch your default browser to GitHub's OAuth page</li>
          <li>Start a local server on port 3000 to receive the OAuth callback</li>
          <li>After authorization, securely store the token for future use</li>
        </ol>
        <p>
          Your OAuth token is stored locally and is used only to interact with GitHub APIs on your behalf.
        </p>

        <h2 id="repository-selection">Repository Selection</h2>
        <p>
          After authentication, you'll be presented with several options:
        </p>
        <ul>
          <li><strong>Select from my GitHub repositories</strong> - Browse and select from your GitHub repositories</li>
          <li><strong>Enter a public repository URL</strong> - Analyze any public GitHub repository by URL</li>
          <li><strong>Use a local repository</strong> - Select a repository on your local machine</li>
        </ul>
        <p>
          When selecting from your GitHub repositories, you'll see details such as:
        </p>
        <ul>
          <li>Repository name and visibility (public/private)</li>
          <li>Primary language</li>
          <li>Last update date</li>
        </ul>

        <h2 id="analysis-options">Analysis Options</h2>
        <p>
          Once you've selected a repository, VibeInsights offers several analysis options:
        </p>
        <ul>
          <li><strong>Extract code</strong> - Extracts all code files for analysis</li>
          <li><strong>Generate documentation</strong> - Creates architectural docs, user stories, or narrative code stories</li>
          <li><strong>Analyze complexity</strong> - Calculates code complexity metrics</li>
          <li><strong>Analyze dependencies</strong> - Maps dependencies between files</li>
          <li><strong>Search code semantically</strong> - Performs natural language search across the codebase</li>
          <li><strong>Detect tech stack</strong> - Identifies technologies, frameworks, and libraries</li>
        </ul>
        <p>
          For each option, you'll be guided through an interactive process to configure the analysis.
        </p>

        <h2 id="logging-out">Logging Out</h2>
        <p>
          To revoke the stored GitHub credentials, use:
        </p>
        <pre><code>vibeinsights logout</code></pre>
        <p>
          This will remove the stored token from your local machine.
        </p>

        <h2 id="permissions">Required Permissions</h2>
        <p>
          VibeInsights AI requests the following GitHub permissions:
        </p>
        <ul>
          <li><code>repo</code> - To access your repositories (including private ones if you wish to analyze them)</li>
        </ul>
        <p>
          These permissions are used only to clone repositories and list your repositories for selection.
        </p>

        <h2 id="credentials">GitHub OAuth Credentials</h2>
        <p>
          To use the GitHub integration, you need to set the following environment variables:
        </p>
        <ul>
          <li><code>GITHUB_CLIENT_ID</code> - Your GitHub OAuth app client ID</li>
          <li><code>GITHUB_CLIENT_SECRET</code> - Your GitHub OAuth app client secret</li>
        </ul>
        <p>
          If you're a developer building on top of VibeInsights AI, you can register a GitHub OAuth app at 
          <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer">
            https://github.com/settings/developers
          </a>
        </p>
        <p>
          When registering your OAuth app, use <code>http://localhost:3000/callback</code> as the callback URL.
        </p>
      </div>
    </DocLayout>
  );
}