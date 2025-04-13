import OpenAI from "openai";
import { splitContentIntoChunks, addChunkMetadata, estimateTokenCount } from "./chunker";

// Default model
const DEFAULT_MODEL = "gpt-4o";

/**
 * Options for batch processing
 */
export interface BatchProcessingOptions {
  // Maximum content size per chunk in characters
  maxChunkSize?: number;
  
  // How many chunks to process in parallel
  concurrency?: number;
  
  // OpenAI model to use
  model?: string;
  
  // Maximum tokens for completion
  maxTokens?: number;
  
  // System prompt to use
  systemPrompt?: string;
  
  // User prompt template ({{content}} will be replaced with chunk content)
  promptTemplate?: string;
  
  // Callback for progress updates
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Result of batch processing
 */
export interface BatchProcessingResult {
  // Combined results from all chunks
  combinedResult: string;
  
  // Individual results from each chunk
  chunkResults: string[];
  
  // Metrics about the processing
  metrics: {
    totalChunks: number;
    totalInputCharacters: number;
    totalOutputCharacters: number;
    estimatedInputTokens: number;
    processingTimeMs: number;
  };
}

/**
 * Process a large codebase in batches by splitting into chunks and sending to OpenAI API
 * 
 * @param content The code content to process
 * @param openai OpenAI instance to use
 * @param options Processing options
 * @returns The combined results and metrics
 */
export async function processBatch(
  content: string,
  openai: OpenAI,
  options: BatchProcessingOptions = {}
): Promise<BatchProcessingResult> {
  const startTime = Date.now();
  
  // Apply defaults
  const {
    maxChunkSize = 120000,
    concurrency = 3,
    model = DEFAULT_MODEL,
    maxTokens = 4000,
    systemPrompt = "You are an expert software developer analyzing code.",
    promptTemplate = "Please analyze the following code:\n\n{{content}}",
    onProgress = () => {},
  } = options;
  
  // Split content into chunks
  const chunks = splitContentIntoChunks(content, maxChunkSize);
  const chunksWithMetadata = addChunkMetadata(chunks, chunks.length);
  
  // Process chunks with limited concurrency
  const results: string[] = [];
  let completedChunks = 0;
  
  // Process chunks in batches based on concurrency
  for (let i = 0; i < chunksWithMetadata.length; i += concurrency) {
    const batch = chunksWithMetadata.slice(i, i + concurrency);
    const batchPromises = batch.map(async (chunk, batchIndex) => {
      const chunkIndex = i + batchIndex + 1; // Calculate the actual chunk index
      
      // Replace template variables
      let chunkPrompt = promptTemplate.replace("{{content}}", chunk);
      chunkPrompt = chunkPrompt.replace("{{chunkIndex}}", chunkIndex.toString());
      chunkPrompt = chunkPrompt.replace("{{totalChunks}}", chunksWithMetadata.length.toString());
      
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: chunkPrompt }
          ],
          max_tokens: maxTokens,
        });
        
        const result = response.choices[0]?.message?.content || "";
        
        // Report progress
        completedChunks++;
        onProgress(completedChunks, chunksWithMetadata.length);
        
        return result;
      } catch (error: any) {
        console.error(`Error processing chunk ${i}:`, error);
        return `Error processing chunk: ${error.message || 'Unknown error'}`;
      }
    });
    
    // Wait for this batch to complete before starting the next batch
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  // Combine results
  const combinedResult = combineResults(results, chunks.length);
  
  // Calculate metrics
  const metrics = {
    totalChunks: chunks.length,
    totalInputCharacters: content.length,
    totalOutputCharacters: combinedResult.length,
    estimatedInputTokens: estimateTokenCount(content),
    processingTimeMs: Date.now() - startTime,
  };
  
  return {
    combinedResult,
    chunkResults: results,
    metrics,
  };
}

/**
 * Combine multiple chunk results into a single coherent output
 */
function combineResults(results: string[], totalChunks: number): string {
  // Basic combination - just add separators
  if (results.length === 1) {
    return results[0];
  }
  
  return results.map((result, i) => {
    return `
---- PART ${i + 1} OF ${totalChunks} ----

${result}`;
  }).join('\n\n');
}

/**
 * Helper function to process architectural documentation in batch mode
 */
export async function generateArchitecturalDocBatched(
  codeContent: string,
  openai: OpenAI
): Promise<BatchProcessingResult> {
  return processBatch(codeContent, openai, {
    systemPrompt: "You are an experienced software architect who specializes in creating clear, detailed architectural documentation.",
    promptTemplate: `
    Please analyze the following repository code chunk and generate a comprehensive architectural documentation.
    Focus on the overall structure, key components, design patterns, and how different parts of the system interact.
    Format the output as markdown with proper headings, code blocks, and bullet points as needed.
    
    This is chunk {{chunkIndex}} of {{totalChunks}} total chunks from the repository.
    
    Code:
    {{content}}
    `,
    maxTokens: 4000,
    onProgress: (completed, total) => {
      console.log(`Architectural documentation: ${completed}/${total} chunks processed`);
    }
  });
}

/**
 * Helper function to process user stories in batch mode
 */
export async function generateUserStoriesBatched(
  codeContent: string,
  openai: OpenAI
): Promise<BatchProcessingResult> {
  return processBatch(codeContent, openai, {
    systemPrompt: "You are a product manager who specializes in creating detailed user stories from technical implementations.",
    promptTemplate: `
    Please analyze the following repository code chunk and generate user stories that describe the functionality from an end-user perspective.
    Include acceptance criteria for each story when possible.
    Format the output as markdown with proper headings and structure.
    
    This is chunk {{chunkIndex}} of {{totalChunks}} total chunks from the repository.
    
    Code:
    {{content}}
    `,
    maxTokens: 4000,
    onProgress: (completed, total) => {
      console.log(`User stories: ${completed}/${total} chunks processed`);
    }
  });
}

/**
 * Helper function to process custom analysis in batch mode
 */
export async function generateCustomAnalysisBatched(
  codeContent: string,
  customPrompt: string,
  openai: OpenAI
): Promise<BatchProcessingResult> {
  return processBatch(codeContent, openai, {
    systemPrompt: "You are an AI assistant specialized in code analysis and documentation generation.",
    promptTemplate: `
    Please analyze the following repository code chunk and respond to this specific request:
    
    ${customPrompt}
    
    This is chunk {{chunkIndex}} of {{totalChunks}} total chunks from the repository.
    
    Code:
    {{content}}
    `,
    maxTokens: 4000,
    onProgress: (completed, total) => {
      console.log(`Custom analysis: ${completed}/${total} chunks processed`);
    }
  });
}

/**
 * Helper function to generate code story in batch mode
 */
export async function generateCodeStoryBatched(
  codeContent: string,
  complexity: 'simple' | 'moderate' | 'detailed' = 'moderate',
  openai: OpenAI
): Promise<BatchProcessingResult> {
  // Customize the prompt based on complexity level
  let detailLevel = '';
  switch(complexity) {
    case 'simple':
      detailLevel = 'Keep explanations simple and beginner-friendly, focusing on high-level concepts rather than implementation details.';
      break;
    case 'moderate':
      detailLevel = 'Balance technical details with narrative storytelling, making the code approachable to intermediate programmers.';
      break;
    case 'detailed':
      detailLevel = 'Include detailed explanations of algorithms, patterns, and technical concepts, suitable for experienced developers.';
      break;
  }

  return processBatch(codeContent, openai, {
    systemPrompt: "You are a master programmer and storyteller who excels at explaining complex code through narrative storytelling.",
    promptTemplate: `
    Please analyze the following code chunk and create a narrative "Code Story" that explains the complex structures and logic in an engaging, storytelling format.
    ${detailLevel}
    
    Use analogies, metaphors, and storytelling elements to make the code understandable.
    Focus on the "why" behind design decisions, not just the "what" and "how".
    Format the output as markdown with proper headings, code blocks for key examples, and narrative sections.
    
    This is chunk {{chunkIndex}} of {{totalChunks}} total chunks from the repository.
    
    Code:
    {{content}}
    `,
    maxTokens: 4000,
    onProgress: (completed, total) => {
      console.log(`Code story: ${completed}/${total} chunks processed`);
    }
  });
}