import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DocLayout from "@/components/layout/DocLayout";
import CommandCard from "@/components/docs/CommandCard";

export default function QuickStartPage() {
  return (
    <DocLayout title="Quick Start Guide" description="Get started with CodeInsight AI in minutes">
      <p className="text-lg text-foreground/80 mb-8">
        CodeInsight AI provides several commands to extract code, analyze repositories, 
        and generate documentation. This guide will help you get started quickly.
      </p>
      
      <div className="space-y-8 mb-12">
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
      
      <div className="glass-card p-8 rounded-xl mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
          <span className="relative z-10">Example Workflow</span>
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
        </h2>
        
        <p className="text-foreground/80 mb-6">
          A typical workflow with CodeInsight AI involves these steps:
        </p>
        
        <ol className="list-decimal pl-6 space-y-4 text-foreground/80">
          <li>
            <span className="font-medium text-foreground">Extract code</span> from your repository
            <div className="mt-2 bg-muted/30 p-4 rounded-md font-mono text-sm">
              $ codeinsight extract -o repo_code.txt -x node_modules .git
            </div>
          </li>
          
          <li>
            <span className="font-medium text-foreground">Generate documentation</span> using OpenAI
            <div className="mt-2 bg-muted/30 p-4 rounded-md font-mono text-sm">
              $ codeinsight generate-docs --source repo_code.txt --output-format md
            </div>
          </li>
          
          <li>
            <span className="font-medium text-foreground">Analyze dependencies</span> for better understanding
            <div className="mt-2 bg-muted/30 p-4 rounded-md font-mono text-sm">
              $ codeinsight analyze-deps --output-format html
            </div>
          </li>
          
          <li>
            <span className="font-medium text-foreground">Identify complex components</span> that need attention
            <div className="mt-2 bg-muted/30 p-4 rounded-md font-mono text-sm">
              $ codeinsight complexity --threshold 15
            </div>
          </li>
          
          <li>
            <span className="font-medium text-foreground">Search code semantically</span> using natural language
            <div className="mt-2 bg-muted/30 p-4 rounded-md font-mono text-sm">
              $ codeinsight search "error handling in database operations"
            </div>
          </li>
        </ol>
      </div>
      
      <div className="flex justify-between">
        <Link href="/docs/installation">
          <Button 
            variant="outline" 
            className="border-primary/30 hover:bg-primary/10 text-foreground"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Installation
          </Button>
        </Link>
        
        <Link href="/docs/configuration">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Configuration
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </Link>
      </div>
    </DocLayout>
  );
}