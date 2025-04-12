import { apiRequest } from "./queryClient";

export interface RepositoryAnalysisResult {
  repository: {
    id: number;
    name: string;
    path: string;
    analyzed_at: string;
    files_count: number;
    code_size: number;
  };
  stats: {
    totalFiles: number;
    includedFiles: number;
    excludedFiles: number;
    totalSizeBytes: number;
    includedSizeBytes: number;
    fileTypes: Record<string, number>;
  };
  outputFile: string;
}

export interface AnalysisResult {
  analysis: {
    id: number;
    repository_id: number;
    type: string;
    content: string;
    ai_model: string;
    created_at: string;
  };
  content: string;
}

/**
 * Extract all code files from a repository
 */
export async function extractRepositoryCode(options: {
  directory: string;
  exclude?: string[];
  maxSize?: number;
}): Promise<RepositoryAnalysisResult> {
  const response = await apiRequest("POST", "/api/repositories/scrape", options);
  return await response.json();
}

/**
 * Generate documentation using OpenAI
 */
export async function generateDocumentation(options: {
  repository_id: number;
  code_content: string;
  type: "architecture" | "user_stories" | "custom";
  custom_prompt?: string;
  api_key?: string;
}): Promise<AnalysisResult> {
  const response = await apiRequest("POST", "/api/analyses/generate", options);
  return await response.json();
}

/**
 * Get all repositories
 */
export async function getRepositories() {
  const response = await apiRequest("GET", "/api/repositories", undefined);
  return await response.json();
}

/**
 * Get all analyses
 */
export async function getAnalyses() {
  const response = await apiRequest("GET", "/api/analyses", undefined);
  return await response.json();
}

/**
 * Get analyses for a specific repository
 */
export async function getRepositoryAnalyses(repositoryId: number) {
  const response = await apiRequest("GET", `/api/repositories/${repositoryId}/analyses`, undefined);
  return await response.json();
}

/**
 * Format bytes to a human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default {
  extractRepositoryCode,
  generateDocumentation,
  getRepositories,
  getAnalyses,
  getRepositoryAnalyses,
  formatBytes,
  formatDate,
};
