import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Documentation from "@/pages/Documentation";
import CliReference from "@/pages/CliReference";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { initMouseTracking, initScrollEffects } from "@/lib/mouseAnimation";

// Import the index page directly
import DocsIndex from "@/pages/docs/index";
import Installation from "@/pages/docs/Installation";
import QuickStart from "@/pages/docs/QuickStart";
import GitHub from "@/pages/docs/GitHub";

function Router() {
  // Initialize animation effects
  useEffect(() => {
    // Setup mouse tracking for parallax effects
    const cleanupMouseTracking = initMouseTracking();
    
    // Setup scroll-based animations
    const cleanupScrollEffects = initScrollEffects();
    
    // Cleanup on unmount
    return () => {
      if (cleanupMouseTracking) cleanupMouseTracking();
      if (cleanupScrollEffects) cleanupScrollEffects();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          
          {/* Documentation Routes */}
          <Route path="/docs" component={DocsIndex} />
          <Route path="/docs/Installation" component={Installation} />
          <Route path="/docs/QuickStart" component={QuickStart} />
          <Route path="/docs/GitHub" component={GitHub} />
          <Route path="/docs/:rest*" component={Documentation} />
          
          <Route path="/cli-reference" component={CliReference} />
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
    </QueryClientProvider>
  );
}

export default App;
