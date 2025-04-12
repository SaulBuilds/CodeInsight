import { Switch, Route, useLocation, useRoute } from "wouter";

// Import documentation pages
import DocsIndex from "@/pages/docs/index";
import InstallationPage from "@/pages/docs/Installation";
import QuickStartPage from "@/pages/docs/QuickStart";

export default function Documentation() {
  const [location] = useLocation();
  const [match] = useRoute("/docs/:rest*");
  
  return (
    <Switch>
      <Route path="/docs" component={DocsIndex} />
      <Route path="/docs/installation" component={InstallationPage} />
      <Route path="/docs/quick-start" component={QuickStartPage} />
      {/* Add routes for other documentation pages here */}
      
      {/* Fallback for other doc URLs */}
      <Route path="/docs/:rest*">
        <DocsIndex />
      </Route>
    </Switch>
  );
}
