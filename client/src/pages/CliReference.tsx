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
                Complete reference of VibeInsights AI commands, options, and examples.
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
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Commands */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-text dark:text-white mb-4">
                Commands
              </h2>
              
              <Tabs defaultValue="analyze">
                <TabsList className="mb-4">
                  <TabsTrigger value="analyze">analyze</TabsTrigger>
                  <TabsTrigger value="generate-docs">generate-docs</TabsTrigger>
                  <TabsTrigger value="list-repos">list-repos</TabsTrigger>
                  <TabsTrigger value="list-docs">list-docs</TabsTrigger>
                  <TabsTrigger value="view-doc">view-doc</TabsTrigger>
                </TabsList>
                
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
                        code="vibeinsights analyze [directory] [options]"
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
                              Output file name (default: "repo_analysis.txt")
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
                              --max-size, -s
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Maximum file size in bytes to include
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --save
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Save analysis to the server for future reference
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="vibeinsights analyze ./my-project --output stats.json --exclude dist,build"
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
                        code="vibeinsights generate-docs <repository_id> [options]"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Options
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --type
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Type of documentation to generate (architecture, user_stories, custom)
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --prompt
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Custom prompt for documentation generation
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --api-key
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              OpenAI API key (optional, will use environment variable if not provided)
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="vibeinsights generate-docs 1 --type architecture"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="list-repos">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        list-repos
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        List all analyzed repositories stored in the system.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="vibeinsights list-repos"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example Output
                      </h4>
                      <CodeBlock
                        language="plaintext"
                        code="Repositories:
-------------
ID: 1
Name: my-project
Path: /home/user/projects/my-project
Files: 120
Size: 2.3 MB
Analyzed: 4/12/2025, 10:21:34 AM
---
ID: 2
Name: another-project
Path: /home/user/projects/another-project
Files: 85
Size: 1.8 MB
Analyzed: 4/12/2025, 11:45:12 AM
---"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="list-docs">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        list-docs
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        List all documentation generated for a specific repository.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="codeinsight list-docs <repository_id>"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Parameters
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              repository_id
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              ID of the repository to list documentation for
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="codeinsight list-docs 1"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Example Output
                      </h4>
                      <CodeBlock
                        language="plaintext"
                        code="Documentation:
--------------
ID: 1
Type: architecture
AI Model: gpt-4o
Created: 4/12/2025, 10:30:15 AM
---
ID: 2
Type: user_stories
AI Model: gpt-4o
Created: 4/12/2025, 10:35:22 AM
---
ID: 3
Type: custom
AI Model: gpt-4o
Created: 4/12/2025, 11:05:45 AM
---"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="view-doc">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
                        view-doc
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        View a specific document in the terminal or save it as a markdown file.
                      </p>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Usage
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="codeinsight view-doc <document_id> [options]"
                      />
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Parameters
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              document_id
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              ID of the document to view
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Options
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <div className="flex items-start">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-secondary dark:text-blue-400 font-mono w-40 shrink-0">
                              --format
                            </code>
                            <span className="ml-4 text-gray-600 dark:text-gray-300">
                              Output format: "terminal" or "markdown" (default: "terminal")
                            </span>
                          </div>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium text-text dark:text-white mt-6 mb-2">
                        Examples
                      </h4>
                      <CodeBlock
                        language="bash"
                        code="# View document in terminal
codeinsight view-doc 1

# Save document as markdown file
codeinsight view-doc 1 --format markdown"
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
                      Analyze repository and generate architectural documentation in one go:
                    </p>
                    <CodeBlock
                      language="bash"
                      code="# Analyze repository and save to server
codeinsight analyze . --save

# Generate architectural documentation (assuming repository id is 1)
codeinsight generate-docs 1 --type architecture"
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
                      code="# Generate user stories for repository id 1
codeinsight generate-docs 1 --type user_stories"
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
codeinsight generate-docs 1 --type custom --prompt "Identify potential security vulnerabilities in this code and suggest fixes"`}
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
                        Solution: Use the --max-size option to limit file sizes or narrow your extraction to specific directories.
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