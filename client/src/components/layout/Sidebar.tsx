import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isVisible = true, onClose }: SidebarProps) {
  const [location] = useLocation();

  const sidebarClasses = cn(
    "md:block md:w-64 pt-5 pb-4 bg-light-bg dark:bg-dark-bg",
    "overflow-y-auto h-screen md:h-auto transition-transform duration-300",
    "fixed md:relative z-40 md:z-0",
    // Mobile sidebar behavior
    isVisible ? "block inset-0" : "hidden md:block"
  );

  return (
    <div className={sidebarClasses}>
      {/* Close button for mobile */}
      {onClose && (
        <div className="md:hidden absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
            <i className="fas fa-times text-gray-500 dark:text-gray-400"></i>
          </Button>
        </div>
      )}

      <div className="px-4">
        <h2 className="text-lg font-semibold text-text dark:text-white mb-4">Documentation</h2>
        
        <div className="space-y-4">
          {/* Getting Started */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-text dark:text-white">Getting Started</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <i className="fas fa-chevron-down text-gray-500 dark:text-gray-400 text-xs"></i>
              </Button>
            </div>
            <ul className="ml-2 space-y-1">
              <li>
                <Link href="/docs">
                  <a className={cn(
                    "block py-1",
                    location === "/docs" 
                      ? "text-secondary dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400"
                  )}>
                    Introduction
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Installation
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Quick Start
                </a>
              </li>
            </ul>
          </div>
          
          {/* CLI Commands */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-text dark:text-white">CLI Commands</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <i className="fas fa-chevron-down text-gray-500 dark:text-gray-400 text-xs"></i>
              </Button>
            </div>
            <ul className="ml-2 space-y-1">
              <li>
                <Link href="/cli-reference">
                  <a className={cn(
                    "block py-1",
                    location === "/cli-reference" 
                      ? "text-secondary dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400"
                  )}>
                    Command Reference
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Repository Analysis
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Code Extraction
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  AI Documentation
                </a>
              </li>
            </ul>
          </div>
          
          {/* OpenAI Integration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-text dark:text-white">OpenAI Integration</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <i className="fas fa-chevron-down text-gray-500 dark:text-gray-400 text-xs"></i>
              </Button>
            </div>
            <ul className="ml-2 space-y-1">
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  API Configuration
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Document Generation
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  User Stories
                </a>
              </li>
            </ul>
          </div>
          
          {/* Advanced Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-text dark:text-white">Advanced Usage</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <i className="fas fa-chevron-down text-gray-500 dark:text-gray-400 text-xs"></i>
              </Button>
            </div>
            <ul className="ml-2 space-y-1">
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Configuration
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Extending
                </a>
              </li>
              <li>
                <a href="#" className="block text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 py-1">
                  Plugins
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h3 className="font-medium text-text dark:text-white mb-3">Resources</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 flex items-center">
                <i className="fas fa-download mr-2"></i> Download Documentation
              </a>
            </li>
            <li>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 flex items-center">
                <i className="fab fa-github mr-2"></i> GitHub Repository
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 flex items-center">
                <i className="fas fa-bug mr-2"></i> Report an Issue
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
