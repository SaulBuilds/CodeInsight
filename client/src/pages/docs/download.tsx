import DocLayout from "@/components/layout/DocLayout";

export default function DownloadPage() {
  return (
    <DocLayout
      title="Download Documentation"
      description="Access and download comprehensive documentation for VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Documentation Downloads</h2>
        <p>
          VibeInsights AI provides comprehensive documentation in various formats for offline access,
          printing, or sharing with your team. This page lists all available documentation downloads.
        </p>

        <div className="mt-8">
          <h2 id="comprehensive-guide">Comprehensive Documentation</h2>
          <p>
            Our comprehensive documentation is available in multiple formats:
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Complete PDF Guide</h3>
              <p className="mb-6 flex-grow">
                Complete VibeInsights AI documentation in PDF format, suitable for printing or offline reading.
                Includes all sections, command references, and examples.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-documentation.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download PDF (3.8 MB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">EPUB for E-Readers</h3>
              <p className="mb-6 flex-grow">
                Complete documentation in EPUB format, optimized for e-readers and mobile devices.
                Perfect for reading on the go.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-documentation.epub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download EPUB (2.4 MB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Markdown Collection</h3>
              <p className="mb-6 flex-grow">
                Documentation as a collection of Markdown files, ideal for integration with your own
                documentation system or viewing on GitHub.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-documentation-markdown.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Markdown (1.2 MB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">HTML Documentation</h3>
              <p className="mb-6 flex-grow">
                Complete documentation as a static HTML website that you can host locally or on your intranet.
                Includes all images, CSS, and JavaScript.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-documentation-html.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download HTML (4.5 MB)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 id="quick-reference">Quick Reference Guides</h2>
          <p>
            Compact reference guides for specific topics:
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">CLI Commands Cheat Sheet</h3>
              <p className="mb-6 flex-grow">
                A compact reference of all VibeInsights AI commands and their options.
                Print this to keep at your desk for quick reference.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-cli-cheatsheet.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Cheat Sheet (480 KB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">OpenAI Integration Guide</h3>
              <p className="mb-6 flex-grow">
                Detailed guide focused on configuring and optimizing the OpenAI integration
                for maximum effectiveness and cost efficiency.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-openai-guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Guide (850 KB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">GitHub Integration Handbook</h3>
              <p className="mb-6 flex-grow">
                Complete guide to setting up and using the GitHub integration,
                including OAuth configuration and repository management.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-github-handbook.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Handbook (720 KB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Plugin Development Guide</h3>
              <p className="mb-6 flex-grow">
                In-depth guide for developers who want to create plugins for
                VibeInsights AI, including API reference and examples.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/vibeinsights-plugin-dev-guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Guide (1.1 MB)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 id="example-docs">Example Documentation</h2>
          <p>
            Sample documentation generated by VibeInsights AI for reference:
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Sample Architecture Documentation</h3>
              <p className="mb-6 flex-grow">
                Example architectural documentation generated for a React/Node.js application.
                Shows the typical output format and level of detail.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/sample-architecture-documentation.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Example (950 KB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Sample Code Story</h3>
              <p className="mb-6 flex-grow">
                Example Code Story for a complex algorithm, showing how VibeInsights AI
                explains code in a narrative format at different complexity levels.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/sample-code-story.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Example (680 KB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Sample User Stories</h3>
              <p className="mb-6 flex-grow">
                Example user stories generated from a codebase, showing how VibeInsights AI
                identifies and articulates functionality from a user perspective.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/sample-user-stories.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Example (520 KB)
                </a>
              </div>
            </div>
            
            <div className="p-6 border border-border rounded-lg flex flex-col">
              <h3 className="mt-0 mb-4">Sample Complexity Analysis</h3>
              <p className="mb-6 flex-grow">
                Example complexity analysis report showing how VibeInsights AI identifies
                complex code and provides metrics and visualizations.
              </p>
              <div className="mt-auto">
                <a
                  href="https://github.com/SaulBuilds/vibeinsights/releases/latest/download/sample-complexity-analysis.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Download Example (780 KB)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 p-6 bg-primary/5 rounded-lg">
          <h2 id="offline-access" className="mt-0">Generating Your Own Documentation</h2>
          <p>
            In addition to the pre-packaged documentation available for download, you can generate your own
            documentation for offline use using VibeInsights AI itself:
          </p>
          
          <pre><code>vibeinsights generate-docs --type architecture --directory ./my-project --output markdown > architecture.md</code></pre>
          
          <p className="mt-4">
            You can also use the <code>view-doc</code> command to export previously generated documentation:
          </p>
          
          <pre><code>vibeinsights view-doc 1 --format markdown > document-1.md</code></pre>
          
          <p className="mt-4 mb-0">
            These commands allow you to create custom documentation specific to your projects.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="updates">Documentation Updates</h2>
          <p>
            The documentation downloads are updated with each new release of VibeInsights AI.
            The current documentation version is 2.4.0, released on April 2, 2025.
          </p>
          
          <p className="mt-4">
            For the very latest documentation, always refer to:
          </p>
          
          <ul>
            <li>The online documentation on this website</li>
            <li>The <a href="https://github.com/SaulBuilds/vibeinsights/tree/main/docs" target="_blank" rel="noopener noreferrer">docs folder</a> in the GitHub repository</li>
            <li>The built-in help via <code>vibeinsights --help</code></li>
          </ul>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Resources</h2>
          <ul>
            <li>
              <a href="https://github.com/SaulBuilds/vibeinsights/releases" target="_blank" rel="noopener noreferrer">
                Release Notes
              </a>
            </li>
            <li>
              <a href="/docs/extending">Extending VibeInsights AI</a>
            </li>
            <li>
              <a href="/cli-reference">CLI Reference</a>
            </li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}