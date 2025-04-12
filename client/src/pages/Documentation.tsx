import { useEffect } from 'react';
import { useLocation } from 'wouter';
import DocPlaceholder from "../components/docs/DocPlaceholder";

export default function Documentation() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the docs index page
    setLocation('/docs');
  }, [setLocation]);

  return (
    <DocPlaceholder 
      title="Documentation" 
      description="Comprehensive documentation for VibeInsights AI - learn how to analyze repositories and generate documentation."
    />
  );
}