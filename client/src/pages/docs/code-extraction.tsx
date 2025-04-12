import DocLayout from "@/components/layout/DocLayout";

export default function CodeExtractionPage() {
  return (
    <DocLayout
      title="Repository Analysis"
      description="Extract and analyze code repositories with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI's repository analysis functionality allows you to extract all code files from a repository,
          process them, and prepare them for further analysis. This is typically the first step in the documentation
          generation workflow.
        </p>

        <div className="mt-8">
          <h2 id="extraction-command">Basic Extraction</h2>
          <p>
            The <code>extract</code> command extracts all code files from a repository while applying filters
            to exclude binary files, large files, and common directories like <code>node_modules</code>.
          </p>
          <pre><code>vibeinsights extract --directory ./path/to/repo --output extracted-code.txt</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This command will scan the repository, extract text from all code files, and save it to the specified output file.
          </p>

          <h3 className="mt-6">Options</h3>
          <ul>
            <li><code>--directory, -d</code>: Path to the repository directory (default: current directory)</li>
            <li><code>--output, -o</code>: Output file name (default: "repo_analysis.txt")</li>
            <li><code>--exclude, -x</code>: Additional comma-separated patterns to exclude</li>
            <li><code>--max-size, -s</code>: Maximum file size in bytes to include (default: 1MB)</li>
            <li><code>--save</code>: Save analysis to the server for future reference</li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="customizing-extraction">Customizing Extraction</h2>
          <p>
            You can customize the extraction process to focus on specific files or exclude certain patterns.
          </p>

          <h3 className="mt-6">Excluding Files and Directories</h3>
          <p>
            By default, VibeInsights AI excludes common patterns like <code>.git</code>, <code>node_modules</code>, <code>dist</code>, and binary files.
            You can add your own exclusion patterns:
          </p>
          <pre><code>vibeinsights extract --exclude "*.log,*.tmp,build/*,test/*"</code></pre>

          <h3 className="mt-6">Limiting File Size</h3>
          <p>
            Large files can cause issues with API limits when using OpenAI for analysis. You can limit the maximum file size:
          </p>
          <pre><code>vibeinsights extract --max-size 500000</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This would exclude any files larger than 500KB.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="saving-for-later">Saving Analysis for Later Use</h2>
          <p>
            When using the <code>--save</code> flag, VibeInsights AI will store the extracted code in its internal database for future reference:
          </p>
          <pre><code>vibeinsights extract --directory ./my-project --save</code></pre>
          <p>
            This creates a repository record that can be referenced by ID in other commands:
          </p>
          <pre><code>vibeinsights generate-docs 1 --type architecture</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Where "1" is the repository ID assigned during extraction.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="managing-repositories">Managing Stored Repositories</h2>
          <p>
            VibeInsights AI provides commands to manage repositories stored in its database:
          </p>

          <h3 className="mt-6">Listing Repositories</h3>
          <pre><code>vibeinsights list-repos</code></pre>
          <p>
            This displays all stored repositories with their IDs, names, sizes, and timestamps.
          </p>

          <h3 className="mt-6">Viewing Repository Details</h3>
          <pre><code>vibeinsights repo-info 1</code></pre>
          <p>
            Shows detailed information about a specific repository by ID.
          </p>

          <h3 className="mt-6">Removing a Repository</h3>
          <pre><code>vibeinsights remove-repo 1</code></pre>
          <p>
            Deletes a repository and its associated documents from storage.
          </p>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="best-practices" className="mt-0">Best Practices</h2>
          <ul>
            <li><strong>Start with the right scope:</strong> Extract only the relevant parts of a large repository to avoid hitting token limits with AI models.</li>
            <li><strong>Exclude test and generated files:</strong> Adding <code>--exclude "test/*,**/*.test.js,**/*.generated.*"</code> can help focus on core code.</li>
            <li><strong>Save extracted repositories:</strong> Use <code>--save</code> to avoid re-extracting for multiple analysis operations.</li>
            <li><strong>Combine with GitHub integration:</strong> When analyzing GitHub repositories, use the <code>github</code> command for a more streamlined workflow.</li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="next-steps">Next Steps</h2>
          <p>
            After extracting code from a repository, you can proceed to:
          </p>
          <ul>
            <li>Generate <a href="/docs/documentation-generation">architectural documentation</a> from the extracted code</li>
            <li>Analyze <a href="/docs/dependency-analysis">dependencies between files</a> in the repository</li>
            <li>Measure <a href="/docs/complexity-metrics">code complexity metrics</a> to identify potential issues</li>
            <li>Perform <a href="/docs/semantic-search">semantic search</a> to find specific patterns or concepts</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}