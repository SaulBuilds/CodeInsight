import { Switch, Route, useLocation, useRoute } from "wouter";

// Import documentation pages
import DocsIndex from "@/pages/docs/index";
import InstallationPage from "@/pages/docs/Installation";
import QuickStartPage from "@/pages/docs/QuickStart";
import GitHubPage from "@/pages/docs/GitHub";

// Import placeholder component for pages not yet created
import DocPlaceholder from "@/components/docs/DocPlaceholder";

export default function Documentation() {
  const [location] = useLocation();
  const [match] = useRoute("/docs/:rest*");
  
  return (
    <Switch>
      <Route path="/docs" component={DocsIndex} />
      
      {/* Getting Started */}
      <Route path="/docs/installation" component={InstallationPage} />
      <Route path="/docs/quick-start" component={QuickStartPage} />
      
      {/* CLI Commands */}
      <Route path="/docs/code-extraction">
        <DocPlaceholder title="Repository Analysis" />
      </Route>
      <Route path="/docs/documentation-generation">
        <DocPlaceholder title="Documentation Generation" />
      </Route>
      <Route path="/docs/dependency-analysis">
        <DocPlaceholder title="Dependency Analysis" />
      </Route>
      <Route path="/docs/complexity-metrics">
        <DocPlaceholder title="Complexity Metrics" />
      </Route>
      <Route path="/docs/semantic-search">
        <DocPlaceholder title="Semantic Search" />
      </Route>
      <Route path="/docs/code-story">
        <DocPlaceholder title="Code Story" />
      </Route>
      <Route path="/docs/GitHub" component={GitHubPage} />
      
      {/* OpenAI Integration */}
      <Route path="/docs/openai-api">
        <DocPlaceholder title="OpenAI API Configuration" />
      </Route>
      <Route path="/docs/user-stories">
        <DocPlaceholder title="User Stories" />
      </Route>
      
      {/* Advanced Usage */}
      <Route path="/docs/configuration">
        <DocPlaceholder title="Configuration" />
      </Route>
      <Route path="/docs/extending">
        <DocPlaceholder title="Extending CodeInsight" />
      </Route>
      <Route path="/docs/plugins">
        <DocPlaceholder title="Plugins" />
      </Route>
      
      {/* Resources */}
      <Route path="/docs/download">
        <DocPlaceholder title="Download Documentation" />
      </Route>
      <Route path="/docs/report-issue">
        <DocPlaceholder title="Report an Issue" />
      </Route>
      
      {/* Fallback for other doc URLs */}
      <Route path="/docs/:rest*">
        <DocsIndex />
      </Route>
    </Switch>
  );
}
