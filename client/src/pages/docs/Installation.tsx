import { Link } from "wouter";
import InstallationTabs from "@/components/docs/InstallationTabs";
import { Button } from "@/components/ui/button";
import DocLayout from "@/components/layout/DocLayout";

export default function InstallationPage() {
  return (
    <DocLayout title="Installation" description="Installation and setup instructions for CodeInsight AI">
      <div className="glass-card p-8 rounded-xl mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
          <span className="relative z-10">Installation Options</span>
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
      </div>
      
      <div className="glass-card p-8 rounded-xl mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
          <span className="relative z-10">System Requirements</span>
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
        </h2>
        
        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
          <li>Node.js 16 or higher</li>
          <li>npm 7 or higher (comes with Node.js)</li>
          <li>Git (for repository analysis features)</li>
        </ul>
        
        <div className="mt-8 bg-muted/50 p-6 rounded-lg border border-border/50">
          <p className="text-foreground/80 font-medium font-serif mb-2">
            Optional Dependencies
          </p>
          <p className="text-foreground/70">
            For full functionality with AI-powered features, you'll need an OpenAI API key. 
            This is required for documentation generation and code story features.
          </p>
        </div>
      </div>
      
      <div className="glass-card p-8 rounded-xl">
        <h2 className="text-2xl font-bold text-foreground mb-6 relative inline-block">
          <span className="relative z-10">Verifying Installation</span>
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded-lg"></span>
        </h2>
        
        <p className="text-foreground/80 mb-4">
          After installation, you can verify that CodeInsight AI is correctly installed by running:
        </p>
        
        <div className="bg-card/50 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border border-border/50">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/80">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-foreground/70 text-sm font-medium">Terminal</span>
          </div>
          <div className="p-6 font-mono text-lg text-foreground overflow-x-auto">
            <span className="text-secondary">$</span> codeinsight --version
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link href="/docs/quick-start">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
              <i className="fas fa-arrow-right mr-2"></i> Quick Start Guide
            </Button>
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}