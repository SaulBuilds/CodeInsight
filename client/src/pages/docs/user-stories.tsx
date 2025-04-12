import DocLayout from "@/components/layout/DocLayout";

export default function UserStoriesPage() {
  return (
    <DocLayout
      title="User Stories"
      description="Generate user stories from your codebase with VibeInsights AI"
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 id="overview">Overview</h2>
        <p>
          VibeInsights AI can analyze your codebase and automatically generate user stories that describe the functionality
          from an end-user perspective. This feature is particularly valuable for bridging the gap between technical
          implementation and product understanding, helping teams align on what the code actually does from a user's point of view.
        </p>

        <div className="mt-8">
          <h2 id="what-are-user-stories">What Are User Stories?</h2>
          <p>
            User stories are short, simple descriptions of a feature told from the perspective of the person who desires the
            new capability, usually a user or customer of the system. They typically follow a simple template:
          </p>
          <pre><code>As a [type of user], I want [some goal] so that [some reason].</code></pre>
          
          <p className="mt-4">
            VibeInsights AI generates user stories by analyzing your codebase and inferring the intended functionality,
            transforming technical implementations into user-focused narratives.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="basic-usage">Basic Usage</h2>
          <p>
            To generate user stories from your codebase, use the <code>generate-docs</code> command with the <code>user_stories</code> type:
          </p>
          <pre><code>vibeinsights generate-docs --type user_stories --directory ./path/to/repo</code></pre>
          
          <p className="mt-4">
            This will analyze your codebase and generate a set of user stories that describe the functionality
            from an end-user perspective.
          </p>
        </div>

        <div className="mt-8">
          <h2 id="usage-scenarios">Usage Scenarios</h2>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Legacy System Documentation</h3>
              <p>
                When working with undocumented legacy systems, user stories can help teams understand what the system
                actually does from a user perspective without having to reverse-engineer the entire codebase manually.
              </p>
              <pre><code>vibeinsights generate-docs --type user_stories --directory ./legacy-system</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Product-Engineering Alignment</h3>
              <p>
                Generate user stories to ensure that what's been implemented matches the product team's expectations.
                This helps bridge communication gaps between technical and non-technical stakeholders.
              </p>
              <pre><code>vibeinsights generate-docs --type user_stories --directory ./src/features/new-module</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Documentation Updates</h3>
              <p>
                When features have evolved over time, generated user stories can help update outdated documentation
                to reflect what the code actually does now.
              </p>
              <pre><code>vibeinsights generate-docs --type user_stories --directory ./src/features/updated-feature</code></pre>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h3 className="mt-0 mb-2">Onboarding New Team Members</h3>
              <p>
                Help new team members understand what the application does from a user perspective before diving into the code.
              </p>
              <pre><code>vibeinsights generate-docs --type user_stories --directory ./src --save</code></pre>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="advanced-options">Advanced Options</h2>
          <p>
            Customize user story generation with these options:
          </p>
          
          <h3 className="mt-6">Focus Area</h3>
          <p>
            Generate user stories for specific components or features:
          </p>
          <pre><code>vibeinsights generate-docs --type user_stories --directory ./src/auth</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This focuses the analysis on authentication-related features.
          </p>
          
          <h3 className="mt-6">User Personas</h3>
          <p>
            Specify user personas to consider in the analysis:
          </p>
          <pre><code>vibeinsights generate-docs --type user_stories --directory ./src --personas "admin,customer,guest"</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            This helps generate stories from different user perspectives.
          </p>
          
          <h3 className="mt-6">Output Format</h3>
          <p>
            Choose different output formats:
          </p>
          <pre><code>{`vibeinsights generate-docs --type user_stories --directory ./src --output markdown > user-stories.md`}</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Available formats: terminal (default), markdown, json, html
          </p>
          
          <h3 className="mt-6">Detail Level</h3>
          <p>
            Control the level of detail in the stories:
          </p>
          <pre><code>vibeinsights generate-docs --type user_stories --directory ./src --detail-level comprehensive</code></pre>
          <p className="text-sm text-muted-foreground mt-2">
            Options: basic, standard (default), comprehensive
          </p>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-lg">
          <h2 id="best-practices" className="mt-0">Best Practices</h2>
          
          <ul className="mt-4">
            <li>
              <strong>Focus on specific modules:</strong> Generate user stories for specific features or modules rather than the entire codebase for more relevant results
            </li>
            <li>
              <strong>Review and refine:</strong> Generated user stories are a starting point - review and refine them with your team
            </li>
            <li>
              <strong>Combine with other documentation:</strong> Use user stories alongside more technical documentation like architecture diagrams
            </li>
            <li>
              <strong>Specify personas:</strong> Use the <code>--personas</code> option to get more targeted user stories
            </li>
            <li>
              <strong>Iterate:</strong> Generate stories multiple times as your understanding of the codebase evolves
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 id="output-example">Example Output</h2>
          <p>
            Here's an example of user stories generated for an e-commerce application:
          </p>
          
          <div className="mt-4 p-6 border border-border rounded-lg bg-muted/20">
            <h3 className="mt-0">User Stories: E-commerce Application</h3>
            
            <div className="mt-4">
              <h4 className="mt-0 mb-2">Customer Stories</h4>
              <ul className="mt-0">
                <li>As a customer, I want to browse products by category so that I can quickly find items I'm interested in.</li>
                <li>As a customer, I want to filter products by price range so that I can shop within my budget.</li>
                <li>As a customer, I want to add items to my shopping cart so that I can purchase multiple items at once.</li>
                <li>As a customer, I want to save products to my wishlist so that I can remember them for future purchases.</li>
                <li>As a customer, I want to create an account so that I can track my orders and save my information.</li>
                <li>As a customer, I want to check out as a guest so that I can make purchases without creating an account.</li>
                <li>As a customer, I want to view my order history so that I can track past purchases.</li>
                <li>As a customer, I want to receive email confirmation after placing an order so that I have a record of my purchase.</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="mt-0 mb-2">Admin Stories</h4>
              <ul className="mt-0">
                <li>As an admin, I want to add new products to the catalog so that customers can see and purchase new items.</li>
                <li>As an admin, I want to update product information so that product details stay accurate.</li>
                <li>As an admin, I want to manage inventory levels so that customers can see product availability.</li>
                <li>As an admin, I want to view order statistics so that I can track sales performance.</li>
                <li>As an admin, I want to process refunds so that I can handle customer return requests.</li>
                <li>As an admin, I want to manage user accounts so that I can help customers with account issues.</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="mt-0 mb-2">Guest Stories</h4>
              <ul className="mt-0">
                <li>As a guest, I want to browse products without an account so that I can explore the store without committing.</li>
                <li>As a guest, I want to add items to a shopping cart so that I can prepare a potential purchase.</li>
                <li>As a guest, I want to convert my cart to an account so that I can save my selections if I create an account.</li>
                <li>As a guest, I want to check out without creating an account so that I can make a one-time purchase quickly.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 id="technical-details">How It Works</h2>
          <p>
            The user story generation process works by:
          </p>
          
          <ol>
            <li>Analyzing code patterns in UI components, controllers, and routes to identify user-facing functionality</li>
            <li>Examining form submissions, API endpoints, and database interactions to understand data flows</li>
            <li>Identifying user roles and permissions in the authentication system</li>
            <li>Processing comments, function names, and variable names for clues about intended functionality</li>
            <li>Applying NLP techniques through OpenAI to infer user intentions from technical implementations</li>
            <li>Organizing the identified functionality into coherent user stories grouped by user persona</li>
          </ol>
          
          <p className="mt-4">
            The AI focuses on functional code rather than tests or configuration files, prioritizing code that interacts
            with users, processes form data, or handles user authentication.
          </p>
        </div>

        <div className="mt-10">
          <h2 id="next-steps">Related Documentation</h2>
          <ul>
            <li><a href="/docs/documentation-generation">Documentation Generation</a> - Explore other types of documentation you can generate</li>
            <li><a href="/docs/code-story">Code Story</a> - Generate narrative explanations of your code</li>
            <li><a href="/docs/openai-api">OpenAI API Configuration</a> - Configure the OpenAI integration for better results</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}