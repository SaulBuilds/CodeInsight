import { memo } from 'react';
import { Link, useRoute } from 'wouter';
import DocLayout from "@/components/layout/DocLayout";

// Import all doc pages
import Installation from "@/pages/docs/Installation";
import QuickStart from "@/pages/docs/QuickStart";
import GitHub from "@/pages/docs/GitHub";
import DocsIndex from "@/pages/docs/index";
import CodeExtraction from "@/pages/docs/code-extraction";
import DocumentationGeneration from "@/pages/docs/documentation-generation";
import DependencyAnalysis from "@/pages/docs/dependency-analysis";
import ComplexityMetrics from "@/pages/docs/complexity-metrics";
import SemanticSearch from "@/pages/docs/semantic-search";
import CodeStory from "@/pages/docs/code-story";
import UserStories from "@/pages/docs/user-stories";
import OpenAIAPI from "@/pages/docs/openai-api";
import Configuration from "@/pages/docs/configuration";
import Plugins from "@/pages/docs/plugins";
// Temporarily excluding files with errors
// import Extending from "@/pages/docs/extending";
import Download from "@/pages/docs/download";
import ReportIssue from "@/pages/docs/report-issue";

// Create a map of page identifiers to components
const pageComponents: Record<string, React.ComponentType> = {
  // Special case for index/home page
  '': DocsIndex,
  
  // Capital cased pages
  'Installation': Installation,
  'QuickStart': QuickStart,
  'GitHub': GitHub,
  
  // Hyphenated pages
  'code-extraction': CodeExtraction,
  'documentation-generation': DocumentationGeneration,
  'dependency-analysis': DependencyAnalysis,
  'complexity-metrics': ComplexityMetrics,
  'semantic-search': SemanticSearch,
  'code-story': CodeStory,
  'user-stories': UserStories,
  'openai-api': OpenAIAPI,
  'configuration': Configuration,
  'plugins': Plugins,
  'download': Download,
  'report-issue': ReportIssue,
};

// Create a "Not Found" page as a separate component
const DocNotFound = memo(({ page }: { page: string }) => (
  <DocLayout 
    title="Page Not Found" 
    description="This documentation page could not be found."
  >
    <div className="prose dark:prose-invert max-w-none">
      <h1>Documentation Page Not Found</h1>
      <p>The page <code>{page}</code> does not exist in our documentation.</p>
      <p><Link href="/docs" className="text-primary hover:underline">Return to Documentation Home</Link></p>
    </div>
  </DocLayout>
));

// Create a loading component
const DocLoading = memo(() => (
  <DocLayout 
    title="Documentation" 
    description="Comprehensive documentation for VibeInsights AI"
  >
    <div className="prose dark:prose-invert max-w-none">
      <p>Loading documentation...</p>
    </div>
  </DocLayout>
));

// Memoize the Documentation component
export default memo(function Documentation() {
  // Use useRoute to get the page parameter
  const [match, params] = useRoute<{ page: string }>('/docs/:page');
  
  // If we don't have a match or params, something went wrong
  if (!match || !params) {
    return <DocLoading />;
  }
  
  // Get the page from the route parameters
  const { page } = params;
  
  // Check if we have a component for this page
  const PageComponent = pageComponents[page];
  
  // If we don't have a component, show the not found page
  if (!PageComponent) {
    console.log("Page not found:", page);
    return <DocNotFound page={page} />;
  }
  
  // Render the appropriate component for the requested page
  return <PageComponent />;
});