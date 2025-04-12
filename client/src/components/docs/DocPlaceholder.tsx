import DocLayout from "@/components/layout/DocLayout";

interface DocPlaceholderProps {
  title: string;
  description?: string;
}

export default function DocPlaceholder({ title, description }: DocPlaceholderProps) {
  return (
    <DocLayout
      title={title}
      description={description || `Documentation for ${title} - coming soon`}
    >
      <div className="prose dark:prose-invert max-w-none">
        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-serif font-bold mb-4">Coming Soon</h2>
          <p className="text-lg text-foreground/80">
            We're currently working on this section of the documentation. 
            Please check back soon for complete details on {title}.
          </p>
          
          <div className="mt-6 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-xl font-serif font-bold mb-4">What to expect</h3>
            <ul className="space-y-2">
              <li>Comprehensive guide on how to use this feature</li>
              <li>Step-by-step instructions with examples</li>
              <li>Best practices and troubleshooting tips</li>
              <li>Integration with other VibeInsights AI features</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <p>
              In the meantime, you can explore the CLI command directly by running:
            </p>
            <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto">
              <code>vibeinsights --help</code>
            </pre>
          </div>
        </div>
      </div>
    </DocLayout>
  );
}