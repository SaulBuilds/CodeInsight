import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CliReference from "@/pages/CliReference";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { initScrollEffects } from "@/lib/mouseAnimation";
import WaveEffect from "@/components/effects/WaveEffect";

// Import all documentation components
import DocsIndex from "@/pages/docs/index";
import Installation from "@/pages/docs/Installation";
import QuickStart from "@/pages/docs/QuickStart";
import GitHub from "@/pages/docs/GitHub";
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
import Download from "@/pages/docs/download";
import ReportIssue from "@/pages/docs/report-issue";

function Router() {
  // Initialize animation effects
  useEffect(() => {
    // Setup scroll-based animations only
    const cleanupScrollEffects = initScrollEffects();
    
    // Cleanup on unmount
    return () => {
      if (cleanupScrollEffects) cleanupScrollEffects();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          {/* Main Pages */}
          <Route path="/" component={Home} />
          <Route path="/cli-reference" component={CliReference} />
          
          {/* Documentation Routes - Use separate routes for clarity */}
          <Route path="/docs" component={DocsIndex} />
          <Route path="/docs/Installation" component={Installation} />
          <Route path="/docs/QuickStart" component={QuickStart} />
          <Route path="/docs/GitHub" component={GitHub} />
          <Route path="/docs/code-extraction" component={CodeExtraction} />
          <Route path="/docs/documentation-generation" component={DocumentationGeneration} />
          <Route path="/docs/dependency-analysis" component={DependencyAnalysis} />
          <Route path="/docs/complexity-metrics" component={ComplexityMetrics} />
          <Route path="/docs/semantic-search" component={SemanticSearch} />
          <Route path="/docs/code-story" component={CodeStory} />
          <Route path="/docs/user-stories" component={UserStories} />
          <Route path="/docs/openai-api" component={OpenAIAPI} />
          <Route path="/docs/configuration" component={Configuration} />
          <Route path="/docs/plugins" component={Plugins} />
          <Route path="/docs/download" component={Download} />
          <Route path="/docs/report-issue" component={ReportIssue} />
          
          {/* 404 Fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <WaveEffect />
    </QueryClientProvider>
  );
}

export default App;
