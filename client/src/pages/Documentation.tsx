import { useState } from "react";
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar 
          isVisible={showMobileSidebar} 
          onClose={() => setShowMobileSidebar(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 py-6 px-4 md:px-8">
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
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-text dark:text-white">
                Introduction to CodeInsight AI
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                A comprehensive CLI tool for AI researchers that combines repository analysis, 
                documentation generation, and data collection capabilities with OpenAI integration.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <Button className="bg-secondary hover:bg-blue-700 text-white">
                  <i className="fas fa-terminal mr-2" />
                  Try it now
                </Button>
                <Button variant="outline">
                  <i className="fas fa-book mr-2" />
                  Read the docs
                </Button>
              </div>
            </div>

            {/* Installation */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">Installation</h2>
              
              <InstallationTabs />
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                After installation, you can use the{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-secondary dark:text-blue-400 font-mono">
                  codeinsight
                </code>{" "}
                command globally in your terminal.
              </p>
            </section>

            {/* Quick Start */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">Quick Start</h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                CodeInsight AI provides several commands to extract code, analyze repositories, 
                and generate documentation:
              </p>
              
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
                command="codeinsight generate-docs --type code_story --complexity detailed --source code.txt"
                description="Create a narrative explanation of complex code structures, making them easier to understand through storytelling."
                options={[
                  { name: "--type", description: "Set to 'code_story' for this feature" },
                  { name: "--complexity", description: "simple, moderate, or detailed" },
                  { name: "--source, -s", description: "Source code file" }
                ]}
                generatedContent={[
                  "Narrative explanations of code",
                  "Analogies and metaphors",
                  "Design reasoning and context",
                  "Educational storytelling"
                ]}
              />
            </section>

            {/* Features */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">Key Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard
                  icon="code"
                  title="Repository Analysis"
                  description="Intelligent scanning of repository structure and content, with exclusion of binary files and customizable filters."
                />
                
                <FeatureCard
                  icon="robot"
                  title="OpenAI Integration"
                  description="Leverage OpenAI's powerful language models to generate detailed documentation, user stories, code stories, and architectural overviews."
                />
                
                <FeatureCard
                  icon="book"
                  title="Documentation Generation"
                  description="Create comprehensive documentation in various formats (Markdown, HTML) with code highlighting and proper structuring."
                />
                
                <FeatureCard
                  icon="terminal"
                  title="Command-Line Interface"
                  description="Intuitive terminal-based interface with colorized output and flexible command-line options for various workflows."
                />
              </div>
            </section>

            {/* API Example */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                OpenAI API Configuration
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                To use the AI-powered documentation features, you'll need to configure your 
                OpenAI API key:
              </p>
              
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-lg font-semibold text-text dark:text-white mb-4">
                  API Key Configuration
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You can provide your API key in several ways:
                </p>
                
                <div className="space-y-4">
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
                
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-yellow-400 dark:text-yellow-600"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-200">
                        Never commit your API keys to version control. Use environment variables or 
                        configuration files that are in your .gitignore.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Download Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Download Documentation
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You can download the complete documentation in various formats for offline use:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Example: Using the Library Programmatically
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Besides using the CLI commands, you can also import CodeInsight AI as a library 
                in your Node.js projects:
              </p>
              
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
              
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                This provides more flexibility for integrating repository analysis and 
                documentation generation into your custom workflows.
              </p>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-2xl font-bold text-text dark:text-white mb-6">
                Frequently Asked Questions
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
  );
}
