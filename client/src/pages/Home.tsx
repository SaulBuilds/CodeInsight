import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/docs/FeatureCard";

export default function Home() {
  return (
    <div className="bg-light-bg dark:bg-dark-bg text-text dark:text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text dark:text-white">
            RepoScraper <span className="text-secondary dark:text-blue-400">CLI</span>
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            A comprehensive CLI tool for AI researchers that combines repository analysis,
            documentation generation, and data collection capabilities with OpenAI integration.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/cli-reference">
              <Button className="bg-secondary hover:bg-blue-700 text-white py-3 px-8">
                <i className="fas fa-terminal mr-2" />
                Try it now
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="py-3 px-8">
                <i className="fas fa-book mr-2" />
                Read the docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-text dark:text-white">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="code"
              title="Repository Analysis"
              description="Intelligent scanning of repository structure and content, with exclusion of binary files and customizable filters."
            />
            <FeatureCard
              icon="robot"
              title="OpenAI Integration"
              description="Leverage OpenAI's powerful language models to generate detailed documentation, user stories, and architectural overviews."
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
            <FeatureCard
              icon="download"
              title="Downloadable Content"
              description="Export documentation in multiple formats for offline use and sharing with team members."
            />
            <FeatureCard
              icon="expand"
              title="Extensibility"
              description="Easily extend the core functionality with custom plugins and integrations to fit your specific workflow."
            />
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-text dark:text-white">
            Quick Installation
          </h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm">Terminal</span>
            </div>
            <div className="p-4 font-mono text-sm text-white overflow-x-auto">
              $ npm install -g repo-scraper-cli
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
            After installation, you can use the{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-secondary dark:text-blue-400 font-mono">
              repo-scraper
            </code>{" "}
            command globally in your terminal.
          </p>
          <div className="mt-8 text-center">
            <Link href="/docs">
              <Button className="bg-secondary hover:bg-blue-700 text-white">
                View Full Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial/CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary bg-opacity-5 dark:bg-opacity-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-text dark:text-white">
            Perfect for AI Researchers and Developers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
            RepoScraper CLI streamlines the process of code analysis and documentation,
            allowing researchers to focus on insights rather than data collection.
          </p>
          <Link href="/docs">
            <Button size="lg" className="bg-secondary hover:bg-blue-700 text-white">
              Start Using RepoScraper
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
