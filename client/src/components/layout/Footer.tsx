export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-text dark:text-white font-semibold">RepoScraper CLI</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              A tool for AI researchers and developers
            </p>
          </div>
          <div className="flex space-x-8">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-blue-400"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://www.npmjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-blue-400"
              aria-label="npm"
            >
              <i className="fab fa-npm"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-blue-400"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Copyright © {new Date().getFullYear()} RepoScraper. Released under the MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
