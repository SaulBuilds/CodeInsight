import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import CodeBlock from "@/components/docs/CodeBlock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CliReference() {
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
                Command Line Reference
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Complete reference of RepoScraper CLI commands, options, and examples.
              </p>
            </div>

            {/* Global Options */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Global Options
              </h2>
              
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    These options can be used with any command:
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40">
                        --help, -h
                      </code>
                      <span className="ml-4 text-gray-600 dark:text-gray-300">
                        Show help information
                      </span>
                    </li>
                    <li className="flex">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40">
                        --version, -v
                      </code>
                      <span className="ml-4 text-gray-600 dark:text-gray-300">
                        Show version information
                      </span>
                    </li>
                    <li className="flex">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40">
                        --quiet, -q
                      </code>
                      <span className="ml-4 text-gray-600 dark:text-gray-300">
                        Suppress output and show only errors
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Commands */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Commands
              </h2>
              
              <Tabs defaultValue="extract">
                <TabsList className="mb-4">
                  <TabsTrigger value="extract">extract</TabsTrigger>
                  <TabsTrigger value="generate-docs">generate-docs</TabsTrigger>
                  <TabsTrigger value="analyze">analyze</TabsTrigger>
                  <TabsTrigger value="config">config</TabsTrigger>
                </TabsList>
                
                <TabsContent value="extract">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        extract
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Extract code from repository files and combine them into a single output file.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper extract [options]"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Options
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --output, -o
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Output file name (default: "combined_code.txt")
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --size, -s
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Maximum file size in bytes (only files below this size will be included)
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --exclude, -x
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Additional exclusion pattern(s) (default: [".git", "node_modules"])
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --dir, -d
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Target directory to analyze (default: current directory)
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper extract --output project_code.txt --exclude dist .cache --size 102400"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="generate-docs">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        generate-docs
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Generate documentation from code using OpenAI's language models.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper generate-docs [options]"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Options
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --source, -s
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Source code file (result from extract command)
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --output, -o
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Output file name (default: "documentation.{format}")
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --api-key, -k
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              OpenAI API key (can also be set via OPENAI_API_KEY env variable)
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --type, -t
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Type of documentation to generate: "architecture", "user-stories", or "custom" (default: "architecture")
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --format, -f
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Output format: "md" or "html" (default: "md")
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --prompt, -p
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Custom prompt (required when type is "custom")
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper generate-docs --source project_code.txt --type architecture --format md"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analyze">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        analyze
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Analyze repository and generate statistics about the codebase.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper analyze [options]"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Options
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --dir, -d
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Target directory to analyze (default: current directory)
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --exclude, -x
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Additional exclusion pattern(s) (default: [".git", "node_modules"])
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --output, -o
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Output JSON file for statistics (default: prints to console)
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper analyze --dir ./my-project --output stats.json"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="config">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        config
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        View or update configuration settings.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper config [options] [key] [value]"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Options
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --list, -l
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              List all configuration settings
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --get, -g
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Get a specific configuration value
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --set, -s
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Set a configuration value
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --delete, -d
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Delete a configuration value
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="repo-scraper config --set apiKey YOUR_OPENAI_API_KEY"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Examples Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Common Use Cases
              </h2>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                      Generate Architecture Documentation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Extract code and generate architectural documentation in one go:
                    </p>
                    <CodeBlock
                      language="bash"
                      code={`# Step 1: Extract code from repository
repo-scraper extract --output my-project-code.txt

# Step 2: Generate architectural documentation
repo-scraper generate-docs --source my-project-code.txt --type architecture`}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                      Create User Stories
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Generate user stories from codebase for product discussions:
                    </p>
                    <CodeBlock
                      language="bash"
                      code={`# Using an already extracted code file
repo-scraper generate-docs --source my-project-code.txt --type user-stories --output user-stories.md`}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                      Custom Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Run custom analysis with specific questions:
                    </p>
                    <CodeBlock
                      language="bash"
                      code={`# Ask specific questions about the codebase
repo-scraper generate-docs \\
  --source my-project-code.txt \\
  --type custom \\
  --prompt "Identify potential security vulnerabilities in this code and suggest fixes" \\
  --output security-review.md`}
                    />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Error Handling Section */}
            <section>
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Troubleshooting
              </h2>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                    Common Errors
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-text dark:text-white mb-2">
                        API Key Errors
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="Error: OpenAI API key is required. Please provide it via --api-key option or OPENAI_API_KEY environment variable."
                      />
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Solution: Set your OpenAI API key using one of the methods described in the documentation.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-text dark:text-white mb-2">
                        File Size Limits
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="Warning: The extracted code is very large (5MB). This may cause issues with the OpenAI API token limits."
                      />
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Solution: Use the --size option to limit file sizes or narrow your extraction to specific directories.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-text dark:text-white mb-2">
                        Permission Issues
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="Error: EACCES: permission denied, open '/path/to/file'"
                      />
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Solution: Ensure you have the necessary permissions to read the source files and write to the output location.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
