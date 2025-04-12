export default function Footer() {
  return (
    <footer className="bg-muted/50 py-12 mt-12 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <p className="font-serif text-xl font-semibold text-foreground">CodeInsight AI</p>
            <p className="text-foreground/70 mt-2 max-w-md">
              A comprehensive CLI tool for AI researchers that transforms repository analysis and documentation generation.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col gap-2">
              <p className="font-serif font-medium text-foreground mb-2">Connect With Us</p>
              <div className="flex space-x-6">
                <a
                  href="https://github.com/SaulBuilds/CodeInsight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <i className="fab fa-github text-xl"></i>
                </a>
                <a
                  href="https://www.npmjs.com/package/codeinsight-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors"
                  aria-label="npm"
                >
                  <i className="fab fa-npm text-xl"></i>
                </a>
                <a
                  href="https://x.com/saul_loveman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors"
                  aria-label="X (Twitter)"
                >
                  <i className="fab fa-twitter text-xl"></i>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="font-serif font-medium text-foreground mb-2">Resources</p>
              <ul className="space-y-2">
                <li>
                  <a href="/docs" className="text-foreground/70 hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/cli-reference" className="text-foreground/70 hover:text-primary transition-colors">
                    CLI Reference
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-foreground/60 text-sm">
          <p>Copyright © {new Date().getFullYear()} CodeInsight AI. Released under the MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
