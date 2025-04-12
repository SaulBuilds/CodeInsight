import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DocSidebar from "@/components/layout/DocSidebar";

interface DocLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function DocLayout({ children, title, description }: DocLayoutProps) {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <DocSidebar 
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
              <div className="mb-10 relative animated-background rounded-xl p-8 shadow-lg">
                <div className="vector-grid"></div>
                <div className="animated-blob blob-1" style={{ opacity: 0.1 }}></div>
                
                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg text-foreground/80 max-w-3xl">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Page content */}
              {children}

              {/* Navigation */}
              <div className="mt-12 pt-6 border-t border-border/50 flex justify-between">
                <Button 
                  variant="outline" 
                  className="border-primary/30 hover:bg-primary/10 text-foreground"
                  asChild
                >
                  <Link href="/docs">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Docs
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}