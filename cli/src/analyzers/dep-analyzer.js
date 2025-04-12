/**
 * CodeInsight AI - Dependency Analyzer
 * 
 * This file contains utilities for analyzing dependencies between files in a codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

/**
 * Analyze dependencies between files in a repository
 * @param {Object} options - Configuration options
 * @param {string} options.directory - Directory to analyze
 * @param {string} options.output - Output format (dot, json, or html)
 * @param {number} options.depth - Maximum depth for dependency analysis
 * @param {string} options.filter - Pattern to filter files (glob syntax)
 * @param {string} options.exclude - Pattern to exclude files (glob syntax)
 * @param {boolean} options.highlightCircular - Whether to highlight circular dependencies
 * @param {boolean} options.showExternal - Whether to include external dependencies
 * @returns {Promise<Object>} - Dependency analysis results
 */
async function analyzeDependencies(options) {
  const {
    directory = '.',
    output = 'html',
    depth = 10,
    filter,
    exclude,
    highlightCircular = false,
    showExternal = false
  } = options;

  // Find all files to analyze
  const files = await findFilesToAnalyze(directory, filter, exclude);

  // Parse imports from each file
  const dependencies = {};
  const circularDeps = [];

  for (const file of files) {
    const relativePath = path.relative(directory, file);
    dependencies[relativePath] = {
      imports: await parseImports(file, files, directory, showExternal),
      importedBy: []
    };
  }

  // Build the dependency graph
  buildDependencyGraph(dependencies);

  // Detect circular dependencies if requested
  if (highlightCircular) {
    detectCircularDependencies(dependencies, circularDeps);
  }

  // Generate output based on the requested format
  let result;
  switch (output) {
    case 'dot':
      result = generateDotOutput(dependencies, circularDeps);
      break;
    case 'json':
      result = generateJsonOutput(dependencies, circularDeps);
      break;
    case 'html':
    default:
      result = generateHtmlOutput(dependencies, circularDeps);
      break;
  }

  return {
    dependencies,
    circularDependencies: circularDeps,
    result
  };
}

/**
 * Find all files to analyze in the repository
 * @param {string} directory - Directory to analyze
 * @param {string} filterPattern - Pattern to filter files (glob syntax)
 * @param {string} excludePattern - Pattern to exclude files (glob syntax)
 * @returns {Promise<string[]>} - List of file paths to analyze
 */
async function findFilesToAnalyze(directory, filterPattern, excludePattern) {
  return new Promise((resolve, reject) => {
    const pattern = filterPattern || '**/*.{js,jsx,ts,tsx,py,java,go,rb,php}';
    const options = {
      cwd: directory,
      ignore: excludePattern ? excludePattern.split(',') : [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**'
      ],
      absolute: true
    };

    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

/**
 * Parse imports from a file
 * @param {string} filePath - Path to the file
 * @param {string[]} allFiles - List of all files in the repository
 * @param {string} baseDir - Base directory for resolving relative imports
 * @param {boolean} includeExternal - Whether to include external dependencies
 * @returns {Promise<string[]>} - List of import paths
 */
async function parseImports(filePath, allFiles, baseDir, includeExternal) {
  // This is a placeholder implementation that needs to be expanded
  // for different file types and import patterns
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    const ext = path.extname(filePath).toLowerCase();

    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      // JavaScript/TypeScript imports
      const importRegex = /import\s+(?:[\w*{},\s]+from\s+)?['"]([^'"]+)['"]/g;
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(resolveImportPath(match[1], filePath, baseDir, allFiles, includeExternal));
      }

      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(resolveImportPath(match[1], filePath, baseDir, allFiles, includeExternal));
      }
    } else if (ext === '.py') {
      // Python imports
      const importRegex = /(?:from\s+(\S+)\s+import\s+\S+|import\s+(\S+))/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        imports.push(resolveImportPath(importPath.replace(/\./g, '/'), filePath, baseDir, allFiles, includeExternal));
      }
    }
    // More languages can be added here...

    // Filter out null values and return unique imports
    return [...new Set(imports.filter(Boolean))];
  } catch (error) {
    console.error(chalk.red(`Error parsing imports from ${filePath}: ${error.message}`));
    return [];
  }
}

/**
 * Resolve an import path to an actual file path
 * @param {string} importPath - The import path
 * @param {string} sourceFile - The file containing the import
 * @param {string} baseDir - Base directory for resolving relative imports
 * @param {string[]} allFiles - List of all files in the repository
 * @param {boolean} includeExternal - Whether to include external dependencies
 * @returns {string|null} - Resolved file path or null if external and not included
 */
function resolveImportPath(importPath, sourceFile, baseDir, allFiles, includeExternal) {
  // Handle relative vs. absolute imports
  if (importPath.startsWith('.')) {
    // Relative import
    const sourceDir = path.dirname(sourceFile);
    const resolvedPath = path.resolve(sourceDir, importPath);
    
    // Try to find the exact file
    const exactMatch = allFiles.find(file => file === resolvedPath);
    if (exactMatch) return path.relative(baseDir, exactMatch);
    
    // Try with extensions
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php'];
    for (const ext of extensions) {
      const withExt = `${resolvedPath}${ext}`;
      const match = allFiles.find(file => file === withExt);
      if (match) return path.relative(baseDir, match);
    }
    
    // Try as directory with index file
    for (const ext of extensions) {
      const indexFile = path.join(resolvedPath, `index${ext}`);
      const match = allFiles.find(file => file === indexFile);
      if (match) return path.relative(baseDir, match);
    }
  } else {
    // External dependency
    if (includeExternal) {
      return `external:${importPath}`;
    }
  }
  
  return null;
}

/**
 * Build the dependency graph by filling in importedBy references
 * @param {Object} dependencies - The dependencies object
 */
function buildDependencyGraph(dependencies) {
  for (const [file, data] of Object.entries(dependencies)) {
    for (const importPath of data.imports) {
      if (dependencies[importPath]) {
        dependencies[importPath].importedBy.push(file);
      }
    }
  }
}

/**
 * Detect circular dependencies in the graph
 * @param {Object} dependencies - The dependencies object
 * @param {Array} circularDeps - Array to populate with circular dependencies
 */
function detectCircularDependencies(dependencies, circularDeps) {
  for (const [file, data] of Object.entries(dependencies)) {
    findCircularPath(file, file, new Set(), dependencies, circularDeps);
  }
}

/**
 * Recursively find circular paths in the dependency graph
 * @param {string} startFile - The starting file
 * @param {string} currentFile - The current file in the traversal
 * @param {Set} visited - Set of visited files
 * @param {Object} dependencies - The dependencies object
 * @param {Array} circularDeps - Array to populate with circular dependencies
 */
function findCircularPath(startFile, currentFile, visited, dependencies, circularDeps) {
  // Get dependencies of the current file
  const deps = dependencies[currentFile]?.imports || [];
  
  for (const dep of deps) {
    if (dep === startFile) {
      // Found a circular dependency
      const cycle = [...visited, currentFile, startFile];
      const cycleKey = cycle.sort().join('->');
      if (!circularDeps.some(c => c.key === cycleKey)) {
        circularDeps.push({
          key: cycleKey,
          path: [currentFile, startFile]
        });
      }
      return;
    }
    
    if (dependencies[dep] && !visited.has(dep)) {
      visited.add(currentFile);
      findCircularPath(startFile, dep, new Set(visited), dependencies, circularDeps);
    }
  }
}

/**
 * Generate DOT format output for visualization with Graphviz
 * @param {Object} dependencies - The dependencies object
 * @param {Array} circularDeps - Array of circular dependencies
 * @returns {string} - The DOT format string
 */
function generateDotOutput(dependencies, circularDeps) {
  let dot = 'digraph dependencies {\n';
  dot += '  node [shape=box, style="filled", fillcolor="#f0f0f0"];\n';
  
  // Add nodes
  for (const file of Object.keys(dependencies)) {
    // Skip external dependencies
    if (file.startsWith('external:')) continue;
    
    // Create a label that's more readable
    const label = file.replace(/\\/g, '/');
    dot += `  "${file}" [label="${label}"];\n`;
  }
  
  // Add edges
  for (const [file, data] of Object.entries(dependencies)) {
    // Skip external dependencies
    if (file.startsWith('external:')) continue;
    
    for (const importPath of data.imports) {
      // Skip external dependencies
      if (importPath.startsWith('external:')) continue;
      
      // Check if this is part of a circular dependency
      const isCircular = circularDeps.some(
        c => (c.path[0] === file && c.path[1] === importPath) || 
             (c.path[0] === importPath && c.path[1] === file)
      );
      
      if (isCircular) {
        dot += `  "${file}" -> "${importPath}" [color="red", penwidth=2.0];\n`;
      } else {
        dot += `  "${file}" -> "${importPath}";\n`;
      }
    }
  }
  
  dot += '}\n';
  return dot;
}

/**
 * Generate JSON format output
 * @param {Object} dependencies - The dependencies object
 * @param {Array} circularDeps - Array of circular dependencies
 * @returns {string} - The JSON string
 */
function generateJsonOutput(dependencies, circularDeps) {
  const result = {
    nodes: [],
    edges: [],
    circularDependencies: circularDeps
  };
  
  // Add nodes
  for (const file of Object.keys(dependencies)) {
    if (!file.startsWith('external:')) {
      result.nodes.push({
        id: file,
        label: file,
        type: 'file'
      });
    }
  }
  
  // Add edges
  for (const [file, data] of Object.entries(dependencies)) {
    if (file.startsWith('external:')) continue;
    
    for (const importPath of data.imports) {
      if (importPath.startsWith('external:')) {
        // Add external node if it doesn't exist
        const nodeExists = result.nodes.some(n => n.id === importPath);
        if (!nodeExists) {
          result.nodes.push({
            id: importPath,
            label: importPath.replace('external:', ''),
            type: 'external'
          });
        }
      }
      
      // Check if this is part of a circular dependency
      const isCircular = circularDeps.some(
        c => (c.path[0] === file && c.path[1] === importPath) || 
             (c.path[0] === importPath && c.path[1] === file)
      );
      
      result.edges.push({
        source: file,
        target: importPath,
        isCircular
      });
    }
  }
  
  return JSON.stringify(result, null, 2);
}

/**
 * Generate HTML visualization using D3.js
 * @param {Object} dependencies - The dependencies object
 * @param {Array} circularDeps - Array of circular dependencies
 * @returns {string} - The HTML string
 */
function generateHtmlOutput(dependencies, circularDeps) {
  // Convert dependencies to JSON for embedding in the HTML
  const jsonData = generateJsonOutput(dependencies, circularDeps);
  
  // Create an HTML template with D3.js visualization
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Graph - CodeInsight AI</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    #graph {
      width: 100vw;
      height: 100vh;
    }
    .node {
      fill: #f0f0f0;
      stroke: #999;
      stroke-width: 1px;
    }
    .node.external {
      fill: #e1f5fe;
    }
    .node:hover {
      fill: #ddd;
      cursor: pointer;
    }
    .node.selected {
      fill: #ffecb3;
      stroke: #ff9800;
      stroke-width: 2px;
    }
    .link {
      stroke: #999;
      stroke-opacity: 0.6;
      stroke-width: 1px;
    }
    .link.circular {
      stroke: #e53935;
      stroke-width: 2px;
    }
    .node-label {
      font-size: 10px;
      pointer-events: none;
    }
    .controls {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    button {
      margin: 5px;
      padding: 5px 10px;
      border: none;
      background: #0077cc;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #005fa3;
    }
    .tooltip {
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      max-width: 300px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="controls">
    <button id="zoomIn">Zoom In</button>
    <button id="zoomOut">Zoom Out</button>
    <button id="resetView">Reset View</button>
    <button id="toggleCircular">Highlight Circular Dependencies</button>
    <div>
      <label for="search">Search: </label>
      <input type="text" id="search" placeholder="Enter file name...">
    </div>
  </div>
  <div id="graph"></div>
  <div class="tooltip" id="tooltip"></div>
  
  <script>
    // Dependency graph data
    const graphData = ${jsonData};
    
    // Set up the visualization
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Create the SVG container
    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Create a container for the graph
    const g = svg.append('g');
    
    // Create a force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    // Create the links
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.edges)
      .enter()
      .append('line')
      .attr('class', d => 'link' + (d.isCircular ? ' circular' : ''))
      .attr('marker-end', 'url(#arrowhead)');
    
    // Create the nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('class', d => 'node' + (d.type === 'external' ? ' external' : ''))
      .attr('r', 6)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Add labels to the nodes
    const label = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('dx', 10)
      .attr('dy', 4)
      .text(d => {
        // Shorten the label for readability
        const parts = d.label.split('/');
        return parts.length > 1 ? '...' + parts.slice(-2).join('/') : d.label;
      });
    
    // Create the tooltip
    const tooltip = d3.select('#tooltip');
    
    // Add hover effects
    node.on('mouseover', (event, d) => {
      tooltip.html(\`
        <strong>File:</strong> \${d.label}<br>
        <strong>Type:</strong> \${d.type === 'external' ? 'External Dependency' : 'Local File'}<br>
        <strong>Imports:</strong> \${countImports(d.id)}<br>
        <strong>Imported By:</strong> \${countImportedBy(d.id)}
      \`)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY + 10) + 'px')
      .style('opacity', 1);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    })
    .on('click', (event, d) => {
      // Toggle selection
      node.classed('selected', false);
      d3.select(event.currentTarget).classed('selected', true);
      
      // Highlight connections
      link
        .attr('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);
      
      // After a delay, reset opacity
      setTimeout(() => {
        link.attr('opacity', 1);
      }, 3000);
    });
    
    // Helpers for tooltip
    function countImports(nodeId) {
      return graphData.edges.filter(e => e.source.id === nodeId || e.source === nodeId).length;
    }
    
    function countImportedBy(nodeId) {
      return graphData.edges.filter(e => e.target.id === nodeId || e.target === nodeId).length;
    }
    
    // Update positions on each tick of the simulation
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Controls
    d3.select('#zoomIn').on('click', () => {
      svg.transition().call(zoom.scaleBy, 1.5);
    });
    
    d3.select('#zoomOut').on('click', () => {
      svg.transition().call(zoom.scaleBy, 0.75);
    });
    
    d3.select('#resetView').on('click', () => {
      svg.transition().call(zoom.transform, d3.zoomIdentity);
    });
    
    d3.select('#toggleCircular').on('click', () => {
      const links = d3.selectAll('.link.circular');
      const current = links.style('stroke');
      links.style('stroke', current === 'rgb(229, 57, 53)' ? '#999' : '#e53935');
    });
    
    // Search functionality
    d3.select('#search').on('input', function() {
      const query = this.value.toLowerCase();
      if (query) {
        node.attr('opacity', d => d.label.toLowerCase().includes(query) ? 1 : 0.2);
        label.attr('opacity', d => d.label.toLowerCase().includes(query) ? 1 : 0.2);
      } else {
        node.attr('opacity', 1);
        label.attr('opacity', 1);
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  analyzeDependencies
};