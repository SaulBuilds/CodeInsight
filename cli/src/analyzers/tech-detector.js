/**
 * CodeInsight AI - Tech Stack Detector
 * 
 * This file contains utilities for detecting technologies, frameworks, and libraries
 * used in a repository and generating recommendations.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const axios = require('axios');

/**
 * Detect technologies used in a repository
 * @param {Object} options - Configuration options
 * @param {string} options.directory - Directory to analyze
 * @param {string} options.output - Output format (json, html, markdown)
 * @param {boolean} options.checkOutdated - Whether to check for outdated dependencies
 * @param {boolean} options.recommendations - Whether to show recommendations
 * @returns {Promise<Object>} - Tech stack information
 */
async function detectTechStack(options) {
  const {
    directory = '.',
    output = 'markdown',
    checkOutdated = false,
    recommendations = false
  } = options;

  // Initialize results object
  const result = {
    languages: {},
    frameworks: {},
    libraries: {},
    tools: {},
    databases: {},
    packageManagers: {},
    devDependencies: {},
    outdatedDependencies: {},
    recommendations: {}
  };

  // Check for config files to determine technologies
  const configFiles = await findConfigFiles(directory);
  
  // Analyze detected config files
  await analyzeConfigFiles(configFiles, result, directory);
  
  // Scan source code for additional clues
  await scanSourceCode(directory, result);
  
  // Check for outdated dependencies if requested
  if (checkOutdated) {
    await checkOutdatedDependencies(result, directory);
  }
  
  // Generate recommendations if requested
  if (recommendations) {
    generateRecommendations(result);
  }

  // Generate formatted output
  let formattedOutput;
  switch (output) {
    case 'json':
      formattedOutput = JSON.stringify(result, null, 2);
      break;
    case 'html':
      formattedOutput = generateHtmlOutput(result);
      break;
    case 'markdown':
    default:
      formattedOutput = generateMarkdownOutput(result);
      break;
  }

  return {
    result,
    formattedOutput
  };
}

/**
 * Find configuration files in the repository
 * @param {string} directory - Directory to scan
 * @returns {Promise<Object>} - Detected configuration files
 */
async function findConfigFiles(directory) {
  return new Promise((resolve, reject) => {
    const pattern = '**/{package.json,composer.json,requirements.txt,Gemfile,pom.xml,build.gradle,go.mod,Cargo.toml,.csproj,.sln,*.pyproject.toml,*.cabal,*.podspec,pubspec.yaml,tsconfig.json,webpack.config.js,vite.config.js,rollup.config.js,babel.config.js,jest.config.js,karma.conf.js,tslint.json,eslintrc.*,stylelint.*,prettier*.*,.editorconfig,docker*,*.dockerfile,Dockerfile,nginx.conf,nginx*.conf,*.htaccess,.travis.yml,circle.yml,azure-pipelines.yml,github/workflows/*.yml,.gitlab-ci.yml,Jenkinsfile,.env*}';
    
    const options = {
      cwd: directory,
      ignore: ['**/node_modules/**', '.git/**'],
      dot: true
    };

    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Group files by type
      const configFiles = {
        packageManagers: {
          npm: files.filter(f => path.basename(f) === 'package.json'),
          composer: files.filter(f => path.basename(f) === 'composer.json'),
          pip: files.filter(f => path.basename(f) === 'requirements.txt' || path.basename(f).endsWith('pyproject.toml')),
          bundler: files.filter(f => path.basename(f) === 'Gemfile'),
          maven: files.filter(f => path.basename(f) === 'pom.xml'),
          gradle: files.filter(f => path.basename(f) === 'build.gradle'),
          gomod: files.filter(f => path.basename(f) === 'go.mod'),
          cargo: files.filter(f => path.basename(f) === 'Cargo.toml'),
          nuget: files.filter(f => f.endsWith('.csproj') || f.endsWith('.sln')),
          pub: files.filter(f => path.basename(f) === 'pubspec.yaml'),
          cabal: files.filter(f => f.endsWith('.cabal')),
          cocoapods: files.filter(f => f.endsWith('.podspec'))
        },
        buildTools: {
          typescript: files.filter(f => path.basename(f) === 'tsconfig.json'),
          webpack: files.filter(f => f.includes('webpack.config')),
          vite: files.filter(f => f.includes('vite.config')),
          rollup: files.filter(f => f.includes('rollup.config')),
          babel: files.filter(f => f.includes('babel.config') || f.includes('.babelrc')),
          jest: files.filter(f => f.includes('jest.config')),
          karma: files.filter(f => f.includes('karma.conf'))
        },
        linters: {
          eslint: files.filter(f => f.includes('eslintrc')),
          tslint: files.filter(f => path.basename(f) === 'tslint.json'),
          stylelint: files.filter(f => f.includes('stylelint')),
          prettier: files.filter(f => f.includes('prettier'))
        },
        infrastructure: {
          docker: files.filter(f => f.includes('docker') || f.includes('Dockerfile')),
          nginx: files.filter(f => f.includes('nginx')),
          apache: files.filter(f => f.includes('.htaccess')),
          ci: [
            ...files.filter(f => f.includes('.travis.yml')),
            ...files.filter(f => f.includes('circle.yml')),
            ...files.filter(f => f.includes('azure-pipelines.yml')),
            ...files.filter(f => f.includes('workflows') && f.endsWith('.yml')),
            ...files.filter(f => f.includes('.gitlab-ci.yml')),
            ...files.filter(f => path.basename(f) === 'Jenkinsfile')
          ],
          env: files.filter(f => f.includes('.env'))
        }
      };

      resolve(configFiles);
    });
  });
}

/**
 * Analyze configuration files to detect technologies
 * @param {Object} configFiles - Configuration files grouped by type
 * @param {Object} result - Result object to populate
 * @param {string} directory - Base directory
 * @returns {Promise<void>}
 */
async function analyzeConfigFiles(configFiles, result, directory) {
  // Process package.json for npm/node.js projects
  for (const packageFile of configFiles.packageManagers.npm) {
    try {
      const packagePath = path.join(directory, packageFile);
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Count Node.js as a language
      incrementCount(result.languages, 'JavaScript');
      
      // Add package manager
      incrementCount(result.packageManagers, 'npm');
      
      // Process dependencies
      if (packageJson.dependencies) {
        for (const [lib, version] of Object.entries(packageJson.dependencies)) {
          // Categorize common libraries and frameworks
          categorizeJavaScriptLibrary(lib, version, result);
        }
      }
      
      // Process dev dependencies
      if (packageJson.devDependencies) {
        for (const [lib, version] of Object.entries(packageJson.devDependencies)) {
          result.devDependencies[lib] = {
            version: parseVersion(version),
            count: (result.devDependencies[lib]?.count || 0) + 1
          };
        }
      }
      
      // Check for TypeScript
      if (packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript) {
        incrementCount(result.languages, 'TypeScript');
      }
    } catch (error) {
      console.error(chalk.yellow(`Error parsing ${packageFile}: ${error.message}`));
    }
  }
  
  // Process composer.json for PHP projects
  for (const composerFile of configFiles.packageManagers.composer) {
    try {
      const composerPath = path.join(directory, composerFile);
      const composerJson = JSON.parse(fs.readFileSync(composerPath, 'utf8'));
      
      // Count PHP as a language
      incrementCount(result.languages, 'PHP');
      
      // Add package manager
      incrementCount(result.packageManagers, 'Composer');
      
      // Process dependencies
      if (composerJson.require) {
        for (const [lib, version] of Object.entries(composerJson.require)) {
          // Skip PHP itself
          if (lib === 'php') continue;
          
          // Categorize PHP libraries
          if (lib.startsWith('laravel/')) {
            incrementCount(result.frameworks, 'Laravel');
          } else if (lib.startsWith('symfony/')) {
            incrementCount(result.frameworks, 'Symfony');
          } else if (lib === 'wordpress/wordpress') {
            incrementCount(result.frameworks, 'WordPress');
          } else {
            incrementCount(result.libraries, lib);
          }
        }
      }
      
      // Process dev dependencies
      if (composerJson['require-dev']) {
        for (const [lib, version] of Object.entries(composerJson['require-dev'])) {
          result.devDependencies[lib] = {
            version: parseVersion(version),
            count: (result.devDependencies[lib]?.count || 0) + 1
          };
        }
      }
    } catch (error) {
      console.error(chalk.yellow(`Error parsing ${composerFile}: ${error.message}`));
    }
  }
  
  // Process requirements.txt for Python projects
  for (const reqFile of configFiles.packageManagers.pip) {
    try {
      const reqPath = path.join(directory, reqFile);
      const content = fs.readFileSync(reqPath, 'utf8');
      
      // Count Python as a language
      incrementCount(result.languages, 'Python');
      
      // Add package manager
      incrementCount(result.packageManagers, 'pip');
      
      // Process requirements
      const lines = content.split('\n');
      for (const line of lines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) continue;
        
        // Parse requirement
        const parts = line.split('==');
        const lib = parts[0].trim().toLowerCase();
        const version = parts.length > 1 ? parts[1].trim() : 'latest';
        
        // Categorize Python libraries
        if (['flask', 'django', 'fastapi', 'tornado', 'pyramid', 'bottle'].includes(lib)) {
          incrementCount(result.frameworks, capitalizeFirstLetter(lib));
        } else if (['sqlalchemy', 'psycopg2', 'pymysql', 'pymongo', 'redis'].includes(lib)) {
          incrementCount(result.databases, getDatabaseFromPythonLib(lib));
        } else if (['pytest', 'unittest', 'nose'].includes(lib)) {
          incrementCount(result.tools, 'Testing');
        } else {
          incrementCount(result.libraries, lib);
        }
      }
    } catch (error) {
      console.error(chalk.yellow(`Error parsing ${reqFile}: ${error.message}`));
    }
  }
  
  // Process build tool configurations
  if (configFiles.buildTools.typescript.length > 0) {
    incrementCount(result.languages, 'TypeScript');
    incrementCount(result.tools, 'TypeScript');
  }
  
  if (configFiles.buildTools.webpack.length > 0) {
    incrementCount(result.tools, 'Webpack');
  }
  
  if (configFiles.buildTools.vite.length > 0) {
    incrementCount(result.tools, 'Vite');
  }
  
  if (configFiles.buildTools.rollup.length > 0) {
    incrementCount(result.tools, 'Rollup');
  }
  
  if (configFiles.buildTools.babel.length > 0) {
    incrementCount(result.tools, 'Babel');
  }
  
  // Process linter configurations
  if (configFiles.linters.eslint.length > 0) {
    incrementCount(result.tools, 'ESLint');
  }
  
  if (configFiles.linters.tslint.length > 0) {
    incrementCount(result.tools, 'TSLint');
  }
  
  if (configFiles.linters.stylelint.length > 0) {
    incrementCount(result.tools, 'Stylelint');
  }
  
  if (configFiles.linters.prettier.length > 0) {
    incrementCount(result.tools, 'Prettier');
  }
  
  // Process infrastructure configurations
  if (configFiles.infrastructure.docker.length > 0) {
    incrementCount(result.tools, 'Docker');
  }
  
  if (configFiles.infrastructure.nginx.length > 0) {
    incrementCount(result.tools, 'NGINX');
  }
  
  if (configFiles.infrastructure.apache.length > 0) {
    incrementCount(result.tools, 'Apache');
  }
  
  if (configFiles.infrastructure.ci.length > 0) {
    incrementCount(result.tools, 'CI/CD');
    
    // Determine which CI system is used
    for (const ciFile of configFiles.infrastructure.ci) {
      if (ciFile.includes('.travis.yml')) {
        incrementCount(result.tools, 'Travis CI');
      } else if (ciFile.includes('circle.yml')) {
        incrementCount(result.tools, 'CircleCI');
      } else if (ciFile.includes('azure-pipelines.yml')) {
        incrementCount(result.tools, 'Azure Pipelines');
      } else if (ciFile.includes('workflows') && ciFile.endsWith('.yml')) {
        incrementCount(result.tools, 'GitHub Actions');
      } else if (ciFile.includes('.gitlab-ci.yml')) {
        incrementCount(result.tools, 'GitLab CI');
      } else if (path.basename(ciFile) === 'Jenkinsfile') {
        incrementCount(result.tools, 'Jenkins');
      }
    }
  }
}

/**
 * Categorize a JavaScript library into frameworks, libraries, or databases
 * @param {string} lib - Library name
 * @param {string} version - Library version
 * @param {Object} result - Result object to update
 */
function categorizeJavaScriptLibrary(lib, version, result) {
  // Frontend frameworks
  if (['react', 'react-dom'].includes(lib)) {
    incrementCount(result.frameworks, 'React');
  } else if (lib === 'vue' || lib === '@vue/core') {
    incrementCount(result.frameworks, 'Vue.js');
  } else if (lib === 'angular' || lib.startsWith('@angular/')) {
    incrementCount(result.frameworks, 'Angular');
  } else if (lib === 'svelte') {
    incrementCount(result.frameworks, 'Svelte');
  } else if (lib === 'preact') {
    incrementCount(result.frameworks, 'Preact');
  }
  
  // Backend frameworks
  else if (lib === 'express') {
    incrementCount(result.frameworks, 'Express.js');
  } else if (lib === 'next' || lib === 'nextjs') {
    incrementCount(result.frameworks, 'Next.js');
  } else if (lib === 'nuxt' || lib === 'nuxt.js') {
    incrementCount(result.frameworks, 'Nuxt.js');
  } else if (['koa', 'fastify', 'hapi', 'nest', '@nestjs/core'].includes(lib)) {
    const frameworkMap = {
      'koa': 'Koa.js',
      'fastify': 'Fastify',
      'hapi': 'hapi',
      'nest': 'NestJS',
      '@nestjs/core': 'NestJS'
    };
    incrementCount(result.frameworks, frameworkMap[lib]);
  }
  
  // UI libraries
  else if (lib.includes('bootstrap') || lib === 'reactstrap') {
    incrementCount(result.libraries, 'Bootstrap');
  } else if (lib === 'tailwindcss' || lib.includes('tailwind')) {
    incrementCount(result.libraries, 'Tailwind CSS');
  } else if (lib === 'material-ui' || lib === '@mui/material') {
    incrementCount(result.libraries, 'Material UI');
  } else if (lib.includes('ant-design') || lib === 'antd') {
    incrementCount(result.libraries, 'Ant Design');
  }
  
  // State management
  else if (lib === 'redux' || lib.includes('redux')) {
    incrementCount(result.libraries, 'Redux');
  } else if (lib === 'mobx') {
    incrementCount(result.libraries, 'MobX');
  } else if (lib === 'zustand') {
    incrementCount(result.libraries, 'Zustand');
  } else if (lib === 'recoil') {
    incrementCount(result.libraries, 'Recoil');
  }
  
  // Databases and ORMs
  else if (lib === 'mongoose' || lib === 'mongodb') {
    incrementCount(result.databases, 'MongoDB');
  } else if (lib === 'pg' || lib === 'postgres' || lib === 'postgresql') {
    incrementCount(result.databases, 'PostgreSQL');
  } else if (lib === 'mysql' || lib === 'mysql2') {
    incrementCount(result.databases, 'MySQL');
  } else if (lib === 'sequelize') {
    incrementCount(result.libraries, 'Sequelize');
  } else if (lib === 'prisma' || lib === '@prisma/client') {
    incrementCount(result.libraries, 'Prisma');
  } else if (lib === 'typeorm') {
    incrementCount(result.libraries, 'TypeORM');
  } else if (lib === 'drizzle-orm') {
    incrementCount(result.libraries, 'Drizzle ORM');
  }
  
  // Testing
  else if (['jest', 'mocha', 'chai', 'jasmine', 'cypress', 'playwright', '@testing-library/react'].includes(lib)) {
    incrementCount(result.tools, 'Testing');
  }
  
  // Other notable libraries
  else if (lib === 'axios' || lib === 'node-fetch' || lib === 'superagent') {
    incrementCount(result.libraries, 'HTTP Client');
  } else if (lib === 'lodash' || lib === 'underscore' || lib === 'ramda') {
    incrementCount(result.libraries, 'Utility Library');
  } else if (lib === 'moment' || lib === 'dayjs' || lib === 'date-fns') {
    incrementCount(result.libraries, 'Date Handling');
  } else if (lib === 'graphql' || lib.includes('apollo')) {
    incrementCount(result.libraries, 'GraphQL');
  }
  
  // AI/ML libraries
  else if (lib === 'tensorflow' || lib.includes('tensorflow') || lib === '@tensorflow/tfjs') {
    incrementCount(result.libraries, 'TensorFlow.js');
  } else if (lib === 'ml5' || lib === 'brain.js') {
    incrementCount(result.libraries, 'Machine Learning');
  } else if (lib === 'openai' || lib === '@openai/api') {
    incrementCount(result.libraries, 'OpenAI');
  }
  
  // Other notable libraries
  else {
    incrementCount(result.libraries, lib);
  }
}

/**
 * Scan source code for additional technology clues
 * @param {string} directory - Directory to scan
 * @param {Object} result - Result object to update
 * @returns {Promise<void>}
 */
async function scanSourceCode(directory, result) {
  // Detect languages by file extension
  const extensions = await countFileExtensions(directory);
  
  // Map common extensions to languages
  const extensionMap = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.java': 'Java',
    '.go': 'Go',
    '.rs': 'Rust',
    '.cs': 'C#',
    '.cpp': 'C++',
    '.c': 'C',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.sh': 'Shell',
    '.pl': 'Perl',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'Less',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.xml': 'XML',
    '.sql': 'SQL'
  };
  
  // Update language counts based on file extensions
  for (const [ext, count] of Object.entries(extensions)) {
    if (extensionMap[ext]) {
      incrementCount(result.languages, extensionMap[ext], count);
    }
  }
  
  // Scan for database connection strings
  const dbConnectionPatterns = [
    { pattern: /mongodb(\+srv)?:\/\//i, db: 'MongoDB' },
    { pattern: /postgres(ql)?:\/\//i, db: 'PostgreSQL' },
    { pattern: /mysql:\/\//i, db: 'MySQL' },
    { pattern: /redis:\/\//i, db: 'Redis' },
    { pattern: /sqlite:\/\//i, db: 'SQLite' }
  ];
  
  await searchInFiles(directory, dbConnectionPatterns, (match, file) => {
    incrementCount(result.databases, match.db);
  });
  
  // Scan for import statements to detect frameworks
  const importPatterns = [
    { pattern: /import\s+.*\s+from\s+['"]react['"]/i, framework: 'React' },
    { pattern: /import\s+.*\s+from\s+['"]vue['"]/i, framework: 'Vue.js' },
    { pattern: /import\s+.*\s+from\s+['"]@angular\/core['"]/i, framework: 'Angular' },
    { pattern: /import\s+.*\s+from\s+['"]svelte['"]/i, framework: 'Svelte' },
    { pattern: /import\s+.*\s+from\s+['"]express['"]/i, framework: 'Express.js' },
    { pattern: /import\s+.*\s+from\s+['"]next['"]/i, framework: 'Next.js' },
    { pattern: /import\s+.*\s+from\s+['"]nuxt['"]/i, framework: 'Nuxt.js' },
    { pattern: /from\s+['"]@nestjs\/[^'"]+['"]/i, framework: 'NestJS' },
    { pattern: /import\s+.*\s+from\s+['"]django['"]/i, framework: 'Django' },
    { pattern: /import\s+.*\s+from\s+['"]flask['"]/i, framework: 'Flask' }
  ];
  
  await searchInFiles(directory, importPatterns, (match, file) => {
    incrementCount(result.frameworks, match.framework);
  });
}

/**
 * Count files by extension in a directory
 * @param {string} directory - Directory to scan
 * @returns {Promise<Object>} - Object with extension counts
 */
async function countFileExtensions(directory) {
  return new Promise((resolve, reject) => {
    const pattern = '**/*.*';
    const options = {
      cwd: directory,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
    };
    
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      const extensions = {};
      
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (ext) {
          extensions[ext] = (extensions[ext] || 0) + 1;
        }
      }
      
      resolve(extensions);
    });
  });
}

/**
 * Search for patterns in files
 * @param {string} directory - Directory to scan
 * @param {Array} patterns - Array of patterns to search for
 * @param {Function} callback - Callback function when a match is found
 * @returns {Promise<void>}
 */
async function searchInFiles(directory, patterns, callback) {
  return new Promise((resolve, reject) => {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.php', '.java', '.go', '.cs', '.env'];
    const pattern = `**/*{${extensions.join(',')}}`;
    
    const options = {
      cwd: directory,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
    };
    
    glob(pattern, options, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(directory, file), 'utf8');
          
          for (const pattern of patterns) {
            if (pattern.pattern.test(content)) {
              callback(pattern, file);
            }
          }
        } catch (error) {
          // Skip files that can't be read
          continue;
        }
      }
      
      resolve();
    });
  });
}

/**
 * Check for outdated dependencies
 * @param {Object} result - Result object to update
 * @param {string} directory - Base directory
 * @returns {Promise<void>}
 */
async function checkOutdatedDependencies(result, directory) {
  // For npm packages
  if (result.packageManagers.npm) {
    const packageFiles = await findFiles(directory, '**/package.json', ['**/node_modules/**']);
    
    for (const packageFile of packageFiles) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        
        // Check dependencies
        if (packageJson.dependencies) {
          await checkNpmDependencies(result, packageJson.dependencies);
        }
        
        // Check dev dependencies
        if (packageJson.devDependencies) {
          await checkNpmDependencies(result, packageJson.devDependencies);
        }
      } catch (error) {
        console.error(chalk.yellow(`Error checking outdated dependencies in ${packageFile}: ${error.message}`));
      }
    }
  }
}

/**
 * Check npm dependencies for outdated versions
 * @param {Object} result - Result object to update
 * @param {Object} dependencies - Dependencies object
 * @returns {Promise<void>}
 */
async function checkNpmDependencies(result, dependencies) {
  for (const [lib, versionSpec] of Object.entries(dependencies)) {
    try {
      // Skip private packages and Git/GitHub dependencies
      if (lib.startsWith('@') && lib.includes('/') && !lib.startsWith('@types/')) continue;
      if (versionSpec.includes('github:') || versionSpec.includes('git+')) continue;
      
      const version = parseVersion(versionSpec);
      
      // Check npm registry for latest version
      const latestVersion = await getLatestNpmVersion(lib);
      
      if (latestVersion && version && isOutdated(version, latestVersion)) {
        result.outdatedDependencies[lib] = {
          current: version,
          latest: latestVersion
        };
      }
    } catch (error) {
      // Silently skip errors for individual packages
      continue;
    }
  }
}

/**
 * Get the latest version of an npm package
 * @param {string} packageName - Package name
 * @returns {Promise<string|null>} - Latest version or null if not found
 */
async function getLatestNpmVersion(packageName) {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
    if (response.data && response.data['dist-tags'] && response.data['dist-tags'].latest) {
      return response.data['dist-tags'].latest;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a version is outdated
 * @param {string} current - Current version
 * @param {string} latest - Latest version
 * @returns {boolean} - True if outdated
 */
function isOutdated(current, latest) {
  // Simple semver comparison for major versions
  const currentParts = current.split('.');
  const latestParts = latest.split('.');
  
  const currentMajor = parseInt(currentParts[0], 10) || 0;
  const latestMajor = parseInt(latestParts[0], 10) || 0;
  
  if (latestMajor > currentMajor) return true;
  
  if (latestMajor === currentMajor) {
    const currentMinor = parseInt(currentParts[1], 10) || 0;
    const latestMinor = parseInt(latestParts[1], 10) || 0;
    
    if (latestMinor > currentMinor) return true;
    
    if (latestMinor === currentMinor) {
      const currentPatch = parseInt(currentParts[2], 10) || 0;
      const latestPatch = parseInt(latestParts[2], 10) || 0;
      
      return latestPatch > currentPatch;
    }
  }
  
  return false;
}

/**
 * Generate technology recommendations based on detected stack
 * @param {Object} result - Result object to update
 */
function generateRecommendations(result) {
  // Testing recommendations
  if (!result.tools.Testing) {
    if (result.frameworks.React) {
      result.recommendations.testing = {
        category: 'Testing',
        tools: ['Jest', 'React Testing Library'],
        reason: 'Testing is essential for React applications. Jest combined with React Testing Library provides a great testing solution.'
      };
    } else if (result.frameworks.Vue) {
      result.recommendations.testing = {
        category: 'Testing',
        tools: ['Vitest', 'Vue Test Utils'],
        reason: 'Testing is important for Vue.js applications. Vitest with Vue Test Utils offers excellent test capabilities.'
      };
    } else if (result.languages.JavaScript || result.languages.TypeScript) {
      result.recommendations.testing = {
        category: 'Testing',
        tools: ['Jest'],
        reason: 'Adding Jest will help ensure code quality and prevent regressions.'
      };
    } else if (result.languages.Python) {
      result.recommendations.testing = {
        category: 'Testing',
        tools: ['pytest'],
        reason: 'pytest is the most popular testing framework for Python projects.'
      };
    }
  }
  
  // Linting recommendations
  if (!result.tools.ESLint && !result.tools.TSLint && (result.languages.JavaScript || result.languages.TypeScript)) {
    result.recommendations.linting = {
      category: 'Linting',
      tools: ['ESLint'],
      reason: 'Adding ESLint will help maintain code quality and catch potential issues early.'
    };
  }
  
  // Type checking recommendations
  if (result.languages.JavaScript && !result.languages.TypeScript) {
    result.recommendations.typeChecking = {
      category: 'Type Checking',
      tools: ['TypeScript', 'JSDoc type annotations'],
      reason: 'Adding TypeScript or JSDoc type annotations can improve code quality and developer experience.'
    };
  }
  
  // CI/CD recommendations
  if (!result.tools['CI/CD']) {
    result.recommendations.cicd = {
      category: 'CI/CD',
      tools: ['GitHub Actions', 'GitLab CI', 'CircleCI'],
      reason: 'Adding continuous integration and deployment will streamline your development workflow.'
    };
  }
  
  // Security scanning recommendations
  if (!result.tools.Security) {
    if (result.packageManagers.npm || result.packageManagers.yarn) {
      result.recommendations.security = {
        category: 'Security',
        tools: ['npm audit', 'Snyk'],
        reason: 'Regularly scanning dependencies for vulnerabilities is important for security.'
      };
    } else if (result.languages.Python) {
      result.recommendations.security = {
        category: 'Security',
        tools: ['Bandit', 'Safety'],
        reason: 'Adding security scanning tools will help identify potential vulnerabilities.'
      };
    }
  }
  
  // Formatting recommendations
  if (!result.tools.Prettier && (result.languages.JavaScript || result.languages.TypeScript)) {
    result.recommendations.formatting = {
      category: 'Code Formatting',
      tools: ['Prettier'],
      reason: 'Prettier will help maintain consistent code formatting across your codebase.'
    };
  }
  
  // Documentation recommendations
  result.recommendations.documentation = {
    category: 'Documentation',
    tools: ['JSDoc', 'TypeDoc', 'Sphinx', 'ReadTheDocs'],
    reason: 'Implementing clear and thorough documentation is essential for maintainable code.'
  };
}

/**
 * Generate HTML output for tech stack detection
 * @param {Object} result - Tech stack information
 * @returns {string} - HTML output
 */
function generateHtmlOutput(result) {
  // Create sections for each category
  const languagesSection = generateHTMLSection('Languages', result.languages);
  const frameworksSection = generateHTMLSection('Frameworks', result.frameworks);
  const librariesSection = generateHTMLSection('Libraries', result.libraries);
  const databasesSection = generateHTMLSection('Databases', result.databases);
  const toolsSection = generateHTMLSection('Tools', result.tools);
  const packageManagersSection = generateHTMLSection('Package Managers', result.packageManagers);
  
  // Outdated dependencies section
  let outdatedSection = '';
  if (Object.keys(result.outdatedDependencies).length > 0) {
    outdatedSection = `
      <div class="section">
        <h2>Outdated Dependencies</h2>
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Current Version</th>
              <th>Latest Version</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(result.outdatedDependencies).map(([lib, info]) => `
              <tr>
                <td>${lib}</td>
                <td>${info.current}</td>
                <td>${info.latest}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  // Recommendations section
  let recommendationsSection = '';
  if (Object.keys(result.recommendations).length > 0) {
    recommendationsSection = `
      <div class="section">
        <h2>Recommendations</h2>
        ${Object.values(result.recommendations).map(rec => `
          <div class="recommendation">
            <h3>${rec.category}</h3>
            <p>${rec.reason}</p>
            <ul>
              ${rec.tools.map(tool => `<li>${tool}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tech Stack Detection - CodeInsight AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    
    h1, h2, h3 {
      color: #0077cc;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .section {
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      padding: 20px;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .card {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .count {
      display: inline-block;
      background-color: #0077cc;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      margin-left: 5px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    
    th {
      background-color: #f8f9fa;
    }
    
    .recommendation {
      background-color: #e9f5ff;
      border-left: 4px solid #0077cc;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 0 5px 5px 0;
    }
    
    .recommendation h3 {
      margin-top: 0;
    }
    
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <h1>Tech Stack Detection</h1>
  
  ${languagesSection}
  ${frameworksSection}
  ${librariesSection}
  ${databasesSection}
  ${toolsSection}
  ${packageManagersSection}
  ${outdatedSection}
  ${recommendationsSection}
  
  <div class="section">
    <p>Generated with ❤️ by CodeInsight AI</p>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML section for a category
 * @param {string} title - Section title
 * @param {Object} items - Section items
 * @returns {string} - HTML section
 */
function generateHTMLSection(title, items) {
  if (Object.keys(items).length === 0) return '';
  
  return `
    <div class="section">
      <h2>${title}</h2>
      <div class="grid">
        ${Object.entries(items)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([name, info]) => `
            <div class="card">
              <h3>${name}<span class="count">${info.count}</span></h3>
              ${info.version ? `<p>Version: ${info.version}</p>` : ''}
            </div>
          `).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate Markdown output for tech stack detection
 * @param {Object} result - Tech stack information
 * @returns {string} - Markdown output
 */
function generateMarkdownOutput(result) {
  let markdown = `# Tech Stack Detection\n\n`;
  
  // Languages section
  if (Object.keys(result.languages).length > 0) {
    markdown += `## Languages\n\n`;
    Object.entries(result.languages)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([lang, info]) => {
        markdown += `- **${lang}** (${info.count})\n`;
      });
    markdown += '\n';
  }
  
  // Frameworks section
  if (Object.keys(result.frameworks).length > 0) {
    markdown += `## Frameworks\n\n`;
    Object.entries(result.frameworks)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([framework, info]) => {
        markdown += `- **${framework}** (${info.count})\n`;
      });
    markdown += '\n';
  }
  
  // Libraries section
  if (Object.keys(result.libraries).length > 0) {
    markdown += `## Libraries\n\n`;
    Object.entries(result.libraries)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([lib, info]) => {
        markdown += `- **${lib}** (${info.count})\n`;
      });
    markdown += '\n';
  }
  
  // Databases section
  if (Object.keys(result.databases).length > 0) {
    markdown += `## Databases\n\n`;
    Object.entries(result.databases)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([db, info]) => {
        markdown += `- **${db}** (${info.count})\n`;
      });
    markdown += '\n';
  }
  
  // Tools section
  if (Object.keys(result.tools).length > 0) {
    markdown += `## Tools\n\n`;
    Object.entries(result.tools)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([tool, info]) => {
        markdown += `- **${tool}** (${info.count})\n`;
      });
    markdown += '\n';
  }
  
  // Package managers section
  if (Object.keys(result.packageManagers).length > 0) {
    markdown += `## Package Managers\n\n`;
    Object.entries(result.packageManagers)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([manager, info]) => {
        markdown += `- **${manager}** (${info.count})\n`;
      });
    markdown += '\n';
  }
  
  // Outdated dependencies section
  if (Object.keys(result.outdatedDependencies).length > 0) {
    markdown += `## Outdated Dependencies\n\n`;
    markdown += `| Package | Current Version | Latest Version |\n`;
    markdown += `| ------- | --------------- | -------------- |\n`;
    Object.entries(result.outdatedDependencies).forEach(([lib, info]) => {
      markdown += `| ${lib} | ${info.current} | ${info.latest} |\n`;
    });
    markdown += '\n';
  }
  
  // Recommendations section
  if (Object.keys(result.recommendations).length > 0) {
    markdown += `## Recommendations\n\n`;
    Object.values(result.recommendations).forEach(rec => {
      markdown += `### ${rec.category}\n\n`;
      markdown += `${rec.reason}\n\n`;
      markdown += `Recommended tools:\n`;
      rec.tools.forEach(tool => {
        markdown += `- ${tool}\n`;
      });
      markdown += '\n';
    });
  }
  
  markdown += `---\n\nGenerated with ❤️ by CodeInsight AI\n`;
  
  return markdown;
}

/**
 * Utility function to find files
 * @param {string} directory - Directory to search
 * @param {string} pattern - Glob pattern
 * @param {string[]} ignore - Patterns to ignore
 * @returns {Promise<string[]>} - List of matching files
 */
async function findFiles(directory, pattern, ignore = []) {
  return new Promise((resolve, reject) => {
    glob(pattern, { cwd: directory, ignore, absolute: true }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

/**
 * Utility function to increment a count in a result object
 * @param {Object} obj - Object to update
 * @param {string} key - Key to increment
 * @param {number} amount - Amount to increment by (default: 1)
 */
function incrementCount(obj, key, amount = 1) {
  if (!key) return;
  
  if (!obj[key]) {
    obj[key] = { count: 0 };
  }
  
  obj[key].count += amount;
}

/**
 * Utility function to parse a version string
 * @param {string} version - Version string
 * @returns {string} - Cleaned version string
 */
function parseVersion(version) {
  if (!version) return 'unknown';
  
  // Handle npm/semver style version ranges
  if (version.startsWith('^') || version.startsWith('~')) {
    return version.substring(1);
  }
  
  // Handle version ranges
  if (version.includes(' - ')) {
    return version.split(' - ')[1];
  }
  
  if (version.includes('||')) {
    return version.split('||').pop().trim();
  }
  
  return version;
}

/**
 * Utility function to capitalize the first letter of a string
 * @param {string} str - Input string
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Utility function to get database name from Python library
 * @param {string} lib - Python library name
 * @returns {string} - Database name
 */
function getDatabaseFromPythonLib(lib) {
  const dbMap = {
    'sqlalchemy': 'SQL',
    'psycopg2': 'PostgreSQL',
    'pymysql': 'MySQL',
    'pymongo': 'MongoDB',
    'redis': 'Redis'
  };
  
  return dbMap[lib] || 'SQL';
}

module.exports = {
  detectTechStack
};