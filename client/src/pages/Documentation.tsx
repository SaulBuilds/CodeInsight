import { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
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

export default function Documentation() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/docs/:page');
  const [content, setContent] = useState<React.ReactNode>(null);
  
  useEffect(() => {
    // Get the page from the route parameters
    const page = params?.page;
    
    if (!page) {
      // If no page, render the docs index
      setContent(<DocsIndex />);
      return;
    }
    
    // Handle specific documentation pages
    switch (page) {
      // Capital cased pages
      case 'Installation':
        setContent(<Installation />);
        break;
      case 'QuickStart':
        setContent(<QuickStart />);
        break;
      case 'GitHub':
        setContent(<GitHub />);
        break;
        
      // Hyphenated pages
      case 'code-extraction':
        setContent(<CodeExtraction />);
        break;
      case 'documentation-generation':
        setContent(<DocumentationGeneration />);
        break;
      case 'dependency-analysis':
        setContent(<DependencyAnalysis />);
        break;
      case 'complexity-metrics':
        setContent(<ComplexityMetrics />);
        break;
      case 'semantic-search':
        setContent(<SemanticSearch />);
        break;
      case 'code-story':
        setContent(<CodeStory />);
        break;
      case 'user-stories':
        setContent(<UserStories />);
        break;
      case 'openai-api':
        setContent(<OpenAIAPI />);
        break;
      case 'configuration':
        setContent(<Configuration />);
        break;
      case 'plugins':
        setContent(<Plugins />);
        break;
      case 'download':
        setContent(<Download />);
        break;
      case 'report-issue':
        setContent(<ReportIssue />);
        break;
      default:
        // For pages we don't have, show a "not found" message instead of redirecting
        console.log("Page not found:", page);
        setContent(
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
        );
    }
  }, [params]);

  if (content) {
    return <>{content}</>;
  }

  return (
    <DocLayout 
      title="Documentation" 
      description="Comprehensive documentation for VibeInsights AI - learn how to analyze repositories and generate documentation."
    >
      <div className="prose dark:prose-invert max-w-none">
        <p>Loading documentation...</p>
      </div>
    </DocLayout>
  );
}