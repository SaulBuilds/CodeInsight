import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import CommandCard from "@/components/docs/CommandCard";
import FeatureCard from "@/components/docs/FeatureCard";
import DownloadCard from "@/components/docs/DownloadCard";
import FaqItem from "@/components/docs/FaqItem";
import InstallationTabs from "@/components/docs/InstallationTabs";
import ApiOption from "@/components/docs/ApiOption";
import CodeBlock from "@/components/docs/CodeBlock";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const docRef = useRef<HTMLDivElement>(null);

  // Handle scroll for progress indicator
  useEffect(() => {
    const handleScroll = () => {
      if (docRef.current) {
        const totalHeight = docRef.current.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={docRef} className="relative bg-background text-foreground overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Documentation Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <Sidebar 
            isVisible={showMobileSidebar} 
            onClose={() => setShowMobileSidebar(false)} 
          />

          {/* Main Content */}
          <main className="flex-1 py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Mobile sidebar toggle */}
              <div className="md:hidden mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMobileSidebar(true)}
                  className="flex items-center"
                >
                  <i className="fas fa-bars mr-2" />
                  Menu
                </Button>
              </div>

              {/* Page header */}
              <div className="mb-16 relative animated-background rounded-xl p-8 shadow-lg">
                <div className="vector-grid"></div>
                <div className="animated-blob blob-1" style={{ opacity: 0.1 }}></div>
                <div className="animated-blob blob-3" style={{ opacity: 0.1 }}></div>
                
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Introduction to <span className="text-primary">CodeInsight AI</span>
                  </h1>
                  <p className="text-xl text-foreground/80 max-w-3xl">
                    A comprehensive CLI tool for AI researchers that combines repository analysis, 
                    documentation generation, and data collection capabilities with OpenAI integration.
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
                      <i className="fas fa-terminal mr-2" />
                      Try it now
                    </Button>
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10 text-foreground rounded-xl">
                      <i className="fas fa-book mr-2" />
                      Read the docs
                    </Button>
                  </div>
                </div>
              </div>

              {/* Installation */}
              <section className="mb-16 glass-card p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
                  <span className="relative z-10">Installation</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                </h2>
                
                <InstallationTabs />
                
                <p className="text-foreground/80 mt-6">
                  After installation, you can use the{" "}
                  <code className="font-mono px-2 py-1 rounded bg-muted text-primary">
                    codeinsight
                  </code>{" "}
                  command globally in your terminal.
                </p>
              </section>

              {/* Quick Start */}
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
                  <span className="relative z-10">Quick Start</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                </h2>
                
                <p className="text-foreground/80 mb-8">
                  CodeInsight AI provides several commands to extract code, analyze repositories, 
                  and generate documentation:
                </p>
                
                <div className="space-y-8">
                  <CommandCard
                    title="Extract Code from Repository"
                    icon="code"
                    command="codeinsight extract --output combined_code.txt --exclude node_modules .git"
                    description="This command extracts all code files from the current repository and combines them into a single output file."
                    options={[
                      { name: "--output, -o", description: "Output file name" },
                      { name: "--exclude, -x", description: "Exclusion patterns" },
                      { name: "--size, -s", description: "Maximum file size" }
                    ]}
                    output="// src/index.js\n// ------------------------------------------------\nconst fs = require('fs');\nconst path = require('path');\n// More code...\n\n// src/utils/helpers.js\n// ------------------------------------------------\nfunction isTextFile(filePath) {\n  // Implementation\n}\n// More code..."
                  />
                  
                  <CommandCard
                    title="Generate Documentation with OpenAI"
                    icon="lightbulb"
                    command="codeinsight generate-docs --source combined_code.txt --api-key YOUR_OPENAI_API_KEY --output-format md"
                    description="This command analyzes the extracted code and generates comprehensive documentation using OpenAI's language models."
                    options={[
                      { name: "--source, -s", description: "Source code file" },
                      { name: "--api-key, -k", description: "OpenAI API key" },
                      { name: "--output-format, -f", description: "Output format (md/html)" }
                    ]}
                    generatedContent={[
                      "Project architecture",
                      "Function documentation",
                      "Code dependencies",
                      "Usage examples"
                    ]}
                  />
                  
                  <CommandCard
                    title="Generate Code Story"
                    icon="book-open"
                    command="codeinsight generate-docs 1 --type code_story --complexity detailed"
                    description="Create a narrative explanation of complex code structures, making them easier to understand through storytelling."
                    options={[
                      { name: "repository_id", description: "ID of the repository to analyze" },
                      { name: "--type", description: "Set to 'code_story' for this feature" },
                      { name: "--complexity", description: "simple, moderate, or detailed" },
                      { name: "--api-key", description: "OpenAI API key (or use OPENAI_API_KEY env variable)" }
                    ]}
                    generatedContent={[
                      "Narrative explanations of code",
                      "Analogies and metaphors",
                      "Design reasoning and context",
                      "Educational storytelling"
                    ]}
                  />
                </div>
              </section>

              {/* Features */}
              <section className="mb-16 relative animated-background rounded-xl p-8">
                <div className="vector-grid"></div>
                <div className="animated-blob blob-2" style={{ opacity: 0.1 }}></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
                    <span className="relative z-10">Key Features</span>
                    <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <FeatureCard
                      icon="code"
                      title="Repository Analysis"
                      description="Intelligent scanning of repository structure and content, with exclusion of binary files and customizable filters."
                      className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    />
                    
                    <FeatureCard
                      icon="robot"
                      title="OpenAI Integration"
                      description="Leverage OpenAI's powerful language models to generate detailed documentation, user stories, code stories, and architectural overviews."
                      className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    />
                    
                    <FeatureCard
                      icon="book"
                      title="Documentation Generation"
                      description="Create comprehensive documentation in various formats (Markdown, HTML) with code highlighting and proper structuring."
                      className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    />
                    
                    <FeatureCard
                      icon="terminal"
                      title="Command-Line Interface"
                      description="Intuitive terminal-based interface with colorized output and flexible command-line options for various workflows."
                      className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    />
                  </div>
                </div>
              </section>

              {/* API Example */}
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
                  <span className="relative z-10">OpenAI API Configuration</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                </h2>
                
                <p className="text-foreground/80 mb-6">
                  To use the AI-powered documentation features, you'll need to configure your 
                  OpenAI API key:
                </p>
                
                <div className="glass-card rounded-xl shadow-md p-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    API Key Configuration
                  </h3>
                  
                  <p className="text-foreground/80 mb-6">
                    You can provide your API key in several ways:
                  </p>
                  
                  <div className="space-y-6">
                    <ApiOption
                      title="1. Environment Variable"
                      code="$ export OPENAI_API_KEY=your_api_key_here"
                    />
                    
                    <ApiOption
                      title="2. Configuration File"
                      description="Create a .reposcraper file in your home directory:"
                      code='{
  "apiKey": "your_api_key_here",
  "defaultModel": "gpt-4o"
}'
                    />
                    
                    <ApiOption
                      title="3. Command Line Argument"
                      code="$ codeinsight generate-docs --api-key=your_api_key_here"
                    />
                  </div>
                  
                  <div className="mt-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-triangle text-yellow-500"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-yellow-300">
                          Never commit your API keys to version control. Use environment variables or 
                          configuration files that are in your .gitignore.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Download Section */}
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
                  <span className="relative z-10">Download Documentation</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                </h2>
                
                <p className="text-foreground/80 mb-8">
                  You can download the complete documentation in various formats for offline use:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DownloadCard
                    icon="file-pdf"
                    title="PDF Documentation"
                    description="Complete guide with examples and API reference"
                    buttonText="Download PDF"
                    href="#"
                  />
                  
                  <DownloadCard
                    icon="file-alt"
                    title="Markdown Files"
                    description="GitHub-compatible markdown documentation"
                    buttonText="Download MD"
                    href="#"
                  />
                  
                  <DownloadCard
                    icon="file-code"
                    title="HTML Documentation"
                    description="Static website with searchable content"
                    buttonText="Download HTML"
                    href="#"
                  />
                </div>
              </section>

              {/* Code Example */}
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
                  <span className="relative z-10">Using the Library Programmatically</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                </h2>
                
                <p className="text-foreground/80 mb-6">
                  Besides using the CLI commands, you can also import CodeInsight AI as a library 
                  in your Node.js projects:
                </p>
                
                <div className="enhanced-code-block">
                  <CodeBlock
                    language="javascript"
                    code={`const { scrapeRepository, generateDocs } = require('codeinsight-ai');

// Extract code from repository
const extractedCode = await scrapeRepository({
  directory: './my-project',
  exclude: ['node_modules', '.git'],
  maxSize: 1024 * 100, // 100 KB
});

// Generate documentation using OpenAI
const documentation = await generateDocs({
  source: extractedCode,
  apiKey: process.env.OPENAI_API_KEY,
  outputFormat: 'md',
  model: 'gpt-4o'
});

console.log(\`Documentation generated: \${documentation.filePath}\`);`}
                  />
                </div>
                
                <p className="mt-6 text-foreground/80">
                  This provides more flexibility for integrating repository analysis and 
                  documentation generation into your custom workflows.
                </p>
              </section>

              {/* FAQ Section */}
              <section className="glass-card rounded-xl p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8 relative inline-block">
                  <span className="relative z-10">Frequently Asked Questions</span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
                </h2>
                
                <div className="space-y-6">
                  <FaqItem
                    question="How much does it cost to use the OpenAI integration?"
                    answer="OpenAI API usage is billed based on your OpenAI account pricing. CodeInsight AI itself is free and open-source, but you'll need to provide your own OpenAI API key and will be responsible for any charges incurred when using the AI documentation features."
                    isOpen={true}
                  />
                  
                  <FaqItem
                    question="Can I use this tool with private repositories?"
                    answer="Yes, CodeInsight AI works with any repository you have access to locally. It operates on your local filesystem and doesn't require any special permissions beyond basic file reading access. This makes it suitable for both public and private repositories."
                  />
                  
                  <FaqItem
                    question="How does the tool handle large repositories?"
                    answer={`CodeInsight AI includes several features to handle large repositories effectively:
                    
• File size limits can be set to exclude large files
• Custom exclusion patterns for irrelevant directories
• Efficient file reading and processing mechanism
• For very large repositories, you can process specific subdirectories`}
                  />
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
