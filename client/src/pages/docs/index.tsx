import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DocLayout from "@/components/layout/DocLayout";
import FeatureCard from "@/components/docs/FeatureCard";

export default function DocsIndex() {
  return (
    <DocLayout 
      title="Documentation" 
      description="Welcome to the VibeInsights AI documentation - learn how to analyze repositories and generate comprehensive documentation."
    >
      <section className="mb-12">
        <p className="text-lg text-foreground/80 mb-6">
          VibeInsights AI is a comprehensive command-line tool designed for AI researchers and developers.
          It helps you analyze codebases, extract insights, and generate high-quality documentation.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link href="/docs/Installation">
            <div className="cursor-pointer">
              <FeatureCard
                icon="download"
                title="Installation"
                description="Install VibeInsights AI quickly and get started with repository analysis."
                className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
              />
            </div>
          </Link>
          
          <Link href="/docs/QuickStart">
            <div className="cursor-pointer">
              <FeatureCard
                icon="play"
                title="Quick Start"
                description="Learn the basic commands and typical workflow with VibeInsights AI."
                className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
              />
            </div>
          </Link>
        </div>
      </section>
      
      <section className="relative animated-background rounded-xl p-8 mb-12">
        <div className="vector-grid"></div>
        <div className="animated-blob blob-2" style={{ opacity: 0.1 }}></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6 relative inline-block">
            <span className="relative z-10">Key Features</span>
            <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Link href="/docs/code-extraction">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="code"
                  title="Repository Analysis"
                  description="Intelligent scanning of repository structure and content, with exclusion of binary files and customizable filters."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
            
            <Link href="/docs/documentation-generation">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="robot"
                  title="OpenAI Integration"
                  description="Leverage OpenAI's powerful language models to generate detailed documentation, user stories, code stories, and architectural overviews."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
            
            <Link href="/docs/GitHub">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="github"
                  title="GitHub Integration"
                  description="Connect with GitHub to analyze your repositories or any public repositories using OAuth authentication."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
            
            <Link href="/docs/dependency-analysis">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="sitemap"
                  title="Dependency Analysis"
                  description="Map relationships between files and modules in your codebase to identify and visualize complex dependencies."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
            
            <Link href="/docs/complexity-metrics">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="chart-bar"
                  title="Complexity Metrics"
                  description="Calculate cyclomatic and cognitive complexity metrics to identify areas that may need refactoring or additional documentation."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
            
            <Link href="/docs/semantic-search">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="search"
                  title="Semantic Search"
                  description="Use natural language to search your codebase for concepts and functionality, not just keywords."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
            
            <Link href="/docs/code-story">
              <div className="cursor-pointer">
                <FeatureCard
                  icon="book-open"
                  title="Code Story"
                  description="Generate narrative explanations that tell the story of complex code structures in human-friendly terms."
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-full"
                />
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="glass-card p-8 rounded-xl">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6 relative inline-block">
          <span className="relative z-10">Resources</span>
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/cli-reference">
            <div className="cursor-pointer">
              <div className="border border-border/50 rounded-xl p-6 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-md flex flex-col items-center text-center">
                <i className="fas fa-terminal text-3xl text-primary mb-4"></i>
                <h3 className="font-serif font-medium text-lg mb-2">CLI Reference</h3>
                <p className="text-sm text-foreground/70">Complete reference for all command-line options and arguments.</p>
              </div>
            </div>
          </Link>
          
          <a href="https://github.com/saulbuilds/vibeinsights" target="_blank" rel="noopener noreferrer">
            <div className="cursor-pointer">
              <div className="border border-border/50 rounded-xl p-6 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-md flex flex-col items-center text-center">
                <i className="fab fa-github text-3xl text-primary mb-4"></i>
                <h3 className="font-serif font-medium text-lg mb-2">GitHub Repository</h3>
                <p className="text-sm text-foreground/70">View the source code, report issues, and contribute to the project.</p>
              </div>
            </div>
          </a>
          
          <a href="https://www.npmjs.com/package/vibeinsights-ai" target="_blank" rel="noopener noreferrer">
            <div className="cursor-pointer">
              <div className="border border-border/50 rounded-xl p-6 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-md flex flex-col items-center text-center">
                <i className="fab fa-npm text-3xl text-primary mb-4"></i>
                <h3 className="font-serif font-medium text-lg mb-2">NPM Package</h3>
                <p className="text-sm text-foreground/70">Access the latest version information and installation statistics.</p>
              </div>
            </div>
          </a>
        </div>
      </section>
    </DocLayout>
  );
}