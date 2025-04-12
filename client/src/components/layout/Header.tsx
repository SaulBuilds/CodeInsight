import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location] = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-secondary dark:text-blue-400 text-2xl font-bold cursor-pointer">
                  CodeInsight AI
                </span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/">
                <a className={`${
                  location === "/" 
                    ? "text-secondary dark:text-blue-400 border-b-2 border-secondary dark:border-blue-400" 
                    : "text-text dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400"
                  } px-3 py-2 text-sm font-medium`}
                >
                  Home
                </a>
              </Link>
              <Link href="/docs">
                <a className={`${
                  location === "/docs" 
                    ? "text-secondary dark:text-blue-400 border-b-2 border-secondary dark:border-blue-400" 
                    : "text-text dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400"
                  } px-3 py-2 text-sm font-medium`}
                >
                  Documentation
                </a>
              </Link>
              <Link href="/cli-reference">
                <a className={`${
                  location === "/cli-reference" 
                    ? "text-secondary dark:text-blue-400 border-b-2 border-secondary dark:border-blue-400" 
                    : "text-text dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400"
                  } px-3 py-2 text-sm font-medium`}
                >
                  CLI Reference
                </a>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
              >
                GitHub
              </a>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative hidden sm:block">
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-48 lg:w-72 bg-white dark:bg-dark-surface text-sm focus:ring-2 focus:ring-secondary dark:focus:ring-blue-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="ml-4 text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-blue-400"
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
              className="md:hidden ml-2 text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-blue-400"
              aria-label="Menu"
            >
              <i className="fas fa-bars"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
