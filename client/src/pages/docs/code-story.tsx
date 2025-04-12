import DocLayout from "@/components/layout/DocLayout";

export default function CodeStoryPage() {
  return (
    <DocLayout
      title="Code Story"
      description="Generate narrative explanations of complex code structures with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          The Code Story feature is one of VibeInsights AI's most powerful capabilities, designed to transform complex
          code structures into clear, narrative explanations. By generating a "story" that explains how the code works,
          this feature makes it easier for developers, stakeholders, and new team members to understand complex
          algorithms and systems.
        </p>

        <div className="mt-8">
          <h2 id="what-is-code-story">What is a Code Story?</h2>
          <p>
            A Code Story is a narrative explanation of code that:
          </p>
          
          <ul>
            <li>Breaks down complex logic into understandable steps</li>
            <li>Explains the purpose and functionality of code sections</li>
            <li>Uses metaphors and plain language to clarify technical concepts</li>
            <li>Highlights key patterns, algorithms, and design decisions</li>
            <li>Provides context that might not be obvious from comments or documentation</li>
          </ul>
          
          <p className="mt-4">
            Unlike traditional code comments or function-level documentation, Code Stories provide a higher-level
            narrative that helps readers understand not just what the code does, but why and how it does it.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="basic-usage">Basic Usage</h2>
          <p>
            To generate a Code Story for a specific file or directory, use the <code>generate-docs</code> command
            with the <code>code_story</code> type:
          </p>
          
          <pre><code>vibeinsights generate-docs --type code_story --source ./path/to/complex-file.js</code></pre>
          
          <p className="mt-4">
            This will analyze the file and generate a narrative explanation of its functionality.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="complexity-levels">Complexity Levels</h2>
          <p>
            You can customize the depth and technical detail of your Code Story with the <code>--complexity</code> option:
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Simple (Non-Technical)</h3>
              <p>
                High-level explanation with minimal technical details, ideal for non-technical stakeholders.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --source ./algorithm.js --complexity simple</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This explains what the code accomplishes in business terms with analogies and simplified descriptions.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Moderate (Default)</h3>
              <p>
                Balanced explanation with some technical details, suitable for most audiences.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --source ./algorithm.js --complexity moderate</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This provides a mix of high-level concepts and important implementation details.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Detailed (Technical)</h3>
              <p>
                In-depth technical explanation with implementation specifics, ideal for developers.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --source ./algorithm.js --complexity detailed</code></pre>
              <p className="text-sm text-muted-foreground mt-2">
                This includes specific algorithm explanations, performance considerations, and design pattern analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="use-cases">Key Use Cases</h2>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Onboarding New Developers</h3>
              <p>
                Help new team members quickly understand complex parts of your codebase without requiring extensive
                walkthroughs from senior developers.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --directory ./src/core --complexity detailed</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Knowledge Transfer</h3>
              <p>
                Preserve insights about complex code when the original authors are unavailable or leaving the team.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --source ./src/algorithms/proprietary-algorithm.js --save</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Technical Documentation</h3>
              <p>
                Generate initial drafts of technical documentation that developers can review and refine.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --directory ./src/api --output markdown > api-documentation.md</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Stakeholder Communication</h3>
              <p>
                Create simplified explanations of technical functionality for product managers, executives, or clients.
              </p>
              <pre><code>vibeinsights generate-docs --type code_story --source ./src/billing/calculator.js --complexity simple</code></pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="options">Available Options</h2>
          <p>
            Customize your Code Story generation with these options:
          </p>
          
          <h3 className="mt-6">Source Specification</h3>
          <ul>
            <li><code>--source</code>: Path to a specific file to analyze</li>
            <li><code>--directory</code>: Path to a directory (will analyze all relevant files)</li>
            <li><code>repository_id</code>: ID of a previously saved repository</li>
          </ul>
          
          <h3 className="mt-6">Content Customization</h3>
          <ul>
            <li><code>--complexity</code>: Level of detail (simple, moderate, detailed)</li>
            <li><code>--focus</code>: Specific aspect to focus on (algorithms, patterns, architecture)</li>
            <li><code>--language</code>: Override automatic language detection</li>
          </ul>
          
          <h3 className="mt-6">Output Options</h3>
          <ul>
            <li><code>--output</code>: Output format (terminal, markdown, html, json)</li>
            <li><code>--save</code>: Save the generated documentation to the database</li>
            <li><code>--api-key</code>: OpenAI API key (if not set via environment variable)</li>
          </ul>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="best-practices" className="mt-0">Best Practices</h2>
          
          <ul className="mt-4">
            <li>
              <strong>Focus on complex code:</strong> Use Code Story for algorithms, complex business logic, or intricate systems rather than simple CRUD operations
            </li>
            <li>
              <strong>Select the right complexity level:</strong> Match the complexity level to your audience's technical expertise
            </li>
            <li>
              <strong>Combine with complexity analysis:</strong> Use the <code>complexity</code> command to identify the most complex files that would benefit from a Code Story
            </li>
            <li>
              <strong>Include in onboarding documentation:</strong> Generate and save Code Stories for critical system components as part of your onboarding documentation
            </li>
            <li>
              <strong>Review and refine:</strong> Generated Code Stories are excellent starting points but may benefit from human review and refinement
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="examples">Examples</h2>
          
          <h3 className="mt-6">Generating a Simple Explanation for Non-Technical Stakeholders</h3>
          <pre><code>vibeinsights generate-docs --type code_story --source ./src/pricing/discount-calculator.js --complexity simple --output markdown > pricing-explanation.md</code></pre>
          <p>
            Creates a non-technical explanation of how the discount calculator works, suitable for sharing with the business team.
          </p>
          
          <h3 className="mt-6">Detailed Technical Analysis for Developers</h3>
          <pre><code>vibeinsights generate-docs --type code_story --source ./src/algorithms/machine-learning/classifier.js --complexity detailed</code></pre>
          <p>
            Produces an in-depth explanation of a machine learning classifier algorithm with technical details.
          </p>
          
          <h3 className="mt-6">Code Story for an Entire Module</h3>
          <pre><code>vibeinsights generate-docs --type code_story --directory ./src/authentication --complexity moderate --save</code></pre>
          <p>
            Analyzes all files in the authentication module and creates a narrative explaining how the entire authentication system works.
          </p>
          
          <h3 className="mt-6">Focus on Specific Aspects</h3>
          <pre><code>vibeinsights generate-docs --type code_story --source ./src/database/query-builder.js --focus patterns</code></pre>
          <p>
            Generates a story focusing specifically on the design patterns used in the query builder.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="output-example">Sample Output</h2>
          <p>
            Here's an example of what a Code Story might look like for a data processing pipeline:
          </p>
          
          <div className="mt-4 p-6 border border-border rounded-lg bg-muted/20">
            <h3 className="mt-0">The Data Processing Journey: A Code Story</h3>
            
            <p>
              Imagine our data as a traveler on a journey through several checkpoints. Each piece of data begins in its raw form—perhaps a JSON object from an API or a CSV row from a file upload—and must be transformed into a structured format our application can use.
            </p>
            
            <p>
              <strong>Stage 1: Validation at the Border</strong><br />
              When data first arrives, it passes through the validation checkpoint (validateInput function). Here, each field is carefully examined: Are required fields present? Do dates follow the correct format? Are numbers within acceptable ranges? If any issues are found, the data is immediately rejected with a detailed error message, preventing problematic data from entering our system.
            </p>
            
            <p>
              <strong>Stage 2: Transformation Embassy</strong><br />
              After validation, our data traveler enters the transformation embassy (transformData function). Here, the data receives its proper documentation—dates are converted from strings to Date objects, numbers are properly typed, and default values are applied where needed. The data is restructured according to our application's conventions, making it easier to process downstream.
            </p>
            
            <p>
              <strong>Stage 3: Enrichment City</strong><br />
              Now properly formatted, the data visits Enrichment City (enrichData function). Here, it's enhanced with additional information not present in the original payload. The function queries our database for related entities, calculates derived values, and adds computed properties that will be useful later.
            </p>
            
            <p>
              <strong>Stage 4: Storage District</strong><br />
              With all necessary preparation complete, the data reaches the Storage District (storeProcessedData function). This function determines the appropriate database collection or table and safely stores the data, handling potential conflicts or duplicates along the way.
            </p>
            
            <p>
              <strong>Behind the Scenes: The Event Bus</strong><br />
              Throughout this journey, the EventBus serves as the communication network, announcing the data's progress at each stage. Other parts of the application can subscribe to these events to trigger additional processes, like sending notifications or updating caches, without tightly coupling those concerns to the main processing pipeline.
            </p>
            
            <p>
              This pipeline design follows the principle of progressive refinement, with each stage having a single responsibility. Error handling is distributed throughout the pipeline, with each stage only dealing with errors relevant to its specific task.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/complexity-metrics">Complexity Metrics</a> - Identify code that would benefit from a Code Story</li>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Explore other types of documentation that can be generated</li>
            <li><a href="/docs/openai-api">OpenAI API Configuration</a> - Optimize your OpenAI integration for better Code Stories</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}