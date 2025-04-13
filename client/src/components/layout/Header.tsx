import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location] = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-opacity-70 backdrop-blur-md shadow-md" 
            : "bg-opacity-100"
        } ${
          menuOpen 
            ? "bg-transparent" 
            : "bg-background border-b border-border"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <span className="text-primary text-2xl font-serif font-bold cursor-pointer">
                    VibeInsights <span className="text-secondary">AI</span>
                  </span>
                </Link>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/" className={`${
                  location === "/" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-foreground/80 hover:text-primary"
                  } px-3 py-2 text-sm font-medium transition-colors`}
                >
                  Home
                </Link>
                <Link href="/docs" className={`${
                  location === "/docs" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-foreground/80 hover:text-primary"
                  } px-3 py-2 text-sm font-medium transition-colors`}
                >
                  Documentation
                </Link>
                <Link href="/cli-reference" className={`${
                  location === "/cli-reference" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-foreground/80 hover:text-primary"
                  } px-3 py-2 text-sm font-medium transition-colors`}
                >
                  CLI Reference
                </Link>
                <a 
                  href="https://github.com/saulbuilds/vibeinsights" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                >
                  <i className="fab fa-github mr-1"></i>
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative hidden sm:block">
                  <Input
                    type="text"
                    placeholder="Search documentation..."
                    className="w-48 lg:w-72 bg-background/50 backdrop-blur-sm text-sm focus:ring-2 focus:ring-primary"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <i className="fas fa-search text-muted-foreground"></i>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="ml-4 text-foreground/70 hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <i className="fas fa-sun"></i>
                ) : (
                  <i className="fas fa-moon"></i>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-foreground/70 hover:text-primary transition-colors ml-2"
                aria-label="Menu"
              >
                <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Overlay Menu */}
      <div className={`overlay-menu ${menuOpen ? 'active' : ''}`}>
        <div className="vector-grid"></div>
        <div className="animated-blob blob-1"></div>
        <div className="animated-blob blob-2"></div>
        <div className="animated-blob blob-3"></div>
        
        <nav className="flex flex-col items-center text-center space-y-8">
          <Link 
            href="/" 
            onClick={closeMenu}
            className="overlay-menu-item text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/docs" 
            onClick={closeMenu}
            className="overlay-menu-item text-foreground hover:text-primary transition-colors"
          >
            Documentation
          </Link>
          <Link 
            href="/cli-reference" 
            onClick={closeMenu}
            className="overlay-menu-item text-foreground hover:text-primary transition-colors"
          >
            CLI Reference
          </Link>
          <a 
            href="https://github.com/saulbuilds/vibeinsights" 
            target="_blank" 
            rel="noopener noreferrer"
            className="overlay-menu-item text-foreground hover:text-primary transition-colors"
            onClick={closeMenu}
          >
            <i className="fab fa-github mr-2"></i> GitHub
          </a>
        </nav>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-8">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-primary transition-colors border border-border"
          >
            {isDarkMode ? (
              <><i className="fas fa-sun mr-2"></i> Light Mode</>
            ) : (
              <><i className="fas fa-moon mr-2"></i> Dark Mode</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
