import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface DocSidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function DocSidebar({ isVisible, onClose }: DocSidebarProps) {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>("getting-started");

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Toggle category
  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Check if a path is active
  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Mobile overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen md:h-auto overflow-y-auto w-64 
          bg-background md:bg-transparent border-r border-border/50 md:border-none
          z-50 md:z-0 transition-transform duration-300 md:transition-none
          ${isVisible ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Mobile close button */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <span className="font-serif font-semibold text-lg text-foreground">Documentation</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-foreground/70 hover:text-primary"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
          
          <nav className="mt-6 flex-1">
            <div className="mb-6">
              <button
                onClick={() => toggleCategory("getting-started")}
                className="flex items-center justify-between font-serif w-full text-left font-medium mb-2 py-1 px-2 text-foreground hover:text-primary transition-colors"
              >
                Getting Started
                <i className={`fas fa-chevron-${activeCategory === "getting-started" ? "down" : "right"} text-xs`}></i>
              </button>
              
              {activeCategory === "getting-started" && (
                <ul className="pl-4 space-y-2">
                  <li>
                    <Link href="/docs/installation" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/installation") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Installation
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/quick-start" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/quick-start") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Quick Start
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/configuration" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/configuration") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Configuration
                      </a>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            
            <div className="mb-6">
              <button
                onClick={() => toggleCategory("features")}
                className="flex items-center justify-between font-serif w-full text-left font-medium mb-2 py-1 px-2 text-foreground hover:text-primary transition-colors"
              >
                Features
                <i className={`fas fa-chevron-${activeCategory === "features" ? "down" : "right"} text-xs`}></i>
              </button>
              
              {activeCategory === "features" && (
                <ul className="pl-4 space-y-2">
                  <li>
                    <Link href="/docs/code-extraction" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/code-extraction") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Code Extraction
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/documentation-generation" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/documentation-generation") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Documentation Generation
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/code-story" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/code-story") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Code Story
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/dependency-analysis" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/dependency-analysis") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Dependency Analysis
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/complexity-metrics" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/complexity-metrics") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Complexity Metrics
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/semantic-search" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/semantic-search") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Semantic Search
                      </a>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            
            <div className="mb-6">
              <button
                onClick={() => toggleCategory("api")}
                className="flex items-center justify-between font-serif w-full text-left font-medium mb-2 py-1 px-2 text-foreground hover:text-primary transition-colors"
              >
                API Reference
                <i className={`fas fa-chevron-${activeCategory === "api" ? "down" : "right"} text-xs`}></i>
              </button>
              
              {activeCategory === "api" && (
                <ul className="pl-4 space-y-2">
                  <li>
                    <Link href="/docs/api-configuration" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/api-configuration") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        API Configuration
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/programmatic-usage" onClick={handleLinkClick}>
                      <a className={`block py-1 px-2 text-sm rounded-md ${isActive("/docs/programmatic-usage") ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-primary"}`}>
                        Programmatic Usage
                      </a>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-border/50">
            <Link href="/cli-reference" onClick={handleLinkClick}>
              <a className="block w-full text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                CLI Reference
              </a>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}