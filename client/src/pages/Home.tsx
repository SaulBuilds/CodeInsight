import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/docs/FeatureCard";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse movement for animation effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Calculate transform values based on mouse position
  const calculateTransform = (intensity = 1) => {
    const moveX = (mousePosition.x - 0.5) * intensity;
    const moveY = (mousePosition.y - 0.5) * intensity;
    return `translate3d(${moveX * 30}px, ${moveY * 30}px, 0)`;
  };

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 animated-background"
      >
        <div className="vector-grid"></div>
        <div 
          className="animated-blob blob-1"
          style={{ transform: `translate3d(${(mousePosition.x - 0.5) * -40}px, ${(mousePosition.y - 0.5) * -40}px, 0)` }}
        ></div>
        <div 
          className="animated-blob blob-2" 
          style={{ transform: `translate3d(${(mousePosition.x - 0.5) * 30}px, ${(mousePosition.y - 0.5) * 30}px, 0)` }}
        ></div>
        <div 
          className="animated-blob blob-3"
          style={{ transform: `translate3d(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px, 0)` }}
        ></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center">
            <div 
              className="mouse-tracking-content"
              style={{ transform: calculateTransform(0.5) }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                CodeInsight <span className="text-primary">AI</span>
              </h1>
              <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-foreground/80 leading-relaxed">
                A sophisticated AI-powered CLI tool that transforms repository analysis 
                and documentation generation.
              </p>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link href="/cli-reference">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white py-6 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  <i className="fas fa-terminal mr-2" />
                  Try it now
                </Button>
              </Link>
              <Link href="/docs">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/30 text-foreground py-6 px-8 rounded-xl hover:bg-primary/10 transition-all"
                >
                  <i className="fas fa-book mr-2" />
                  Read the docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold relative inline-block">
              <span className="relative z-10">Key Features</span>
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
            </h2>
            <p className="mt-4 text-xl text-foreground/70 max-w-2xl mx-auto">
              Powerful tools designed specifically for AI researchers and developers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <FeatureCard
                icon="code"
                title="Repository Analysis"
                description="Intelligent scanning of repository structure and content, with exclusion of binary files and customizable filters."
                className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 glass-card"
              />
            </div>
            <div className="group">
              <FeatureCard
                icon="robot"
                title="OpenAI Integration"
                description="Leverage OpenAI's powerful language models to generate detailed documentation, user stories, and architectural overviews."
                className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 glass-card"
              />
            </div>
            <div className="group">
              <FeatureCard
                icon="book"
                title="Documentation Generation"
                description="Create comprehensive documentation in various formats (Markdown, HTML) with code highlighting and proper structuring."
                className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 glass-card"
              />
            </div>
            <div className="group">
              <FeatureCard
                icon="terminal"
                title="Command-Line Interface"
                description="Intuitive terminal-based interface with colorized output and flexible command-line options for various workflows."
                className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 glass-card"
              />
            </div>
            <div className="group">
              <FeatureCard
                icon="download"
                title="Downloadable Content"
                description="Export documentation in multiple formats for offline use and sharing with team members."
                className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 glass-card"
              />
            </div>
            <div className="group">
              <FeatureCard
                icon="expand"
                title="Extensibility"
                description="Easily extend the core functionality with custom plugins and integrations to fit your specific workflow."
                className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 glass-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative animated-background">
        <div className="vector-grid"></div>
        <div className="animated-blob blob-1" style={{ opacity: 0.1 }}></div>
        <div className="animated-blob blob-3" style={{ opacity: 0.1 }}></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold relative inline-block">
              <span className="relative z-10">Quick Installation</span>
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
            </h2>
            <p className="mt-4 text-xl text-foreground/70">
              Get started in seconds
            </p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-border/50">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/80">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-foreground/70 text-sm font-medium">Terminal</span>
            </div>
            <div className="p-6 font-mono text-lg text-foreground overflow-x-auto">
              <span className="text-secondary">$</span> npm install -g codeinsight-ai
            </div>
          </div>
          
          <p className="mt-6 text-center text-foreground/80">
            After installation, you can use the{" "}
            <code className="font-mono px-2 py-1 rounded bg-muted text-primary">
              codeinsight
            </code>{" "}
            command globally in your terminal.
          </p>
          
          <div className="mt-10 text-center">
            <Link href="/docs">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                size="lg"
              >
                View Full Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial/CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background via-muted/20 z-0"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Perfect for AI Researchers and Developers
            </h2>
            <p className="text-xl text-foreground/80 mb-12 max-w-3xl mx-auto">
              CodeInsight AI streamlines the process of code analysis and documentation,
              allowing researchers to focus on insights rather than data collection.
            </p>
            <Link href="/docs">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white py-6 px-10 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                Start Using CodeInsight AI
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
